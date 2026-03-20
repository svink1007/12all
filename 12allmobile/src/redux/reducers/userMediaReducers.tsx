import { SET_USER_MEDIA } from "../types/types";
import { Action, UserMedia } from "../types";

const INITIAL: UserMedia = {
  facingMode: "user",
};

export default function reducer(
  state: UserMedia = INITIAL,
  { type, payload }: Action<UserMedia>
) {
  switch (type) {
    case SET_USER_MEDIA:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
