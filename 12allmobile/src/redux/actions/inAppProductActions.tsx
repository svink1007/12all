import {
  REMOVE_IN_APP_OWNER,
  SET_IN_APP_PRODUCTS,
  UPDATE_IN_APP_OWNER,
  UPDATE_IN_APP_PRODUCT,
} from "../types/types";
import { IAPProduct } from "@ionic-native/in-app-purchase-2";

export function setInAppProducts(products: IAPProduct[]) {
  return {
    type: SET_IN_APP_PRODUCTS,
    payload: products,
  };
}

export function updateInAppProduct(product: IAPProduct) {
  return {
    type: UPDATE_IN_APP_PRODUCT,
    payload: product,
  };
}

export function updateInAppOwner(product: IAPProduct) {
  return {
    type: UPDATE_IN_APP_OWNER,
    payload: product,
  };
}

export function removeInAppOwner() {
  return {
    type: REMOVE_IN_APP_OWNER,
  };
}
