import { SelectedVlrTemplate } from "../../shared/types";
import {
  PATCH_SELECTED_VLR_TEMPLATE,
  RESET_SELECTED_VLR_TEMPLATE,
} from "../types/types";

export function patchSelectedVlrTemplate(value: Partial<SelectedVlrTemplate>) {
  return {
    type: PATCH_SELECTED_VLR_TEMPLATE,
    payload: value,
  };
}

export function resetSelectedVlrTemplate() {
  return {
    type: RESET_SELECTED_VLR_TEMPLATE,
  };
}
