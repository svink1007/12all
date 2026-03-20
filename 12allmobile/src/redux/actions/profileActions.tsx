import { RESET_PROFILE, SET_PROFILE, LOGOUT_USER } from "../types/types";
import { Profile } from "../types";

export function setProfile(value: Partial<Profile>) {
  return {
    type: SET_PROFILE,
    payload: value,
  };
}

export function resetProfile() {
  return {
    type: RESET_PROFILE,
  };
}

export function logoutUser() {
  return {
    type: LOGOUT_USER,
  };
}
