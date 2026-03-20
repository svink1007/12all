import VertoRTC from "./VertoRTC";
import { VertoCallParams } from "./types";
import VertoNotification from "./VertoNotification";
import { nanoid } from "nanoid";
import VertoVariables from "./VertoVariables";

type DialogParams = {
  caller_id_name: string;
  destination_number: string;
  remote_caller_id_name: string;
  connectionType: string;
  // remote_caller_id_number: string;
  callID: string;
  dedEnc: boolean;
  userVariables: any;
  outgoingBandwidth: number;
  incomingBandwidth: number;
};

export default class VertoCall {
  private readonly notification: VertoNotification;
  public readonly dialogParams: DialogParams;
  private readonly _callId: string = nanoid();
  private readonly onDestroy?: () => void;
  public readonly rtc: VertoRTC;

  constructor(params: VertoCallParams) {
    const {
      destinationNumber,
      showMe,
      isHost,
      isHostSharedVideo,
      channelName,
      callerName,
      isPrimaryCall,
      userId,
      moderatorUsername,
      notification,
      receiveStream,
      notifyOnStateChange,
      localStream,
      outgoingBandwidth,
      incomingBandwidth,
      connectionType,
      onDestroy,
      onRTCStateChange,
      onRemoteStream,
    } = params;

    this.notification = notification;
    this.onDestroy = onDestroy;

    this.dialogParams = {
      callID: this._callId,
      caller_id_name: moderatorUsername,
      remote_caller_id_name: callerName,
      // remote_caller_id_number: destination_number,
      destination_number: destinationNumber,
      outgoingBandwidth,
      incomingBandwidth,
      dedEnc: false,
      connectionType,
      userVariables: {
        showMe,
        isHost,
        isHostSharedVideo,
        channelName,
        displayName: callerName,
        isPrimaryCall: isPrimaryCall || false,
        userId: `${userId}`,
        hasSocket: true,
        user_url: "hub.one2all.tv",
      },
    };

    const websocketId = notification.onWebSocketMessage.subscribe((data) => {
      if (
        data.params?.callID === this.callId &&
        data.method === "verto.media"
      ) {
        this.handleMedia(data.params.sdp);
        notification.onWebSocketMessage.unsubscribe(websocketId);
      }
    });

    this.rtc = new VertoRTC({
      stream: localStream,
      notifyOnStateChange,
      notification,
      receiveStream,
      onStateChange: onRTCStateChange,
      onRemoteStream,
      onIceSdp: (sdp: string) => {
        let modifiedSdp = sdp;

        // Check if video codec is supported
        if (VertoVariables.sdpVideoCodecRegex) {
          const videoCodec = sdp.match(
            new RegExp(VertoVariables.sdpVideoCodecRegex)
          );
          const videoCodecSupported = videoCodec && videoCodec.length > 1;
          const sdpSplit = modifiedSdp.split("\r\n");
          for (let i = 0; i < sdpSplit.length; i++) {
            const line = sdpSplit[i];

            // Add to each fmtp cbr=1
            // const fmtp = /^a=fmtp:\d+/.test(line);
            // if (fmtp) {
            //   sdpSplit[i] = `${sdpSplit[i]};cbr=1`;
            //   continue;
            // }

            // If codec is supported remove all others codec
            if (videoCodecSupported) {
              const videoMatch = line.match(/^(m=video \d+ [^ ]+ )/g);
              if (videoMatch) {
                sdpSplit[i] = `${videoMatch[0]}${videoCodec[1]}`;
                break;
              }
            }
          }
          modifiedSdp = sdpSplit.join("\n");
        }

        this.broadcastMethod("verto.invite", { sdp: modifiedSdp });
      },
      onPeerStreamingError: (error: any) => {
        this.notification.onPeerStreamingError.notify(error);
        this.hangup();
      },
    });
  }

  get callId() {
    return this._callId;
  }

  hangup() {
    this.broadcastMethod("verto.bye");
  }

  sendTouchTone(digit: string) {
    this.broadcastMethod("verto.info", { dtmf: digit });
  }

  replaceTracks(stream: MediaStream) {
    this.rtc?.replaceTracks(stream);
  }

  getRTCVideoTrackStats() {
    return this.rtc?.getVideoTrackStats();
  }

  private broadcastMethod(method: string, options?: any) {
    console.log("DialogParams:", this.dialogParams);

    this.notification.sendWebSocketRequest.notify({
      method,
      params: {
        ...options,
        dialogParams: this.dialogParams,
      },
      onSuccess: () => this.handleMethodResponse(method, true),
      onError: () => this.handleMethodResponse(method, false),
    });
  }

  private handleMethodResponse(method: string, success: boolean) {
    switch (method) {
      case "verto.answer":
      case "verto.attach":
      case "verto.invite":
        if (!success) {
          this.hangup();
        }
        break;
      case "verto.bye":
        this.rtc?.stop();
        this.notification.onDestroy.notify(null);
        this.onDestroy && this.onDestroy();
        break;
    }
  }

  stopVideoTrack() {
    this.rtc.stopVideoTrack();
  }

  private handleMedia(sdp: string) {
    this.rtc.addAnswerSDP(sdp, (error: any) => {
      console.error("Error remove description", error);
      this.notification.onEarlyCallError.notify(null);
      this.hangup();
    });
  }
}
