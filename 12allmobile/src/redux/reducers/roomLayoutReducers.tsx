import { SET_ROOM_LAYOUT } from "../types/types";
import { Action } from "../types";
import { VertoLayout } from "../../verto/types";

const INITIAL = VertoLayout.VideoLeftSmall;

export default function reducer(
  state: VertoLayout = INITIAL,
  { type, payload }: Action<VertoLayout>
) {
  switch (type) {
    case SET_ROOM_LAYOUT:
      return payload;
    default:
      return state;
  }
}
