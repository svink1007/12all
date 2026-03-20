import VertoSubscription from "./VertoSubscription";
import VertoNotification from "./VertoNotification";
import { Participant, ParticipantParams } from "./models";
import { ConferenceLiveArrayJoinData } from "./types";

type LiveArrayParams = {
  vertoSubscription: VertoSubscription;
  vertoNotification: VertoNotification;
};

export default class VertoLiveArray {
  private readonly vertoSubscription: VertoSubscription;
  private readonly vertoNotification: VertoNotification;
  private readonly hashTable: any = {};
  private _primaryCallId: string | null = null;
  private _secondaryCallId: string | null = null;
  private orderedCallIds: any[] = [];
  private lastSerialNumber = 0;
  private serialNumberErrors = 0;
  private liveArrayChannel: string | null = null;
  private conferenceName: string | null = null;

  constructor(params: LiveArrayParams) {
    this.vertoSubscription = params.vertoSubscription;
    this.vertoNotification = params.vertoNotification;
    this.vertoNotification.onWebSocketMessage.subscribe((message) => {
      if (message.params?.pvtData?.action === "conference-liveArray-join") {
        const { laChannel, laName, callID } = message.params
          .pvtData as ConferenceLiveArrayJoinData;
        if (this._primaryCallId === callID) {
          this.liveArrayChannel = laChannel;
          this.conferenceName = laName;
          this.vertoSubscription.subscribe(this.liveArrayChannel);
          this.bootstrap();
        }
      } else if (
        message.method === "verto.event" &&
        message.params?.eventChannel === this.liveArrayChannel
      ) {
        this.handleEvent(message.params);
      }
    });
  }

  set primaryCallId(value: string) {
    this._primaryCallId = value;
  }

  set secondaryCallId(value: string) {
    this._secondaryCallId = value;
  }

  private bootstrap() {
    if (!this.liveArrayChannel) {
      return console.error("No live array channel");
    }

    this.vertoSubscription.broadcast(this.liveArrayChannel, {
      liveArray: {
        command: "bootstrap",
        context: this.liveArrayChannel,
        name: this.conferenceName,
      },
    });
  }

  private insertValue(
    callId: string | number,
    value: any,
    insertAt?: number | undefined
  ) {
    if (this.hashTable[callId]) {
      return;
    }

    this.hashTable[callId] = value;

    if (
      insertAt === undefined ||
      insertAt < 0 ||
      insertAt >= this.orderedCallIds.length
    ) {
      this.orderedCallIds = [...this.orderedCallIds, callId];
      return;
    }

    this.orderedCallIds = this.orderedCallIds.reduce(
      (accumulator, currentCallId, currentIndex) => {
        if (currentIndex === insertAt) {
          return [...accumulator, callId, currentCallId];
        }

        return [...accumulator, currentCallId];
      },
      []
    );
  }

  private deleteValue(callId: string | number) {
    if (!this.hashTable[callId]) {
      return false;
    }

    this.orderedCallIds = this.orderedCallIds.filter(
      (existingCallId) => existingCallId !== callId
    );
    delete this.hashTable[callId];
    return true;
  }

  private checkSerialNumber(serialNumber: number) {
    if (
      this.lastSerialNumber > 0 &&
      serialNumber !== this.lastSerialNumber + 1
    ) {
      this.serialNumberErrors += 1;
      if (this.serialNumberErrors < 3) {
        this.bootstrap();
      }
      return false;
    }

    if (serialNumber > 0) {
      this.lastSerialNumber = serialNumber;
    }

    return true;
  }

  private handleBootingEvent(eventSerialNumber: number, dataArray: any[]) {
    if (!this.checkSerialNumber(eventSerialNumber)) {
      return;
    }

    dataArray.forEach(([callId, value]) => this.insertValue(callId, value));

    const participants: Participant[] = dataArray.map(([callId, value]) =>
      this.parseParticipant(value, callId)
    );

    this.vertoNotification.onBootstrappedParticipants.notify(participants);
  }

  private handleAddingEvent(
    eventSerialNumber: number,
    value: string,
    callId: string,
    index?: number
  ) {
    if (!this.checkSerialNumber(eventSerialNumber)) {
      return;
    }

    this.insertValue(callId || eventSerialNumber, value, index);

    const participant = this.parseParticipant(value, callId);

    this.vertoNotification.onAddedParticipant.notify(participant);
  }

  private handleModifyingEvent(
    eventSerialNumber: number,
    value: string,
    callId: string,
    index?: number
  ) {
    if (!this.checkSerialNumber(eventSerialNumber)) {
      return;
    }

    this.insertValue(callId || eventSerialNumber, value, index);

    const participant = this.parseParticipant(value, callId);

    this.vertoNotification.onModifiedParticipant.notify(participant);
  }

  private handleDeleteEvent(
    eventSerialNumber: number,
    callId: string,
    payload: string
  ) {
    if (!this.checkSerialNumber(eventSerialNumber)) {
      return;
    }

    const isDiffAfterBoot = this.deleteValue(callId || eventSerialNumber);
    if (!isDiffAfterBoot) {
      return;
    }

    this.vertoNotification.onRemovedParticipant.notify(
      this.parseParticipant(payload, callId)
    );
  }

  private handleEvent(event: {
    data: {
      wireSerno: any;
      arrIndex: any;
      name: string;
      data: any;
      hashKey: any;
      action: any;
    };
  }) {
    const {
      wireSerno: serialNumber,
      arrIndex: arrayIndex,
      name,
      data: payload,
      hashKey: callId,
      action,
    } = event.data;

    if (name !== this.conferenceName) {
      return;
    }

    switch (action) {
      case "bootObj":
        this.handleBootingEvent(serialNumber, payload);
        break;
      case "add":
        this.handleAddingEvent(serialNumber, payload, callId, arrayIndex);
        break;
      case "modify":
        if (arrayIndex || callId) {
          this.handleModifyingEvent(serialNumber, payload, callId, arrayIndex);
        }
        break;
      case "del":
        if (arrayIndex || callId) {
          this.handleDeleteEvent(serialNumber, callId, payload);
        }
        break;
      default:
        console.warn("Ignoring not implemented live array action", action);
        break;
    }
  }

  private parseParticipant(value: string, callId: string) {
    const { audio, video } = JSON.parse(value[4]);
    const me =
      this._primaryCallId === callId || this._secondaryCallId === callId;
    const participantId = value[0];
    const pAudio = {
      muted: audio.muted,
      talking: audio.talking,
    };
    let pVideo = {
      muted: true,
      floor: video.floor,
      floorLocked: video.floorLocked,
    };
    if (video.mediaFlow === "sendRecv") {
      pVideo.muted = video.muted;
    }
    const {
      showMe,
      isHost,
      channelName,
      displayName,
      isHostSharedVideo,
      isMobileApp,
      isVlrConnection,
      isPrimaryCall,
      userId,
      hasSocket,
    }: any = value[5];

    const params: ParticipantParams = {
      callId,
      participantId,
      participantName: displayName,
      me,
      channelName,
      audio: pAudio,
      video: pVideo,
      showMe: showMe === "true",
      isHost: isHost === "true",
      isHostSharedVideo: isHostSharedVideo === "true",
      isMobileApp: isMobileApp === "true",
      isVlrConnection: isVlrConnection === "true",
      isPrimaryCall:
        isPrimaryCall !== undefined ? isPrimaryCall === "true" : undefined,
      userId: userId ? +userId : undefined,
      hasSocket: hasSocket === "true",
    };

    return new Participant(params);
  }
}
