import {ALLOW_ADS} from '../shared/constants';
import {Action, AdSenseRedux} from '../shared/types';

const INITIAL: AdSenseRedux = {
  allowAds: false
};

export default function reducer(state: AdSenseRedux = INITIAL, {type}: Action<AdSenseRedux>
) {
  switch (type) {
    case ALLOW_ADS:
      const data: AdSenseRedux = {
        ...state,
        allowAds: true
      };

      return data;
    default:
      return state;
  }
}
