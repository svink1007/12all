import { SET_PREV_ROUTE } from "../types/types";

export default function setPrevRoute(prevUrl: string) {
  return {
    type: SET_PREV_ROUTE,
    payload: { prevUrl },
  };
}
