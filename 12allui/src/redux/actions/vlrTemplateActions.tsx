import {
  ADD_VLR_TEMPLATE,
  PATCH_SELECTED_VLR_TEMPLATE,
  PATCH_SELECTED_VLR_TEMPLATE_SCHEDULE,
  RESET_SELECTED_VLR_TEMPLATE,
  SET_SELECTED_VLR_TEMPLATE,
  SET_VLR_TEMPLATES
} from '../shared/constants';
import {SelectedVlrTemplate, VlrTemplate, VlrTemplateSchedule} from '../../shared/types';

export function setVlrTemplates(value: VlrTemplate[]) {
  return {
    type: SET_VLR_TEMPLATES,
    payload: value
  };
}

export function addVlrTemplate(value: VlrTemplate) {
  return {
    type: ADD_VLR_TEMPLATE,
    payload: value
  };
}

export function setSelectedVlrTemplate(value: VlrTemplate) {
  return {
    type: SET_SELECTED_VLR_TEMPLATE,
    payload: value
  };
}

export function patchSelectedVlrTemplate(value: Partial<SelectedVlrTemplate>) {
  return {
    type: PATCH_SELECTED_VLR_TEMPLATE,
    payload: value
  };
}

export function patchSelectedVlrTemplateSchedule(value: Partial<VlrTemplateSchedule>) {
  return {
    type: PATCH_SELECTED_VLR_TEMPLATE_SCHEDULE,
    payload: value
  };
}


export function resetSelectedVlrTemplate() {
  return {
    type: RESET_SELECTED_VLR_TEMPLATE
  };
}
