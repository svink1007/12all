import { SET_LIVING_ROOM } from "../types/types";
import { Action, LivingRoomState } from "../types";

const INITIAL: Partial<LivingRoomState> = {
  fsUrl: "",
  roomId: "",
  channel: {
    logo: "",
  },
  publicRoomId: "",
  moderatorUsername: "",
  moderatorPassword: "",
  streamUrl: "",
  channelIsActive: false,
  vlrId: 0,
};

export default function reducer(
  state: Partial<LivingRoomState> = INITIAL,
  { type, payload }: Action<LivingRoomState>
) {
  switch (type) {
    case SET_LIVING_ROOM:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
