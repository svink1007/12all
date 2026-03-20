import { RewardInfo } from "../../shared/types";
import { SET_TOTAL_STAR_BALANCE } from "../types/types";

export function setTotalStarBalance(value: Partial<RewardInfo>) {
  return {
    type: SET_TOTAL_STAR_BALANCE,
    payload: { ...value },
  };
}
