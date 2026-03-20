import { SET_SHARED_SITE_DATA } from "../types/types";
import { Action, SharedSitesRedux } from "../types";

const INITIAL: SharedSitesRedux = {
  url: "",
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<SharedSitesRedux>
) {
  switch (type) {
    case SET_SHARED_SITE_DATA:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
