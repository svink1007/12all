import {
  REMOVE_IN_APP_OWNER,
  SET_IN_APP_PRODUCTS,
  UPDATE_IN_APP_OWNER,
  UPDATE_IN_APP_PRODUCT,
} from "../types/types";
import { Action, InAppProduct } from "../types";
import { IAPProduct } from "@ionic-native/in-app-purchase-2";

const INITIAL: InAppProduct = {
  products: [],
  ownedProduct: null,
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<IAPProduct | IAPProduct[]>
) {
  switch (type) {
    case SET_IN_APP_PRODUCTS:
      return {
        ...state,
        products: (payload as IAPProduct[]).map((p) => ({ ...p })),
      };
    case UPDATE_IN_APP_PRODUCT:
      const index = state.products.findIndex(
        (p) => p.id === (payload as IAPProduct).id
      );
      if (index !== -1) {
        state.products[index] = { ...(payload as IAPProduct) };
        // if (state.products[index].additionalData?.oldSku && state.products[index].owned) {
        //   const oldProduct = state.products.find(p => p.id === state.products[index].additionalData.oldSku);
        //   if (oldProduct) {
        //     oldProduct.canPurchase = true;
        //     oldProduct.owned = false;
        //   }
        // }
      }

      return {
        ...state,
      };
    case UPDATE_IN_APP_OWNER:
      return {
        ...state,
        ownedProduct: payload,
      };
    case REMOVE_IN_APP_OWNER:
      return {
        ...state,
        ownedProduct: null,
      };
    default:
      return state;
  }
}
