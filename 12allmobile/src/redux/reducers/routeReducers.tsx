import { SET_PREV_ROUTE } from "../types/types";
import { Action, RouteRedux } from "../types";

const INITIAL: RouteRedux = {
  prevUrl: "",
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<RouteRedux>
): RouteRedux {
  switch (type) {
    case SET_PREV_ROUTE:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
