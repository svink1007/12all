import { SET_LIVING_ROOM } from "../types/types";
import { LivingRoomState } from "../types";

export default function setLivingRoom(value: Partial<LivingRoomState>) {
  return {
    type: SET_LIVING_ROOM,
    payload: value,
  };
}
