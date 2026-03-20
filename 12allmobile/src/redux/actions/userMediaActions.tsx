import { SET_USER_MEDIA } from "../types/types";
import { UserMedia } from "../types";

export default function setUserMedia(value: Partial<UserMedia>) {
  return {
    type: SET_USER_MEDIA,
    payload: value,
  };
}
