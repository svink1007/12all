import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPopover,
  isPlatform
} from '@ionic/react';
import {
    chatbubblesOutline,
    cogOutline,
    filmOutline,
    informationCircleOutline,
    micOffOutline,
    micOutline,
    peopleOutline, radioButtonOn,
    scanOutline,
    shareSocialOutline, star,
    stop, stopCircleOutline,
    videocamOffOutline,
    videocamOutline
} from 'ionicons/icons';
import bets from "../../../../images/icons/bets/bet.svg";
import betsSelected from "../../../../images/icons/bets/bet-selected.svg";
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';
import UserMediaModal from '../../../../components/UserMediaModal';
import {WebRTCUserMedia} from '../../types';
import Invite from '../../../../components/Invite';
import screen from '../../../../images/icons/screen.svg';
import files from '../../../../images/icons/file.svg';
import myStream from '../../../../images/icons/my-stream.svg';
import myCamera from '../../../../images/icons/my-camera.svg';
import {LivingRoomMode, ShareStreamOption} from '../../enums';
import {VertoLayout} from '../../../../verto/types';
import RoomChangeLayout from '../../../../components/RoomChangeLayout';
import {useTranslation} from 'react-i18next';
import setLivingRoom from '../../../../redux/actions/livingRoomActions';
import ChangeRoomStatus from '../../../../components/ChangeRoomStatus';
import {setInfoToast} from "../../../../redux/actions/toastActions";
import giveRewardIcon from '../../../../images/icons/ask-reward.svg';
import giveRewardIconSelected from "../../../../images/icons/ask-reward-selected.svg";
import CustomBadge from 'src/components/CustomBadge';
import RecordButton from '../../components/RecordButton';

type Props = {
  showChat: boolean;
  onShowChat: (value: boolean) => void;
  showDebugStream?: boolean;
  micMuted: boolean;
  camStopped: boolean;
  isFullscreen: boolean;
  onShowParticipants: (value: boolean) => void;
  showParticipants?: boolean;
  onUserMediaChange: (value: WebRTCUserMedia) => void;
  onToggleCam: () => void;
  onToggleMic: () => void;
  onFullscreen: (value: boolean) => void;
  onScreenShare: () => void;
  onStopScreenShare: () => void;
  onChangeStream: () => void;
  onChangeFile: () => void;
  onStopStream: () => void;
  onShowDebugStream?: (value: boolean) => void;
  onLayoutChange: (layout: VertoLayout) => void;
  onShareMyCamera: () => void;
  onSharedOptionChanged: (option: ShareStreamOption) => void;
  setIsSecondaryRecalled: (value: boolean) => void;
  theatreMode?: boolean;
  onTheatreMode: () => void;
  showBets?: boolean;
  onShowBets: (value: boolean) => void; 
  showGiveRewards?: boolean,
  onShowGiveRewards: (value: boolean) => void; 
  currentLayout?: string ;
  participantsCount: number;
  recordedId: string |null
};

const SideBar: FC<Props> = ({
                              showParticipants,
                              showChat,
                              onShowParticipants,
                              onShowChat,
                              showDebugStream,
                              micMuted,
                              isFullscreen,
                              camStopped,
                              onToggleCam,
                              onToggleMic,
                              onShowDebugStream,
                              onUserMediaChange,
                              onFullscreen,
                              onScreenShare,
                              onStopScreenShare,
                              onChangeStream,
                              onChangeFile,
                              onStopStream,
                              onLayoutChange,
                              onShareMyCamera,
                              onSharedOptionChanged,
                              theatreMode,
                              onTheatreMode,
                              setIsSecondaryRecalled,
                              showBets,
                              onShowBets,
                              showGiveRewards,
                              onShowGiveRewards ,
                              currentLayout ,
                              participantsCount,
                              recordedId                         
                            }: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const unreadMessages = useSelector(({unreadMessages}: ReduxSelectors) => unreadMessages);
  const livingRoom = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
  const {isCoHost, sharingInProgress} = useSelector(({inRoom}: ReduxSelectors) => inRoom);
  const {unableCamTimeout} = useSelector(({webConfig}: ReduxSelectors) => webConfig);
  const {showDebugInfo} = useSelector(({profile}: ReduxSelectors) => profile);

  const init = useRef<boolean>(true);
  const mediaPopover = useRef<HTMLIonPopoverElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [cam, setCam] = useState<string | null>(null);
  const [openMediaPopover, setOpenMediaPopover] = useState<boolean>(false);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  useEffect(() => {
    // We need this, because if you try to open camera immediately after connecting to the room, instead of the camera, mic is toggled
    setTimeout(() => {
      init.current = false;
    }, unableCamTimeout * 1000);
  }, [unableCamTimeout]);

  const handleToggleMic = () => {
    onToggleMic();
  };

  const handleToggleCam = () => {
    if (!init.current) {
      onToggleCam();
    } else {
      setTimeout(() => {
        handleToggleCam();
      }, 250);
    }
  };

  const handleShowMediaPopover = (event: React.MouseEvent) => {
    mediaPopover.current!.event = event;
    setOpenMediaPopover(true);
  };

  const handleMediaPopoverDismiss = () => {
    mediaPopover.current!.dismiss().then();
  };

  const handleMediaSelect = (option: ShareStreamOption) => {
    handleMediaPopoverDismiss();

    onSharedOptionChanged(option);

    if (livingRoom.singleConnection && livingRoom.share !== "file") {
      if (option === ShareStreamOption.Camera) {
        !micMuted && onToggleMic();
        dispatch(setLivingRoom({joinCamMic: true}));
      } else {
        dispatch(setLivingRoom({joinCamMic: false}));
        micMuted && onToggleMic();
      }

      camStopped && onToggleCam();
    }

    switch (option) {
      case ShareStreamOption.Stream:
        setIsSecondaryRecalled(false)
        onChangeStream();
        break;
      case ShareStreamOption.File:
        onChangeFile();
        break;
      case ShareStreamOption.Camera:
        onShareMyCamera();
        break;
      case ShareStreamOption.Screen:
        onScreenShare();
        break;
    }
  };

  const handleStopMedia = () => {
    handleMediaPopoverDismiss();

    switch (livingRoom.share) {
      case ShareStreamOption.Stream:
      case ShareStreamOption.File:
        onStopStream();
        break;
      case ShareStreamOption.Screen:
        onStopScreenShare();
        break;
    }
  };



  return (
    <div className={`living-room-side-bar ${isFullscreen ? 'fullscreen' : ''}`}>
        <IonButtons>
            {
                showDebugInfo && livingRoom.isHost &&
                <IonButton
                    title={t('roomSideBar.streamInfo')}
                    onClick={() => onShowDebugStream && onShowDebugStream(!showDebugStream)}>
                    <IonIcon
                        slot="icon-only"
                        icon={informationCircleOutline}
                        color={showDebugStream ? 'success' : 'dark'}
                    />
                </IonButton>
            }
             {!livingRoom.isHost &&
                <IonButton
                    className="side-bar-settings"
                    title={"give star"}
                    onClick={() =>onShowGiveRewards(!showGiveRewards) }
                >
                    <IonIcon slot="icon-only" icon={showGiveRewards ?giveRewardIconSelected:giveRewardIcon}  />
                </IonButton>
            }

            <div className={"flex gap-x-2 flex-row"}>
                <RecordButton 
                    classname={'side-bar-settings'} 
                    recordedId={recordedId}
                />
            </div>

            {
                (livingRoom.isHost || isCoHost) &&
                <>
                    <ChangeRoomStatus
                        isPrivateInitial={livingRoom.mode === LivingRoomMode.Private}
                        onChangeRoomStatus={(value) => dispatch(setLivingRoom({mode: value ? LivingRoomMode.Private : LivingRoomMode.Public}))}
                    />
                    {
                        !isPlatform('ios') &&
                        <IonButton
                            onClick={handleShowMediaPopover}
                            title={t('roomSideBar.media')}
                        >
                            <IonIcon slot="icon-only" icon={filmOutline} color={openMediaPopover ? 'success' : 'dark'}/>
                        </IonButton>
                    }

                    <RoomChangeLayout onLayoutChange={onLayoutChange}/>

                    <IonButton
                        onClick={() => {
                            onShowParticipants(!showParticipants)
                            if(theatreMode) {
                                onShowChat(false)
                            }
                        }}
                        title={t('roomSideBar.participants')}
                    >
                        <IonIcon
                            slot="icon-only"
                            icon={peopleOutline}
                            color={showParticipants ? 'success' : 'dark'}
                        />
                        <CustomBadge 
                            badgeNumber={participantsCount} 
                            isHidden={participantsCount===0} 
                            badgeColor={'primary'} />
                    </IonButton>
                </>
            }

            {
                livingRoom.joinCamMic &&
                <IonButton
                    onClick={() => setShowSettingsModal(true)}
                    className="side-bar-settings"
                    title={t('roomSideBar.settings')}
                >
                    <IonIcon
                        slot="icon-only"
                        icon={cogOutline}
                        color={showSettingsModal ? 'success' : 'dark'}
                    />
                </IonButton>
            }

            <IonButton
                onClick={() => setShowInviteModal(true)}
                className="invite-button"
                title={t('roomSideBar.share')}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeLinecap="round"
                        strokeLinejoin="round"/>
                    <path d="M3.40991 22C3.40991 18.13 7.25991 15 11.9999 15C12.9599 15 13.8899 15.13 14.7599 15.37"
                          stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeLinecap="round"
                          strokeLinejoin="round"/>
                    <path
                        d="M22 18C22 18.32 21.96 18.63 21.88 18.93C21.79 19.33 21.63 19.72 21.42 20.06C20.73 21.22 19.46 22 18 22C16.97 22 16.04 21.61 15.34 20.97C15.04 20.71 14.78 20.4 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.92 14.43 15.93 15.13 15.21C15.86 14.46 16.88 14 18 14C19.18 14 20.25 14.51 20.97 15.33C21.61 16.04 22 16.98 22 18Z"
                        stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeMiterlimit="10"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.49 17.98H16.51" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5"
                          strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 16.52V19.51" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5"
                          strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </IonButton>

            <IonButton
                onClick={() => {
                    onShowChat(!showChat)
                    if(theatreMode) {
                        onShowParticipants(false)
                    }
                }}
                className="chat-button"
                title={t('roomSideBar.chat')}
            >
                <IonIcon
                    slot="icon-only"
                    icon={chatbubblesOutline}
                    color={showChat ? 'success' : 'dark'}
                />
                
                <CustomBadge 
                    badgeNumber={unreadMessages.accumulator} 
                    isHidden={showChat || unreadMessages.accumulator <= 0}
                    badgeColor={'primary'}/>
            </IonButton>

            {
                (cam !== null ? cam !== 'none' : livingRoom.joinCamMic && livingRoom.cam !== 'none') &&
                <IonButton onClick={handleToggleCam} title={t('roomSideBar.cam')}>
                    <IonIcon
                        slot="icon-only"
                        icon={camStopped ? videocamOffOutline : videocamOutline}
                        color={camStopped ? 'dark' : 'success'}
                    />
                </IonButton>
            }

            {
                livingRoom.joinCamMic &&
                <IonButton onClick={handleToggleMic} title={t('roomSideBar.mic')}>
                    <IonIcon
                        slot="icon-only"
                        icon={micMuted ? micOffOutline : micOutline}
                        color={micMuted ? 'dark' : 'success'}
                    />
                </IonButton>
            }

            <IonButton
                className="theatre-mode-button F!w-[48px] !h-[48px]"
                title={t("roomSideBar.theatreMode")}
                onClick={() => {
                    onTheatreMode()
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    width={24}
                    height={24}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                        <path
                            d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
                            stroke={ currentLayout===VertoLayout.OnlyVideo ? "#2dd36f" : "#fff"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path
                            d="M20.9992 21L14.9492 14.95"
                            stroke={ currentLayout===VertoLayout.OnlyVideo ? "#2dd36f" : "#fff"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path
                            d="M6 10H14"
                            stroke={ currentLayout===VertoLayout.OnlyVideo ? "#2dd36f" : "#fff"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path
                            d="M10 6V14"
                            stroke={ currentLayout===VertoLayout.OnlyVideo ? "#2dd36f" : "#fff"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                    </g>
                </svg>
            </IonButton>
            {profile != undefined && profile.id != undefined  && profile.id !== 0 &&
                <IonButton
                    onClick={() => {
                        onShowBets(!showBets)
                        if(theatreMode) {
                            onShowChat(false)
                        }
                    }}
                    title={t("roomSideBar.bets")}
                >
                    <IonIcon
                        slot="icon-only"
                        icon={ showBets?betsSelected:bets }
                    />
                </IonButton>
            }
            <IonButton
                onClick={() => onFullscreen(!isFullscreen)}
                className="fullscreen-btn"
                title={t('roomSideBar.fullscreen')}
            >
                <IonIcon
                    slot="icon-only"
                    icon={scanOutline}
                    color={isFullscreen ? 'success' : 'dark'}
                />
            </IonButton>
        </IonButtons>

        <UserMediaModal
            show={showSettingsModal}
            setShow={setShowSettingsModal}
            onSelect={(media: WebRTCUserMedia) => {
                setCam(media.cam);
                onUserMediaChange(media);
            }}
        />

        <Invite
            roomPublicId={livingRoom.publicRoomId}
            showPushInvite={(livingRoom.isHost || isCoHost) && livingRoom.mode !== LivingRoomMode.Private}
            show={showInviteModal}
            url={livingRoom.invitationUrl}
            onClose={() => setShowInviteModal(false)}
        />

        <IonPopover
            ref={mediaPopover}
            isOpen={openMediaPopover}
            onDidDismiss={() => setOpenMediaPopover(false)}
            className="side-bar-media-popover"
            alignment="start"
            side="start"
        >
            <IonList>
                <IonListHeader>{t('roomSideBar.selectMediaToShare')}</IonListHeader>
                <IonItem button onClick={() => handleMediaSelect(ShareStreamOption.Stream)}>
                    <IonImg src={myStream} slot="start"/>
                    <IonLabel>{t('roomSideBar.myStream')}</IonLabel>
                </IonItem>
                <IonItem button onClick={() => handleMediaSelect(ShareStreamOption.File)}>
                    <IonImg src={files} slot="start"/>
                    <IonLabel>{t('roomSideBar.file')}</IonLabel>
                </IonItem>
                {
                    !livingRoom.joinCamMic &&
                    <IonItem button onClick={() => handleMediaSelect(ShareStreamOption.Camera)}>
                        <IonImg src={myCamera} slot="start"/>
                        <IonLabel>{t('roomSideBar.myCamera')}</IonLabel>
                    </IonItem>
                }
                <IonItem button onClick={() => handleMediaSelect(ShareStreamOption.Screen)}>
            <IonImg src={screen} slot="start"/>
            <IonLabel>{t('roomSideBar.shareMyScreen')}</IonLabel>
          </IonItem>
          {
            sharingInProgress &&
            <IonItem button onClick={() => handleStopMedia()}>
              <IonIcon icon={stop} slot="start" color="dark"/>
              <IonLabel>{t('roomSideBar.stop')}</IonLabel>
            </IonItem>
          }
        </IonList>
      </IonPopover>
    </div>
  );
};

export default SideBar;
