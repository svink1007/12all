import {
  ADD_GAME,
  SET_GAMES,
  MANAGE_GAME,
  JOIN_GAME
} from '../shared/constants';
import { BetGameObj } from '../../shared/types';

export function addGame(value: BetGameObj) {
  return {
    type: ADD_GAME,
    payload: value
  };
}

export function setGames(value: {games: BetGameObj[], profileID: number}) {
  return {
    type: SET_GAMES,
    payload: value
  };
}

export function manageGames(value: BetGameObj) {
  return {
    type: MANAGE_GAME,
    payload: value
  };
}

export function joinGames(value: number) {
  return {
    type: JOIN_GAME,
    payload: value
  };
}
