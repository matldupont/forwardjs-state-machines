import React from "react";
import { useMachine } from "@xstate/react";
import { Button } from "@rebeldotcom/components";
import { addToCartMachine } from "./add-to-cart.machine.ts";

const AddToCartButton = ({ id, itemCode }) => {
  const [current, send] = useMachine(addToCartMachine(id));

  const notInCart = current.matches("notInCart");
  const addingToCart = current.matches("addingToCart");
  const errorAddingToCart = current.matches("errorAddingToCart");
  const inCart = current.matches("inCart");
  const removingFromCart = current.matches("removingFromCart");
  const errorRemovingFromCart = current.matches("errorRemovingFromCart");

  const getButtonContent = () => {
    if (addingToCart) return "Adding...";
    if (removingFromCart) return "Removing...";
    if (errorAddingToCart || errorRemovingFromCart) return "Try again";
    if (inCart) return "In Cart";
    return cta;
  };

  const onButtonClick = () => {
    if (notInCart) {
      send("add-to-cart", {
        endpoint,
        payload: {
          itemCode,
        },
        to: id,
      });
    }

    if (errorAddingToCart) {
      send("retry-add-to-cart", {
        endpoint,
        payload: {
          itemCode,
        },
        to: id,
      });
    }

    if (inCart) {
      send("remove-from-cart", {
        endpoint,
        payload: {
          itemCode,
        },
        to: id,
      });
    }
  };

  return (
    <Button id={id} onClick={onButtonClick}>
      {getButtonContent()}
    </Button>
  );
};

ProductCardGrid.propTypes = propTypes;

export { ProductCardGrid };
