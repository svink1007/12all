import { SIDEBAR_OPEN, SIDEBAR_CLOSE } from "../types/types";

export function setSidebarOpen() {
  return {
    type: SIDEBAR_OPEN,
    payload: { isOpen: true },
  };
}

export function setSidebarClose() {
  return {
    type: SIDEBAR_CLOSE,
    payload: { isOpen: false },
  };
}
