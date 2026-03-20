import { SET_SHARED_SITE_DATA } from "../types/types";
import { SharedSitesRedux } from "../types";

export default function setSharedSiteData(value: SharedSitesRedux) {
  return {
    type: SET_SHARED_SITE_DATA,
    payload: value,
  };
}
