import VertoSubscription from './VertoSubscription';
import VertoNotification from './VertoNotification';
import {IncomingMessage, OutgoingMessage, SwitchHost} from './models';
import {ChatMethod} from './enums';
import {ConferenceLiveArrayJoinData, VertoLayout} from './types';

type VertoConferenceManagerParams = {
  vertoSubscription: VertoSubscription,
  vertoNotification: VertoNotification,
  imHost: boolean
};

export default class VertoConferenceManager {
  private readonly vertoSubscription: VertoSubscription;
  private readonly vertoNotification: VertoNotification;
  private _primaryId: string | null = null;
  private _secondaryCallId: string | null = null;
  private chatChannel: string | null = null;
  private _moderatorChannel: string | null = null;
  private forceModerator = false;

  constructor(params: VertoConferenceManagerParams) {
    this.vertoSubscription = params.vertoSubscription;
    this.vertoNotification = params.vertoNotification;
    this.vertoNotification.onWebsocketReconnected.subscribe(() => {
      this._primaryId = null;
      // We add force moderating in order for а participant to remove his previous/death connection
      this.forceModerator = true;
    });

    this.vertoNotification.onWebSocketMessage.subscribe((message) => {
      if (message.params?.pvtData?.action === 'conference-liveArray-join') {
        if (this._primaryId) {
          return;
        }

        const {
          callID,
          chatChannel,
          infoChannel,
          modChannel
        } = message.params.pvtData as ConferenceLiveArrayJoinData;
        this._primaryId = callID;
        this.chatChannel = chatChannel;
        this.vertoSubscription.subscribe(chatChannel);
        this.vertoSubscription.subscribe(infoChannel);

        if (modChannel) {
          this._moderatorChannel = modChannel;
        } else if ((params.imHost || this.forceModerator) && chatChannel) {
          this._moderatorChannel = chatChannel.replace('chat', 'mod');
        }
      } else if (message.method === 'verto.event' && message.params?.eventChannel === this.chatChannel) {
        this.handleChatEvent(message.params);
      } else if (message.method === 'verto.event' && message.params?.eventData?.canvasInfo) {
        this.vertoNotification.onLayoutChange.notify(message.params.eventData.canvasInfo.layoutName);
      }
    });
  }

  get moderatorChannel() {
    return this._moderatorChannel;
  }

  set moderatorChannel(value: string | null) {
    this._moderatorChannel = value;
  }

  set secondaryCallId(value: string) {
    this._secondaryCallId = value;
  }

  private handleChatEvent({data}: any) {
    try {
      const {message, method, to, from, fromDisplay}: OutgoingMessage = JSON.parse(data.message);

      switch (method) {
        case ChatMethod.ToEveryone:
          message && this.vertoNotification.onChatMessageToAll.notify(new IncomingMessage(to, fromDisplay || data.fromDisplay, message, this._primaryId === from));
          break;
        case ChatMethod.AskToUnmuteMic:
          if (this._primaryId === to) {
            this.vertoNotification.onAskToUnmuteMic.notify(null);
          }
          break;
        case ChatMethod.AskToStartCam:
          if (this._primaryId === to) {
            this.vertoNotification.onAskToStartCam.notify(null);
          }
          break;
        case ChatMethod.OneToOne:
          if (message && (this._primaryId === from || this._primaryId === to)) {
            const sendTo = this._primaryId === from ? to : from;
            const im = new IncomingMessage(sendTo, fromDisplay || data.fromDisplay, message, this._primaryId === from);
            this.vertoNotification.onChatMessageOneToOne.notify(im);
          }
          break;
        case ChatMethod.SwitchHostStream:
          if (this._primaryId === to) {
            let username = '';
            let password = '';

            if (message) {
              try {
                const m = JSON.parse(message);
                username = m.username;
                password = m.password;
              } catch (e) {
                console.error(e);
              }
            } else {
              console.error('No moderator data');
            }
            this.vertoNotification.onChatMessageSwitchHostStream.notify(new SwitchHost(username, password, to));
          } else if (message && this._primaryId !== from) {
            const {hostName} = JSON.parse(message);
            this.vertoNotification.onHostChangeStream.notify(hostName);
          }
          break;
        case ChatMethod.SwitchHostCamera:
          if (this._primaryId === to) {
            this.vertoNotification.onChatMessageSwitchHostCamera.notify(null);
          }
          break;
        case ChatMethod.ChangeParticipantState:
          if (message) {
            try {
              const m = JSON.parse(message);
              this.vertoNotification.onChatMessageChangeParticipantState.notify(m);
            } catch (e) {
              console.error('Cannot parse ChangeParticipantState message');
            }
          }
          break;
        case ChatMethod.StreamChange:
          if (this._primaryId !== from && message) {
            try {
              const m = JSON.parse(message);
              this.vertoNotification.onChatMessageStreamChange.notify(m);
            } catch (e) {
              console.error('Cannot parse StreamChange message');
            }
          }
          break;
        case ChatMethod.MakeCoHost:
          const callIds = to.split(',');
          if (this._primaryId && callIds.indexOf(this._primaryId) !== -1 && message) {
            try {
              const m = JSON.parse(message);
              m.callIds = callIds;
              this.vertoNotification.onMakeCoHost.notify(m);
            } catch (e) {
              console.error('Cannot parse MakeCoHost message');
            }
          }
          break;
        case ChatMethod.RemoveCoHost:
          if (message) {
            try {
              const m = JSON.parse(message);
              m.me = this._primaryId === to;
              if (m.me || m.coHostCallIds.indexOf(this._primaryId)) {
                this.vertoNotification.onRemoveCoHost.notify(m);
              }
            } catch (e) {
              console.error('Cannot parse RemoveCoHost message');
            }
          }
          break;
        case ChatMethod.RemoveParticipant:
          if (this._primaryId === to) {
            this.vertoNotification.onYouHaveBeenRemoved.notify(null);
          } else if (this._secondaryCallId === to) {
            this.vertoNotification.onYoursSharingHaveBeenRemoved.notify(null);
          }
          break;
        case ChatMethod.HostLeft:
          this.vertoNotification.onRoomClosed.notify(null);
          break;
        case ChatMethod.StopMediaShare:
          if (this._primaryId !== to) {
            this.vertoNotification.onStopMediaShare.notify(null);
          }
          break;
        case ChatMethod.StopAllMediaShare:
          if (this._primaryId !== from) {
            this.vertoNotification.onStopAllMediaShare.notify(null);
          }
          break;
        case ChatMethod.BlockParticipant:
          if (this._primaryId === to) {
            this.vertoNotification.onYouHaveBeenBlocked.notify(null);
          }
          break;
        case ChatMethod.YouAreHost:
          if (this._primaryId === to) {
            this.vertoNotification.onYouAreHost.notify(null);
          } else if (message) {
            this.vertoNotification.onHostChange.notify(message);
          }
          break;
      }
    } catch (e) {
      console.error('Invalid message');
    }
  }

  private broadcast(
    eventChannel: string,
    data: {
      command?: any;
      id?: number | null;
      value?: any;
      application?: string;
      message?: string;
      action?: string;
      type?: string;
    }
  ) {
    if (!eventChannel) {
      return;
    }
   
    this.vertoNotification.sendWsRequest.notify(
      {
        method: 'verto.broadcast',
        params: {eventChannel, data},
        onSuccess: () => {
        },
        onError: (e: any) => console.error(e)
      }
    );
  }

  private broadcastModeratorCommand(
    command: string,
    memberId: string | null,
    argument?: string | any[]
  ) {
    if (!this._moderatorChannel) {
      console.error('No moderator rights');
      return;
    }

    let id: number | null = null;
    if (memberId) {
      id = parseInt(memberId, 10);
    }

   


    this.broadcast(this._moderatorChannel, {
      command,
      id,
      value: argument,
      application: 'conf-control'
    });
  }

  private broadcastModeratorCommandAction(
      command: string,
      memberId: string | null,
      argument?: string | any[],
      application?: string
  ) {
    if (!this._moderatorChannel) {
      console.error('No moderator rights');
      return;
    }
    let id: number | null = null;
    if (memberId) {
      id = parseInt(memberId, 10);
    }
    this.broadcast(this._moderatorChannel, {
      command,
      id,
      value: argument,
      application: application
    });
  }

  broadcastRoomCommand(command: string, argument?: string | any[]) {
    this.broadcastModeratorCommand(command, null, argument);
  }

  broadcastRoomAction(command: string, application?: string, argument?: string | any[]) {
    this.broadcastModeratorCommandAction(command, null, argument, application);
  }

  broadcastChatMessage(message: OutgoingMessage) {
    if (!this.chatChannel) {
      return console.error('No chat channel');
    }
    this.broadcast(this.chatChannel, {
      action: 'send',
      type: 'message',
      message: JSON.stringify(message)
    });
  }

  // askVideoLayouts() {
  //   this.broadcastRoomCommand('list-videoLayouts');
  // }
  //
  // playMediaFileFromServer(filename?: string) {
  //   this.broadcastRoomCommand('play', filename);
  // }
  //
  // stopMediaFilesFromServer() {
  //   this.broadcastRoomCommand('stop', 'all');
  // }
  //
  // startRecordingOnServer(filename: string) {
  //   this.broadcastRoomCommand('recording', ['start', filename]);
  // }
  //
  // stopRecordingsOnServer() {
  //   this.broadcastRoomCommand('recording', ['stop', 'all']);
  // }
  //
  // saveSnapshotOnServer(filename?: string | string[]) {
  //   this.broadcastRoomCommand('vid-write-png', filename);
  // }

  // changeVideoLayout(layout?: string | string[], canvas?: string) {
  changeVideoLayout(layout: VertoLayout) {
    this.broadcastRoomCommand('vid-layout', layout);
  }

  runDebugCommand(command: string, argument?: string | any[], application?: string) {
    this.broadcastRoomAction(command, application, argument);
  }

  moderateMemberById(memberId: string) {
    const constantBroadcasterFor = (command: string) => (argument?: string | any[]) => () => {
      this.broadcastModeratorCommand(command, memberId, argument);
    };

    const parameterizedBroadcasterFor = (command: string) => (
      argument?: string | any[]
    ) => {
      this.broadcastModeratorCommand(command, memberId, argument);
    };

    const parameterizedBroadcasterForSettingVideoBanner = (text: string) => {
      // this.broadcastModeratorCommand('vid-banner', memberId, 'reset');

      if (text.trim().toLowerCase() === 'reset') {
        this.broadcastModeratorCommand('vid-banner', memberId, `${text}\n`);
      } else {
        this.broadcastModeratorCommand('vid-banner', memberId, encodeURI(text));
      }
    };

    const constantBroadcasterForCleaningVideoBanner = () => {
      this.broadcastModeratorCommand('vid-banner', memberId, 'reset');
    };

    return {
      toBeNotDeaf: constantBroadcasterFor('undeaf')(),
      toBeDeaf: constantBroadcasterFor('deaf')(),
      toBeKickedOut: constantBroadcasterFor('kick')(),
      toToggleMicrophone: constantBroadcasterFor('tmute')(),
      toToggleCamera: constantBroadcasterFor('tvmute')(),
      toBePresenter: constantBroadcasterFor('vid-res-id')('presenter'),
      toBeVideoFloor: constantBroadcasterFor('vid-floor')('force'),
      toHaveVideoBannerAs: parameterizedBroadcasterForSettingVideoBanner,
      toCleanVideoBanner: constantBroadcasterForCleaningVideoBanner,
      toIncreaseVolumeOutput: constantBroadcasterFor('volume_out')('up'),
      toDecreaseVolumeOutput: constantBroadcasterFor('volume_out')('down'),
      toIncreaseVolumeInput: constantBroadcasterFor('volume_in')('up'),
      toDecreaseVolumeInput: constantBroadcasterFor('volume_in')('down'),
      toTransferTo: parameterizedBroadcasterFor('transfer')
    };
  }
}
