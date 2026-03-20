import {SET_HOME_FILTER} from '../shared/constants';
import {Action, HomeFilterRedux} from '../shared/types';
import {splitLabel} from "../../shared/helpers";

const INITIAL: HomeFilterRedux = {
  genre: null,
  language: null,
  owner: null,
  country: null,
  filterParams: ''
};

export default function reducer(state = INITIAL, {type, payload}: Action<HomeFilterRedux>): HomeFilterRedux {
  switch (type) {
    case SET_HOME_FILTER:
      const output = {
        ...state,
        ...payload
      };

      const {genre, language, country, owner} = output;
      const filterParams = [];
      language && filterParams.push(`language=${language}`);
      genre && filterParams.push(`genre=${genre}`);
      owner && filterParams.push(`owner=${owner}`);
      country && filterParams.push(`country_of_origin=${country}`);
      // search && filterParams.push(`search_query=${search}`);
      output.filterParams = filterParams.join('&');

      return output;
    default:
      return state;
  }
}
