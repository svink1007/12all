import {SET_LANGUAGE} from '../shared/constants';
import {ILanguage} from '../../shared/Language';

export default function setLanguage(value: ILanguage) {
  return {
    type: SET_LANGUAGE,
    payload: value
  }
}
