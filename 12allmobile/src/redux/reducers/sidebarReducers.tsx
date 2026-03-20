import { SIDEBAR_CLOSE, SIDEBAR_OPEN } from "../types/types";
import { Action, SidebarRedux } from "../types";

const INITIAL: SidebarRedux = {
  isOpen: false,
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<SidebarRedux>
): SidebarRedux {
  switch (type) {
    case SIDEBAR_OPEN:
    case SIDEBAR_CLOSE:
      return {
        ...state,
        isOpen: { ...payload }.isOpen,
      };
    default:
      return state;
  }
}
