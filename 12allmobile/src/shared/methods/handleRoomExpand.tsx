// import {NavigationBar} from '@hugotomazi/capacitor-navigation-bar';
import { StatusBar } from "@capacitor/status-bar";

export const handleRoomExpand = (isExpanded: boolean) => {
  if (isExpanded) {
    // StatusBar.setOverlaysWebView({overlay: true}).then();
    StatusBar.hide().then();
    // NavigationBar.hide().then();
  } else {
    // StatusBar.setOverlaysWebView({overlay: false}).then();
    StatusBar.show().then();
    // NavigationBar.show().then();
  }
};
