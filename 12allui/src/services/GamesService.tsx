import BaseService from './BaseService';
import { BetGameObj } from '../shared/types';

export class GamesService extends BaseService {

  static createGame(game: BetGameObj) {
    return this.postWithAuth<{ status: string, result: BetGameObj}>('/billings/game', {
      "content": game.content,
      "hostId": game.hostId,
      "betAmount": game.betAmount, 
      "end": game.end, // дата на заключване
      "roomId": game.roomId, // ид-то на стаята
      "choices": game.choices,
      "multipleChoice": game.multipleChoice, // дали е с избори или с value
      "betsValue": game.betsValue,
      "valueDescription": game.valueDescription 
    });
  }

  /**
   * 
   * @param id - Room Id
   * @returns 
   */
  static getRoomGames(id: number, status: boolean) {
    return this.getWithAuth<{ status: string, result: BetGameObj[]}>(`/game-billings/game?roomId=${id}&active=${status}`);
  }

  static joinGame(gameId: number, clientId: number, multipleChoiceValue: string, value: string) {
    return this.postWithAuth<{ status: string, result: BetGameObj}>('/billings/game/bet', {
      gameId,
      multipleChoiceValue,
      value, // избора за залога
      clientId // ид на потребителя, който прави залога
    });
  }

  static endGame(gameId: number, winningValue: string, winningMultipleChoiceValue: string) {
    return this.postWithAuth<{ status: string, result: BetGameObj}>(`/billings/game/end?gameId=${gameId}&winningValue=${winningValue}&winningMultipleChoiceValue=${winningMultipleChoiceValue}`, {
    });
  }

  static abortGame(gameId: number) {
    return this.postWithAuth<{ status: string, result: BetGameObj}>(`/billings/game/abort?gameId=${gameId}`);
  }

}
