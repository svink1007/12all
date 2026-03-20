import {ChatMethod} from './enums';
import {OutgoingMessage, OutgoingMessageTo} from './models';
import VertoConferenceManager from './VertoConferenceManager';
import {ChangeStreamParams} from '../pages/SharedStream';

type VertoSendMessageParams = {
  vertoConferenceManager: VertoConferenceManager;
  callerName: string;
};

export default class VertoSendMessage {
  private readonly vertoConferenceManager: VertoConferenceManager;
  private readonly callerName: string;
  private _callId: string | null = null;

  constructor(params: VertoSendMessageParams) {
    this.vertoConferenceManager = params.vertoConferenceManager;
    this.callerName = params.callerName;
  }

  set callId(value: string) {
    this._callId = value;
  }

  toEveryone(message: string) {
    this.vertoConferenceManager.broadcastChatMessage(
      new OutgoingMessage({
        method: ChatMethod.ToEveryone,
        from: this.callerName,
        to: OutgoingMessageTo.Everyone,
        message,
        fromDisplay: this.callerName
      })
    );
  }

  oneToOne(message: string, to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.OneToOne,
      to,
      message,
      fromDisplay: this.callerName
    });
  }

  switchHostStream(to: string, username: string, password: string, hostName: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.SwitchHostStream,
      to,
      message: JSON.stringify({username, password, hostName})
    });
  }

  switchHostCamera(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.SwitchHostCamera,
      to
    });
  }

  streamChange(params: ChangeStreamParams) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.StreamChange,
      to: OutgoingMessageTo.Everyone,
      message: JSON.stringify(params)
    });
  }

  makeCoHost(to: string) {
    if (this.vertoConferenceManager.moderatorChannel) {
      this.sendChatMessageFromPrimaryVertoCall({
        method: ChatMethod.MakeCoHost,
        to,
        message: JSON.stringify({token: this.vertoConferenceManager.moderatorChannel})
      });
    }
  }

  removeCoHost(to: string, coHostCallIds: string[]) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.RemoveCoHost,
      to,
      message: JSON.stringify({coHostCallIds})
    });
  }

  youHaveBeenRemoved(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.RemoveParticipant,
      to
    });
  }

  youHaveBeenBlocked(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.BlockParticipant,
      to
    });
  }

  stopMediaShare(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.StopMediaShare,
      to
    });
  }

  hostLeft() {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.HostLeft,
      to: OutgoingMessageTo.Everyone
    });
  }

  stopAllMediaShare() {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.StopAllMediaShare,
      to: OutgoingMessageTo.Everyone
    });
  }

  youAreHost(callId: string, participantName: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.YouAreHost,
      to: callId,
      message: participantName
    });
  }

  private sendChatMessageFromPrimaryVertoCall(data: {method: ChatMethod, to: string, message?: string, fromDisplay?: string}) {
    if (this._callId) {
      this.vertoConferenceManager.broadcastChatMessage(new OutgoingMessage({...data, from: this._callId}));
    }
  }
}
