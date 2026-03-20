import {
  SET_GAMES,
  ADD_GAME,
  MANAGE_GAME,
  JOIN_GAME
} from '../shared/constants';
import {Action, GamesRedux} from '../shared/types';
import {BetGameObj} from '../../shared/types';

const selectedInitial: BetGameObj = {
  id: -1,
  roomId: -1,
  createdByName: "",
  hostId: -1,
  content: "",
  betAmount: "", 
  lockIn: "",
  multipleChoice:  false,
  betsValue:  false,
  choices: [""],
  valueDescription: "",
  createdAt: new Date(),
  end: new Date(),
  participants: [],
  status: 'ACTIVE',
  winner: {
    choice: "",
    value: "",
  },
};

const INITIAL: GamesRedux = {
  games: [],
  joinedGames: [] 
};

export default function reducer(state = INITIAL, {
  type,
  payload
}: Action<BetGameObj | {games: BetGameObj[], profileID: number} | number>): GamesRedux {
  switch (type) {
    case SET_GAMES:
      let gamesObj = (payload as {games: BetGameObj[], profileID: number});
      return {
        ...state,
        games: (payload as {games: BetGameObj[], profileID: number}).games.map(p => ({...p})),
        joinedGames: gamesObj.games.filter((p) => p.participants.includes(gamesObj.profileID)).map(p => p.id)
      };
    case ADD_GAME:
      return {
        ...state,
        games: [...state.games, (payload as BetGameObj)]
      };
    case MANAGE_GAME:
      const gameFromPayload = (payload as BetGameObj);
      return {
        ...state,
        games: state.games.map(game => game.id === gameFromPayload.id ? {
            ...game,
            status: gameFromPayload.status,
            winner: gameFromPayload.winner
          } : game )
        }    
    case JOIN_GAME:
      return {
        ...state,
        joinedGames: [...state.joinedGames, (payload as number)]
      };         
    default:
      return state;
  }
}
