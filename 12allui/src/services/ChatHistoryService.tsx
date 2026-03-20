import BaseService from './BaseService';
import {Vlr} from '../shared/types';

type SendMessage = {
  date: string;
  message: string;
  sender: string;
  vlrId: number;
};

type GetMessage = {
  date: string;
  message: string;
  sender: string;
  vlr: Vlr;
};

export class ChatHistoryService extends BaseService {
  static sendMessage(data: SendMessage) {
    return this.post<{status: string}>('/chat-histories', data);
  }

  static getMessages(vlrId: number) {
    return this.get<GetMessage[]>(`/chat-histories?vlr=${vlrId}`);
  }
}
