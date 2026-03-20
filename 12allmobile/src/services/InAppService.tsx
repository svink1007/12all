import BaseService from "./BaseService";
import { InAppRegistryDb } from "../shared/types";
import { IAPProduct } from "@ionic-native/in-app-purchase-2";
import { isPlatform } from "@ionic/react";

export default class InAppService extends BaseService {
  static getRegistry() {
    return this.get<InAppRegistryDb[]>("/in-app-registers");
  }

  static verifyTransaction(product: IAPProduct) {
    if (isPlatform("android")) {
      return this.postWithJwtToken<{
        ok: boolean;
        data: any;
        error?: { message: string };
      }>("/in-app-check-purchase-android", { product });
    }

    if (isPlatform("ios")) {
      return this.postWithJwtToken<{
        ok: boolean;
        data: any;
        error?: { message: string };
      }>("/in-app-check-purchase-ios", { product });
    }

    throw new Error("Platform not supported");
  }
}
