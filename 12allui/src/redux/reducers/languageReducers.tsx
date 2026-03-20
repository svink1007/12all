import {SET_LANGUAGE} from '../shared/constants';
import {Action} from '../shared/types';
import {DEFAULT_LANGUAGE, ILanguage} from '../../shared/Language';

export default function reducer(state: ILanguage = DEFAULT_LANGUAGE, {type, payload}: Action<ILanguage>) {
  switch (type) {
    case SET_LANGUAGE:
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
