import { SET_ROOM_LAYOUT } from "../types/types";
import { VertoLayout } from "../../verto/types";

export function setRoomLayout(value: VertoLayout) {
  return {
    type: SET_ROOM_LAYOUT,
    payload: value,
  };
}
