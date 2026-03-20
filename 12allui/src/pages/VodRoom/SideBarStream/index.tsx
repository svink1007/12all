import React, { FC, SVGProps, useState } from "react";
import "./styles.scss";
import {
    IonBadge,
    IonButton,
    IonButtons,
    IonIcon,
    isPlatform,
} from "@ionic/react";
import {
    chatbubblesOutline,
    cogOutline,
    filmOutline,
    informationCircleOutline,
    mailOutline,
    micOffOutline,
    micOutline,
    peopleOutline,
    radioButtonOn,
    scanOutline,
    searchOutline,
    settingsOutline,
    shareSocialOutline,
    star,
    stopCircle,
    stopCircleOutline,
    videocamOffOutline,
    videocamOutline,
} from "ionicons/icons";
import bets from "../../../images/icons/bets/bet.svg";
import UserMediaModal from "../../../components/UserMediaModal";
import {useDispatch, useSelector} from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import Invite from "../../../components/Invite";
import SelectCamera from "../../../components/SelectCamera";
import RoomChangeLayout from "../../../components/RoomChangeLayout";
import { VertoLayout } from "../../../verto/types";
import RoomChangeStream, { VodChangeStream } from "../../../components/RoomChangeStream";
import { SharedStream } from "../../../shared/types";
import ChangeRoomStatus from "../../../components/ChangeRoomStatus";
import { useTranslation } from "react-i18next";
import { LivingRoomMode } from "../../WatchParty/enums";
import setLivingRoom from "../../../redux/actions/livingRoomActions";
// import zoomRoomIcon from "../../../images/icons/zoomRoom.svg"

import VertoSession from "../../../verto/VertoSession";
import {setInfoToast} from "../../../redux/actions/toastActions";
import askReward from '../../../images/icons/ask-reward.svg';
import askRewardSelected from "../../../images/icons/ask-reward-selected.svg";
import RecordButton from "src/pages/WatchParty/components/RecordButton";
import {VodState} from "../../../redux/reducers/vodReducers";

type Props = {
    imHost: boolean | null;
    show: boolean;
    micMuted: boolean;
    camStopped: boolean;
    fullscreen: boolean;
    showChat: boolean;
    invitationUrl: string;
    isAdult: boolean;
    showStreamInfo: boolean;
    streamId?: number;
    isPrivate?: boolean;
    publicId?: string;
    onToggleMic: () => void;
    onToggleCam: (cam: string) => void;
    onFullscreen: () => void;
    onTheatreMode: () => void;
    onShowChat: (show: boolean) => void;
    onLayoutChange: (layout: VertoLayout) => void;
    onChangeStream: (vod: VodState) => void;
    onChangeRoomStatus: (value: boolean) => void;
    onShowStreamInfo: (value: boolean) => void;
    onShowParticipants: (value: boolean) => void;
    showParticipants?: boolean;
    theatreMode?: boolean;
    showBets?: boolean;
    onShowBets: (value: boolean) => void;
    recordedId: string | null;
    showGiveRewards?: boolean,
    onShowGiveRewards: (value: boolean) => void;
    currentLayout?: string  ,
    participantsCount: number
};

const SideBarStream: FC<Props> = ({
                                      imHost,
                                      show,
                                      micMuted,
                                      camStopped,
                                      fullscreen,
                                      showChat,
                                      invitationUrl,
                                      streamId,
                                      isPrivate,
                                      isAdult,
                                      showStreamInfo,
                                      publicId,
                                      onToggleMic,
                                      onToggleCam,
                                      onFullscreen,
                                      onTheatreMode,
                                      onShowChat,
                                      onLayoutChange,
                                      onChangeStream,
                                      onChangeRoomStatus,
                                      onShowStreamInfo,
                                      showParticipants,
                                      onShowParticipants,
                                      theatreMode,
                                      showBets,
                                      onShowBets,
                                      recordedId
                                  }: Props) => {
    const { t } = useTranslation();
    const { mic, cam } = useSelector(({ userMedia }: ReduxSelectors) => userMedia);
    const unreadMessages = useSelector(
        ({ unreadMessages }: ReduxSelectors) => unreadMessages
    );
    const { showDebugInfo , } = useSelector(
        ({ profile }: ReduxSelectors) => profile
    );
    const {
        vertoSession
    } = useSelector(({streamDebug}: ReduxSelectors) => streamDebug);
    const profile = useSelector(({ profile }: ReduxSelectors) => profile);
    

    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
    const [showSelectCameraModal, setShowSelectCameraModal] =
        useState<boolean>(false);

    const handleCameraToggle = () => {        
        if (cam === "none") {
            setShowSelectCameraModal(true);
        } else {
            onToggleCam(cam);
        }
    };

    const handleSelectCameraCancel = () => {
        setShowSelectCameraModal(false);
    };

    const handleSelectCameraOk = (camId: string) => {
        handleSelectCameraCancel();
        onToggleCam(camId);
    };

    

    return (        
        <div
            className={`stream-side-bar ${fullscreen ? "fullscreen" : ""}`}
            style={{ visibility: show ? "visible" : "hidden" }}
        >
            <IonButtons>
                {showDebugInfo && (
                    <IonButton
                        onClick={() => {
                            onShowStreamInfo(!showStreamInfo)
                            if(theatreMode) {
                                onShowChat(false)
                                onShowParticipants(false)
                            }
                        }}
                        title={t("roomSideBar.streamInfo")}
                    >
                        <IonIcon
                            slot="icon-only"
                            icon={informationCircleOutline}
                            color={showStreamInfo ? "success" : "dark"}
                        />
                    </IonButton>
                )}

                <IonButton
                    className="side-bar-settings"
                    title={"Star"}
                >
                    <IonIcon slot="icon-only" icon={askReward} color={"dark"} />
                </IonButton>

                {/*<IonButton*/}
                {/*    className="side-bar-settings !w-[48px] !h-[48px]"*/}
                {/*    title={"Star"}*/}
                {/*    style={{ borderRadius: "50%" }}*/}
                {/*    // onClick={() => setShowSettingsModal(true)}*/}
                {/*>*/}
                {/*    <svg*/}
                {/*        width="24"*/}
                {/*        style={{ borderRadius: "50%" }}*/}
                {/*        height="24"*/}
                {/*        viewBox="0 0 100 100"*/}
                {/*        fill="none"*/}
                {/*        xmlns="http://www.w3.org/2000/svg"*/}
                {/*    >*/}
                {/*        <path*/}
                {/*            d="M50 0L61.2257 34.5491H97.5528L68.1636 55.9017L79.3893 90.4509L50 69.0983L20.6107 90.4509L31.8364 55.9017L2.44717 34.5491H38.7743L50 0Z"*/}
                {/*            fill="white"*/}
                {/*        />*/}
                {/*        <path d="M66 52L42 38.1436V65.8564L66 52Z" fill="black" />*/}
                {/*    </svg>*/}
                {/*</IonButton>*/}

                <div className={"flex gap-x-2 flex-row"}>
                    <RecordButton 
                        classname={'side-bar-settings'} 
                        recordedId={recordedId}
                    />
                </div>

                <IonButton
                    className="side-bar-settings"
                    title={t("roomSideBar.settings")}
                    onClick={() => setShowSettingsModal(true)}
                >
                    <IonIcon
                        slot="icon-only"
                        icon={settingsOutline}
                        color={showSettingsModal ? "success" : "dark"}
                    />
                </IonButton>
                <IonButton
                    className="invite-button !w-[48px] !h-[48px]"
                    title={t("roomSideBar.share")}
                    onClick={() => setShowInviteModal(true)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.40991 22C3.40991 18.13 7.25991 15 11.9999 15C12.9599 15 13.8899 15.13 14.7599 15.37" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 18C22 18.32 21.96 18.63 21.88 18.93C21.79 19.33 21.63 19.72 21.42 20.06C20.73 21.22 19.46 22 18 22C16.97 22 16.04 21.61 15.34 20.97C15.04 20.71 14.78 20.4 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.92 14.43 15.93 15.13 15.21C15.86 14.46 16.88 14 18 14C19.18 14 20.25 14.51 20.97 15.33C21.61 16.04 22 16.98 22 18Z" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.49 17.98H16.51" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 16.52V19.51" stroke={showInviteModal ? "green" : "white"} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </IonButton>
                {imHost && (
                    <>
                        {!isAdult && (
                            <ChangeRoomStatus
                                isPrivateInitial={isPrivate || false}
                                onChangeRoomStatus={onChangeRoomStatus}
                            />
                        )}
                        <VodChangeStream vodID={streamId} onChangeVod={onChangeStream}/>
                        <RoomChangeLayout onLayoutChange={onLayoutChange} />
                    </>
                )}
                <IonButton
                    className="chat-button"
                    title={t("roomSideBar.chat")}
                    onClick={() => {
                        onShowChat(!showChat)
                        if(theatreMode) {
                            onShowParticipants(false)
                            onShowStreamInfo(false)
                        }
                    }}
                >
                    <IonIcon
                        slot="icon-only"
                        icon={chatbubblesOutline}
                        color={showChat ? "success" : "dark"}
                    />
                    <IonBadge
                        color="primary"
                        className={!showChat ? "show-delay" : ""}
                        hidden={showChat || unreadMessages.accumulator === 0}
                    >
                        {unreadMessages.accumulator}
                    </IonBadge>
                </IonButton>
                <IonButton onClick={handleCameraToggle} title={t("roomSideBar.cam")}>
                    <IonIcon
                        slot="icon-only"
                        icon={camStopped ? videocamOffOutline : videocamOutline}
                        color={camStopped ? "dark" : "success"}
                    />
                </IonButton>
                <IonButton onClick={() => onToggleMic()} title={t("roomSideBar.mic")}>
                    <IonIcon
                        slot="icon-only"
                        icon={micMuted ? micOffOutline : micOutline}
                        color={micMuted ? "dark" : "success"}
                    />
                </IonButton>

                {
                    // (livingRoom.isHost || isCoHost) &&
                    <>
                        {/*<ChangeRoomStatus*/}
                        {/*    isPrivateInitial={livingRoom.mode === LivingRoomMode.Private}*/}
                        {/*    onChangeRoomStatus={(value) => dispatch(setLivingRoom({mode: value ? LivingRoomMode.Private : LivingRoomMode.Public}))}*/}
                        {/*/>*/}
                        {/*{*/}
                        {/*    !isPlatform('ios') &&*/}
                        {/*    <IonButton*/}
                        {/*        onClick={handleShowMediaPopover}*/}
                        {/*        title={t('roomSideBar.media')}*/}
                        {/*    >*/}
                        {/*        <IonIcon slot="icon-only" icon={filmOutline} color={openMediaPopover ? 'success' : 'dark'}/>*/}
                        {/*    </IonButton>*/}
                        {/*}*/}

                        {/*<RoomChangeLayout onLayoutChange={onLayoutChange}/>*/}

                        <IonButton
                            onClick={() => {
                                onShowParticipants(!showParticipants)
                                if(theatreMode) {
                                    onShowChat(false)
                                    onShowStreamInfo(false)
                                }
                            }}
                            title={t("roomSideBar.participants")}
                        >
                            <IonIcon
                                slot="icon-only"
                                icon={peopleOutline}
                                color={showParticipants ? 'success' : 'dark'}
                            />
                        </IonButton>
                    </>
                }

                

                { profile != undefined && profile.id != undefined && profile.id !== 0 && 
                    <IonButton
                        onClick={() => {
                            onShowBets(!showBets)
                            if(theatreMode) {
                                onShowChat(false)
                                onShowStreamInfo(false)
                            }
                        }}
                        title={t("roomSideBar.bets")}
                    >
                        <IonIcon
                            slot="icon-only"
                            icon={ bets }
                            color={showBets ? 'success' : 'dark'}
                        />
                    </IonButton>   
                }             
                <IonButton
                    className="fullscreen-button"
                    title={t("roomSideBar.fullscreen")}
                    onClick={() => onFullscreen()}
                >
                    <IonIcon
                        slot="icon-only"
                        icon={scanOutline}
                        color={fullscreen ? "success" : "dark"}
                    />
                </IonButton>
            </IonButtons>

            <UserMediaModal show={showSettingsModal} setShow={setShowSettingsModal} />

            <Invite
                roomPublicId={publicId}
                showPushInvite={(imHost && !isPrivate) || false}
                show={showInviteModal}
                url={invitationUrl}
                onClose={() => setShowInviteModal(false)}
            />

            <SelectCamera
                show={showSelectCameraModal}
                onOk={handleSelectCameraOk}
                onCancel={handleSelectCameraCancel}
            />
        </div>
    );
};

export default SideBarStream;
