import { Machine, assign } from "xstate";
import {
  trackEvent,
  ANALYTICS_EVENTS,
  ANALYTICS_CATEGORIES,
  ANALYTICS_PATHS,
} from "../../analytics/event";

// ACTIONS

const addItemToCart = (ctx, evt) => {
  return get(createEndpoint(evt.endpoint));
};

const cartEvents = {
  ADD_TO_CART: "add-to-cart",
  REMOVE_FROM_CART: "remove-from-cart",
  RETRY_ADD_TO_CART: "retry-add-to-cart",
  RETRY_REMOVE_FROM_CART: "retry-remove-from-cart",
};

const addToCartOpts = {
  services: {
    addItemToCart,
  },
  actions: {
    trackAddToCart: (ctx, evt) => {
      trackEvent({
        event: ANALYTICS_EVENTS.addToCart,
        eventCategory: ANALYTICS_CATEGORIES.purchase,
        data: {
          host: RESELLER,
          path: ANALYTICS_PATHS.customize,
          ecommerce: {
            products: [
              {
                itemCode: evt.payload.itemCode,
                itemDescription: evt.payload.itemDescription,
                product: evt.payload.product,
                amount: evt.payload.amount,
              },
            ],
          },
        },
      });
    },
  },
  guards: {},
};

const addToCartMachine = (id) =>
  Machine(
    {
      id,
      initial: "notInCart",
      states: {
        notInCart: {
          on: {
            [cartEvents.ADD_TO_CART]: "addingToCart",
          },
        },
        errorAddingToCart: {
          on: {
            [cartEvents.RETRY_ADD_TO_CART]: "addingToCart",
          },
        },
        addingToCart: {
          entry: "trackAddToCart",
          invoke: {
            src: "addItemToCart",
            onDone: {
              target: "inCart",
            },
            onError: {
              target: "errorAddingToCart",
            },
          },
        },
        inCart: {
          on: {
            [cartEvents.REMOVE_FROM_CART]: "removingFromCart",
          },
        },
        removingFromCart: {
          invoke: {
            src: "removeItemFromCart",
            onDone: {
              target: "notInCart",
            },
            onError: {
              target: "errorRemovingFromCart",
            },
          },
        },
        errorRemovingFromCart: {},
      },
    },
    addToCartOpts
  );

export { addToCartMachine };
