import { Browser } from "@capacitor/browser";

export const handleNavigation = async (url: string) => {
  await Browser.open({ url });
};
