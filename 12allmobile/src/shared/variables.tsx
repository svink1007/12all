import { App, AppInfo } from "@capacitor/app";
import { MOBILE_VIEW } from "./constants";
import { isPlatform } from "@ionic/react";

export let appVersion = "2.12.1";
if (isPlatform("android") || isPlatform("ios")) {
  App.getInfo().then((info: AppInfo) => (appVersion = info.version));
}
