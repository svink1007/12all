import VertoSession from "../../verto/VertoSession";
import {Participant} from "../../verto/models";



export type VertoRedux = {
  session: VertoSession | null;
  vlr: string | null;
  participants: Participant[]
};


const INITIAL: VertoRedux = {
  session: null,
  vlr: null,
  participants: [],
};

const UPDATE_VERTO = 'UPDATE_VERTO';

interface Action<T> {
  type: string;
  payload: T;
}

export default function reducer(state = INITIAL, { type, payload }: Action<any>): VertoRedux {
  switch (type) {
    case UPDATE_VERTO:
      return {
        ...state,
        ...payload,
      };

    default:
      return state;
  }
}
