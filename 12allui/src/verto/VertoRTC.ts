import VertoNotification from "./VertoNotification";
import { IceServerService } from "../services";
import { IceServer } from "../shared/types";

type VertoRTCOptions = {
  notifyOnStateChange: boolean;
  stream: MediaStream;
  notification: VertoNotification;
  receiveStream: boolean;
  onIceSdp: (sdp: string) => void;
  onPeerStreamingError: (err: any) => void;
  onStateChange?: () => void;
  onRemoteStream?: (stream: MediaStream) => void;
};

let iceServers: IceServer[];

export default class VertoRTC {
  public readonly options: VertoRTCOptions;
  private pc: RTCPeerConnection | null = null;

  constructor(options: VertoRTCOptions) {
    this.options = options;
    this.init().then();
  }

  addAnswerSDP(sdp: string, cbError: (error: any) => void) {
    this.pc
      ?.setRemoteDescription(new RTCSessionDescription({ sdp, type: "answer" }))
      .catch(cbError);
  }

  stop() {
    this.options.stream.getTracks().forEach((track) => track.stop());
    this.pc?.close();
  }

  // Removes any remaining event listeners
  private cleanupEventListeners() {
    if (this.pc) {
      this.pc.removeEventListener("icecandidate", () => {});
      this.pc.removeEventListener("track", () => {});
      this.pc.removeEventListener("connectionstatechange", () => {});
    }
  }

  close() {
    this.stop(); // Stop all media tracks

    // Close the RTCPeerConnection if it exists
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Remove any event listeners if they were set
    this.cleanupEventListeners();
  }

  replaceTracks(stream: MediaStream) {
    stream.getTracks().forEach((track: MediaStreamTrack) => {

      // @@@
      const sender = this.pc
        ?.getSenders()
        .find((s: RTCRtpSender) => s.track?.kind === track.kind);
      if (sender) {
        if (track !== sender.track) {
          sender.replaceTrack(track).catch((err) => console.error(err));
        } else {
          console.error('@@@ track identical no replace');
        }
      }
    });

    this.options.notification.onReplaceTracksDone.notify(null);
  }

  getVideoTrackStats() {
    if (this.pc) {
      const videoTrack = this.pc
        .getSenders()
        .find((sender) => sender.track?.kind === "video");
      return this.pc.getStats(videoTrack?.track);
    }
  }

  private async init() {
    const {
      stream,
      receiveStream,
      notification,
      notifyOnStateChange,
      onIceSdp,
      onStateChange,
      onRemoteStream,
      onPeerStreamingError,
    } = this.options;

    if (!iceServers) {
      try {
        const { data } = await IceServerService.getIceServers();
        iceServers = data;
      } catch (e) {
        iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
      }
    }

    this.pc = new RTCPeerConnection({ iceServers });

    const tracks = stream.getTracks();
    if (tracks.length === 1) {
      if (stream.getAudioTracks().length > 0) {
        this.pc.addTrack(stream.getAudioTracks()[0]);
      } else {
        throw new Error("Audio stream is a must");
      }
    } else if (tracks.length === 2) {
      this.pc.addTrack(stream.getAudioTracks()[0]);
      this.pc.addTrack(stream.getVideoTracks()[0]);
    } else {
      throw new Error("Invalid tracks");
    }

    let addedTracks = 0;
    let iceCandidateTimeout: NodeJS.Timeout;
    const handleIceCandidateDone = () => {
      this.pc?.removeEventListener("icecandidate", listeners.icecandidate);
      this.pc?.localDescription && onIceSdp(this.pc.localDescription.sdp);
    };
    const listeners = {
      icecandidate: ({ candidate }: RTCPeerConnectionIceEvent) => {
        iceCandidateTimeout && clearTimeout(iceCandidateTimeout);
        if (!candidate) {
          handleIceCandidateDone();
        } else {
          iceCandidateTimeout = setTimeout(handleIceCandidateDone, 1000);
        }
      },
      track: ({ streams: [remote] }: RTCTrackEvent) => {
        if (remote) {
          notification.onPlayRemoteVideo.notify(remote);
          onRemoteStream && onRemoteStream(remote);
          // @@@
          if (remote.getTracks().length == 2) {
            this.pc?.removeEventListener("track", listeners.track);
          }
          if (remote.getTracks().length <2) {
            debugger;
          }
          addedTracks++;
          // if (tracks.length === addedTracks) {
          //   this.pc?.removeEventListener("track", listeners.track);
          // }
        }
      },
      connectionstatechange: () => {
        this.pc?.removeEventListener(
          "connectionstatechange",
          listeners.connectionstatechange
        );
        notifyOnStateChange && notification.onStateChange.notify(null);
        onStateChange && onStateChange();
      },
    };

    this.pc.addEventListener("icecandidate", listeners.icecandidate);
    this.pc.addEventListener("track", listeners.track);
    this.pc.addEventListener(
      "connectionstatechange",
      listeners.connectionstatechange
    );

    try {
      const sessionDescription = await this.pc.createOffer({
        offerToReceiveVideo: receiveStream,
        offerToReceiveAudio: receiveStream,
      });
      await this.pc.setLocalDescription(sessionDescription);
    } catch (error: any) {
      onPeerStreamingError(error);
    }
  }
}
