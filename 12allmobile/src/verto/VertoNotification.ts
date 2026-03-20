import { VertoLayout, WsRequest } from "./types";
import { IncomingMessage, Participant, SwitchHost } from "./models";
import { SendWsRequest } from "../shared/types";
import { ChangeStreamParams } from "../pages/SharedStream";

export class Notification<T> {
  private id: number = 0;
  private subscribers: { [id: number]: (data: T) => void } = {};

  subscribe(subscription: (data: T) => void) {
    this.subscribers[this.id] = subscription;
    return this.id++;
  }

  unsubscribe(id: number) {
    delete this.subscribers[id];
  }

  unsubscribeAll() {
    this.subscribers = {};
  }

  notify(data: T) {
    for (const property in this.subscribers) {
      this.subscribers[+property] && this.subscribers[+property](data);
    }
  }
}

export default class VertoNotification {
  readonly onBootstrappedParticipants = new Notification<Participant[]>();
  readonly onAddedParticipant = new Notification<Participant>();
  readonly onModifiedParticipant = new Notification<Participant>();
  readonly onRemovedParticipant = new Notification<Participant>();
  readonly onChatMessageToAll = new Notification<IncomingMessage>();
  readonly onChatMessageOneToOne = new Notification<IncomingMessage>();
  readonly onChatMessageSwitchHostStream = new Notification<SwitchHost>();
  readonly onChatMessageSwitchHostCamera = new Notification<null>();
  readonly onChatMessageChangeParticipantState = new Notification<{
    participantId: string;
    isActive: boolean;
  }>();
  readonly onChatMessageStreamChange = new Notification<ChangeStreamParams>();
  readonly onMakeCoHost = new Notification<{
    token: string;
    callIds: string[];
  }>();
  readonly onRemoveCoHost = new Notification<{
    coHostCallIds: string[];
    me: boolean;
  }>();
  readonly onYouHaveBeenRemoved = new Notification<null>();
  readonly onYoursSharingHaveBeenRemoved = new Notification<null>();
  readonly onAskToUnmuteMic = new Notification<null>();
  readonly onAskToStartCam = new Notification<null>();
  readonly onPrimaryCallDestroy = new Notification<null>();
  readonly onSecondaryCallDestroy = new Notification<null>();
  readonly onDestroy = new Notification<null>();
  readonly onEarlyCallError = new Notification<null>();
  readonly onPeerStreamingError = new Notification<any>();
  readonly onPlayRemoteVideo = new Notification<MediaStream>();
  readonly onStateChange = new Notification<null>();
  readonly onReplaceTracksDone = new Notification<null>();
  readonly sendWebSocketRequest = new Notification<SendWsRequest>();
  readonly onWebSocketTestSpeedMessage = new Notification<MessageEvent>();
  readonly onNewWebsocketMessageRequest = new Notification<{
    request: WsRequest;
    onSuccess: (data: any) => void;
    onError: (err?: any) => void;
  }>();
  readonly onFSLogged = new Notification<null>();
  readonly onFSLoggedError = new Notification<null>();
  readonly onWebSocketMessage = new Notification<any>();
  readonly onPrimaryCallRTCStateChange = new Notification<null>();
  readonly onSecondaryCallRTCStateChange = new Notification<null>();
  readonly onLayoutChange = new Notification<VertoLayout>();
  readonly onPrimaryCallRemoteStream = new Notification<MediaStream>();
  readonly onSecondaryCallRemoteStream = new Notification<MediaStream>();
  readonly onStartingHangup = new Notification<null>();
  readonly onRoomClosed = new Notification<null>();
  readonly onStopMediaShare = new Notification<null>();
  readonly onStopAllMediaShare = new Notification<null>();
  readonly onYouHaveBeenBlocked = new Notification<null>();
  readonly onYouAreHost = new Notification<null>();
  readonly onHostChange = new Notification<string>();
  readonly onHostChangeStream = new Notification<string>();
  readonly onWebSocketReconnecting = new Notification<null>();
  readonly onFreeswitchReconnectLogin = new Notification<null>();
  readonly failToConnectToWs = new Notification<null>();

  removeAllSubscribers() {
    for (const property in this) {
      if (
        this.hasOwnProperty(property) &&
        this[property] instanceof Notification
      ) {
        (this[property] as any).unsubscribeAll();
      }
    }
  }
}
