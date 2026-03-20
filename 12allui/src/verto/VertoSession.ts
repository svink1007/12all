import {
  VertoCallParams,
  VertoLayout,
  VertoSessionParams,
  WsRequest,
} from "./types";
import VertoCall from "./VertoCall";
import VertoNotification from "./VertoNotification";
import VertoSubscription from "./VertoSubscription";
import VertoWebsocket from "./VertoWebsocket";
import { OutgoingMessage, Participant } from "./models";
import { RoomLayoutService, VlrService } from "../services";
import { ChatMethod } from "./enums";
import { nanoid } from "nanoid";
import VertoLiveArray from "./VertoLiveArray";
import VertoConferenceManager from "./VertoConferenceManager";
import VertoSendMessage from "./VertoSendMessage";
// import {VertoTestSpeed} from './VertoTestSpeed';

type Connection = {
  id: string;
  call: VertoCall;
};

type SecondaryCallParams = {
  stream: MediaStream;
  channelName: string;
  receiveStream: boolean;
  outgoingBandwidth: number;
  incomingBandwidth: number;
  destinationNumber: string;
  connectionType: string;
};

type WebsocketRequests = {
  [id: string]: {
    request: WsRequest;
    onSuccess: (data: any) => void;
    onError?: (err?: any) => void;
  };
};

interface SessionParams extends VertoSessionParams {
  outgoingBandwidth: number;
  incomingBandwidth: number;
}

export default class VertoSession {
  private readonly sessId = nanoid();
  private readonly sessionParams: SessionParams;
  private readonly vertoConferenceManager;
  private readonly vertoSendMessage: VertoSendMessage;
  private readonly vertoWebsocket: VertoWebsocket;
  private readonly vertoNotification = new VertoNotification();
  private readonly vertoSubscription = new VertoSubscription(
    this.vertoNotification
  );
  private readonly vertoLiveArray = new VertoLiveArray({
    vertoSubscription: this.vertoSubscription,
    vertoNotification: this.vertoNotification,
  });
  private websocketRequests: WebsocketRequests = {};
  public primaryVertoCall: VertoCall | null = null;
  public secondaryVertoCall: VertoCall | null = null;
  private connections: Connection[] = [];
  private defaultLayout: VertoLayout | null = null;
  private _previousPrimaryId: string | null = null;
  private _previousSecondaryId: string | null = null;

  constructor(params: VertoSessionParams) {
    this.sessionParams = { ...params };

    this.vertoConferenceManager = new VertoConferenceManager({
      vertoSubscription: this.vertoSubscription,
      vertoNotification: this.vertoNotification,
      imHost: params.isHost || false,
    });

    this.vertoSendMessage = new VertoSendMessage({
      vertoConferenceManager: this.vertoConferenceManager,
      callerName: this.sessionParams.callerName,
    });

    this.vertoWebsocket = new VertoWebsocket(
      this.sessId,
      this.vertoNotification,
      this.sessionParams.moderatorUsername,
      this.sessionParams.moderatorPassword,
      this.sessionParams.fsUrl
    );

    this.vertoNotification.onWebsocketReconnected.subscribe(() => {
      this._previousPrimaryId = this.primaryVertoCall?.callId || null;
      this._previousSecondaryId = this.secondaryVertoCall?.callId || null;
      this.websocketRequests = {};
    });

    this.vertoNotification.onFSLogged.subscribe(async () => {
      // const {
      //   upKps,
      //   downKps
      // } = await VertoTestSpeed.test(this.vertoWebsocket.websocket, this.notification.onWebSocketTestSpeedMessage);
      // this.sessionParams.outgoingBandwidth = upKps;
      // this.sessionParams.incomingBandwidth = downKps;
      if (params.secondary && params.channelName) {
        this.initSecondaryCall({
          stream: params.localStream,
          channelName: params.channelName,
          receiveStream: true,
          incomingBandwidth: params.incomingBandwidth,
          outgoingBandwidth: params.outgoingBandwidth,
          destinationNumber: params.destinationNumber,
          connectionType: params.connectionType,
        });
      } else {
        this.initPrimaryCall();
      }

      if (params.giveFloor) {
        this.vertoNotification.onBootstrappedParticipants.subscribe(
          (participants: Participant[]) => {
            const id =
              this.secondaryVertoCall?.callId || this.primaryVertoCall?.callId;

            if (id) {
              const sharedSession = participants.find(
                ({ callId }: Participant) => id === callId
              );
              if (sharedSession) {
                this.vertoConferenceManager
                  .moderateMemberById(sharedSession.participantId)
                  .toBeVideoFloor();
              }
            }
          }
        );
      }
    });

    this.vertoNotification.onWebSocketMessage.subscribe(
      ({ jsonrpc, id, result, error }) => {
        if (jsonrpc === "2.0" && this.websocketRequests[id]) {
          if (result) {
            this.websocketRequests[id].onSuccess(result);
            delete this.websocketRequests[id];
          } else if (error) {
            const { onError } = this.websocketRequests[id];
            onError && onError(error);
            delete this.websocketRequests[id];
          }
        }
      }
    );

    this.vertoNotification.onNewWebsocketMessageRequest.subscribe(
      ({ request, onSuccess, onError }) => {
        this.websocketRequests[request.id] = {
          request,
          onSuccess,
          onError,
        };
      }
    );
  }

  get notification() {
    return this.vertoNotification;
  }

  get callerName() {
    return this.sessionParams.callerName;
  }

  get sendMessage() {
    return this.vertoSendMessage;
  }

  get primaryCallId() {
    return this.primaryVertoCall?.callId;
  }

  get previousPrimaryId() {
    return this._previousPrimaryId;
  }

  get previousSecondaryId() {
    return this._previousSecondaryId;
  }

  disconnectWebSocket() {
    this.vertoWebsocket.disconnect();
  }

  reconnectWebSocket() {
    this.vertoWebsocket.reconnect();
  }

  giveParticipantFloor(participantId: string) {
    this.vertoConferenceManager
      .moderateMemberById(participantId)
      .toBeVideoFloor();
  }

  sendDebugAction(command: string, argument?: string | any[], application?: string) {
    this.vertoConferenceManager.runDebugCommand(
        command, argument, application
    );
  }

  changeLayout(layout?: VertoLayout) {
    if (layout) {
      this.vertoConferenceManager.changeVideoLayout(layout);
      VlrService.updateVlrLayout(layout, this.sessionParams.realNumber).then();
    } else {
      const getDefaultLayout = async () => {
        if (!this.defaultLayout) {
          const { data } = await RoomLayoutService.getDefaultLayout();
          this.defaultLayout = data.layout;
        }

        this.vertoConferenceManager.changeVideoLayout(
          this.defaultLayout as VertoLayout
        );

        VlrService.updateVlrLayout(
          this.defaultLayout,
          this.sessionParams.realNumber
        ).then();
      };

      getDefaultLayout().catch();
    }
  }

  getDestinationNumber(
    destinationNumber: string,
    realNumber: string,
    connectionType: string
  ) {
    switch (connectionType) {
      case "shared_stream_camera":
        return destinationNumber;
      case "watch_party_camera":
        return destinationNumber;
      default:
        return realNumber;
    }
  }

  initPrimaryCall() {
    const {
      // streamNumber,
      callerName,
      isHost,
      channelName,
      realNumber,
      localStream,
      isHostSharedVideo,
      notifyOnStateChange,
      receivePrimaryCallStream,
      userId,
      moderatorUsername,
      incomingBandwidth,
      outgoingBandwidth,
      connectionType,
      destinationNumber,
    } = this.sessionParams;

    this.primaryVertoCall = new VertoCall({
      // destinationNumber: isHostSharedVideo ? destinationNumber : realNumber as (string),
      destinationNumber: this.getDestinationNumber(
        destinationNumber,
        realNumber as string,
        connectionType
      ),
      moderatorUsername: moderatorUsername || callerName,
      localStream,
      notifyOnStateChange: notifyOnStateChange || false,
      notification: this.vertoNotification,
      showMe: true,
      isHost,
      channelName,
      callerName: callerName,
      receiveStream:
        receivePrimaryCallStream === undefined
          ? true
          : receivePrimaryCallStream,
      isHostSharedVideo,
      isPrimaryCall: true,
      incomingBandwidth,
      outgoingBandwidth,
      userId,
      connectionType,
      onDestroy: () => {
        this.notification.onPrimaryCallDestroy.notify(null);
        this.disconnectWebSocket();
      },
      onRTCStateChange: () =>
        this.notification.onPrimaryCallRTCStateChange.notify(null),
      onRemoteStream: (stream) =>
        this.notification.onPrimaryCallRemoteStream.notify(stream),
    });
    this.vertoLiveArray.primaryCallId = this.vertoSendMessage.callId =
      this.primaryVertoCall.callId;
  }

  initSecondaryCall({
    stream,
    channelName,
    receiveStream,
    incomingBandwidth,
    outgoingBandwidth,
    destinationNumber,
    connectionType,
  }: SecondaryCallParams) {
    const { streamNumber, userId } = this.sessionParams;
    this.startSecondaryCall({
      destinationNumber: destinationNumber
        ? destinationNumber
        : (streamNumber as string),
      moderatorUsername: channelName,
      localStream: stream,
      notifyOnStateChange: false,
      notification: this.vertoNotification,
      showMe: false,
      isHostSharedVideo: true,
      callerName: channelName,
      receiveStream,
      isHost: false,
      incomingBandwidth: incomingBandwidth,
      outgoingBandwidth: outgoingBandwidth,
      userId,
      connectionType,
      onDestroy: () => this.notification.onSecondaryCallDestroy.notify(null),
      onRTCStateChange: () =>
        this.notification.onSecondaryCallRTCStateChange.notify(null),
      onRemoteStream: (stream) =>
        this.notification.onSecondaryCallRemoteStream.notify(stream),
    });
  }

  initSecondaryCallStream(stream: MediaStream, streamName: string) {
    const {
      streamNumber,
      userId,
      incomingBandwidth,
      outgoingBandwidth,
      connectionType,
    } = this.sessionParams;
    debugger;
    this.startSecondaryCall({
      destinationNumber: streamNumber as string,
      moderatorUsername: streamName,
      localStream: stream,
      notifyOnStateChange: false,
      notification: this.vertoNotification,
      showMe: false,
      callerName: streamName,
      receiveStream: false,
      isHost: true,
      isHostSharedVideo: true,
      incomingBandwidth,
      outgoingBandwidth,
      userId,
      connectionType,
      onDestroy: () => this.notification.onSecondaryCallDestroy.notify(null),
      onRTCStateChange: () =>
        this.notification.onSecondaryCallRTCStateChange.notify(null),
      onRemoteStream: (stream) =>
        this.notification.onSecondaryCallRemoteStream.notify(stream),
    });
  }

  addConnection(stream: MediaStream, caller: string) {
    const { realNumber, incomingBandwidth, outgoingBandwidth, connectionType } =
      this.sessionParams;

    const call = new VertoCall({
      destinationNumber: realNumber,
      moderatorUsername: caller,
      localStream: stream,
      notifyOnStateChange: true,
      notification: this.vertoNotification,
      showMe: true,
      callerName: caller,
      receiveStream: false,
      incomingBandwidth,
      outgoingBandwidth,
      connectionType,
    });

    this.connections.push({
      id: call.callId,
      call,
    });
  }

  hasSecondaryCall() {
    return !!this.secondaryVertoCall;
  }

  hangup() {
    this.vertoNotification.onStartingHangup.notify(null);
    this.connections.forEach((c) => c.call.hangup());
    this.secondaryVertoCall?.hangup();
    this.primaryVertoCall?.hangup();
  }

  cleanupWebRTC() {
    this.connections.forEach((c) => {
      c.call.rtc.stop(); // Ensure that the WebRTC connection is stopped
      c.call.rtc.close(); // Close the connection if possible
    });

    // If you have other WebRTC references, close or clean them up here
    this.secondaryVertoCall?.rtc.stop();
    this.secondaryVertoCall?.rtc.close();
    this.primaryVertoCall?.rtc.stop();
    this.primaryVertoCall?.rtc.close();

  }

  askToUnmuteParticipantMic(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.AskToUnmuteMic,
      to,
    });
  }

  toggleParticipantMic(participantId: string) {
    this.vertoConferenceManager
      .moderateMemberById(participantId)
      .toToggleMicrophone();
  }

  askToStartParticipantCam(to: string) {
    this.sendChatMessageFromPrimaryVertoCall({
      method: ChatMethod.AskToStartCam,
      to,
    });
  }

  stopParticipantCam(participantId: string) {
    this.vertoConferenceManager
      .moderateMemberById(participantId)
      .toToggleCamera();
  }

  removeParticipant(participantId: string) {
    this.vertoConferenceManager
      .moderateMemberById(participantId)
      .toBeKickedOut();
  }

  togglePrimaryMic() {
    this.primaryVertoCall?.sendTouchTone("0");
  }

  togglePrimaryCam() {
    this.primaryVertoCall?.sendTouchTone("*0");
  }

  toggleSecondaryMic() {
    this.secondaryVertoCall?.sendTouchTone("0");
  }

  toggleSecondaryCam() {
    this.secondaryVertoCall?.sendTouchTone("*0");
  }

  setModeratorChannel(channel: string) {
    this.vertoConferenceManager.moderatorChannel = channel;
  }

  getModeratorChannel() {
    return this.vertoConferenceManager.moderatorChannel;
  }

  removeModeratorChannel() {
    this.vertoConferenceManager.moderatorChannel = null;
  }

  replacePrimaryTracks(stream: MediaStream) {
    this.primaryVertoCall?.replaceTracks(stream);
  }

  replaceSecondaryTracks(stream: MediaStream) {
    this.secondaryVertoCall?.replaceTracks(stream);
  }

  replaceTracks(stream: MediaStream) {
    if (this.secondaryVertoCall) {
      this.secondaryVertoCall.replaceTracks(stream);
    } else if (this.primaryVertoCall) {
      this.primaryVertoCall.replaceTracks(stream);
    }
  }

  replacePrimaryVideoSecondaryAudioTrack(
    audio: MediaStreamTrack,
    video: MediaStreamTrack
  ) {
    if (!this.primaryVertoCall || !this.secondaryVertoCall) {
      console.error("No primary or secondary call");
      return;
    }

    this.primaryVertoCall.replaceTracks(new MediaStream([video]));
    this.secondaryVertoCall.replaceTracks(new MediaStream([audio]));
  }

  getRTCVideoTrackStats() {
    if (this.secondaryVertoCall) {
      return this.secondaryVertoCall.getRTCVideoTrackStats();
    }

    return this.primaryVertoCall?.getRTCVideoTrackStats();
  }

  removeSecondaryCall() {
    this.secondaryVertoCall = null;
  }

  private sendChatMessageFromPrimaryVertoCall(data: {
    method: ChatMethod;
    to: string;
    message?: string;
    fromDisplay?: string;
  }) {
    if (this.primaryVertoCall) {
      this.vertoConferenceManager.broadcastChatMessage(
        new OutgoingMessage({
          ...data,
          from: this.primaryVertoCall.callId,
        })
      );
    }
  }

  private startSecondaryCall(params: VertoCallParams) {
    this.secondaryVertoCall = new VertoCall(params);
    this.vertoLiveArray.secondaryCallId = this.secondaryVertoCall.callId;
    this.vertoConferenceManager.secondaryCallId =
      this.secondaryVertoCall.callId;
  }
}
