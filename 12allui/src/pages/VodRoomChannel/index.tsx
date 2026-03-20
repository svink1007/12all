import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import '../VodRoomX/styles.scss';
import {RouteComponentProps, useLocation, useParams} from 'react-router';
import Layout from '../../components/Layout';
import {HTMLVideoStreamElement, WebRTCUserMedia} from '../VodRoomX/types';
import {ShareStreamOption} from '../VodRoomX/enums';
import VertoSession from '../../verto/VertoSession';
import videojs, {VideoJsPlayer} from 'video.js';
import 'video.js/dist/video-js.css';
import {
    generateWatchPartyInvitationUrl,
    INIT_GAIN_VOL,
    INIT_VOL,
    IS_IN_FULLSCREEN,
    WP_CAM,
    WP_MIC
} from '../../shared/constants';
import Participants from '../VodRoomX/Participants';
import Chat from '../../components/Chat';
import SideBar from '../VodRoomX/SideBar';
import {Participant} from '../../verto/models';
import {LivingRoomState, ReduxSelectors} from '../../redux/shared/types';
import useBeforeUnload from '../VodRoomX/useBeforeUnload';
import getCamParams from '../../shared/methods/getCamParams';
import getMicParams from '../../shared/methods/getMicParams';
import WatchPartySession, {MEDIA_VIDEO_ID} from './WatchPartySession';
import BetsBar from '../VodRoomX/components/bets/BetsBar';
import FullscreenListeners from '../VodRoomX/FullscreenListeners';
import {FsRoomResolutionService, UpdateMetadata, VlrService} from '../../services';
import AdSenseCard from '../../components/AdSense/AdSenseCard';
import {AdSenseFormat, AdSenseSlot} from '../../components/AdSense';
import getDisplayMedia from '../../shared/methods/getDisplayMedia';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {setInRoom} from '../../redux/actions/inRoomActions';
import setLivingRoom from '../../redux/actions/livingRoomActions';
import NoVideoCanvas from '../../components/NoVideoCanvas';
import useNetworkUpSpeed from '../../hooks/useNetworkUpSpeed';
import useApplyVideoTrackConstrains from '../../hooks/useApplyVideoTrackConstrains';
import StreamDebugInfo from '../../components/StreamDebugInfo';

import {
    resetStreamDebugValues,
    setStreamDebug,
    setStreamDebugReplaceSentStream,
    setStreamDebugSentStream,
    setStreamDebugVideoElement
} from '../../redux/actions/streamDebugActions';
import {IonAlert, useIonViewWillEnter} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {MapPublicId, RoomLayout, SharedStream, SharedVodVlrs, Vlr, vod} from '../../shared/types';
import {motion} from "framer-motion";
import TopBarStream from '../VodRoomX/TopBarStream';
import GiveStarModal from '../VodRoomX/components/GiveStarModal';
import {VertoLayout} from 'src/verto/types';
import {getRecordingId} from 'src/shared/helpers';
import {addRecordedVod} from 'src/redux/actions/vodActions';
import {setupVerto} from "../../redux/actions/vertoActions";
import initVoDChannel from "./initVodChannel";
import startStreamVlr from "../VodRoomX/startStreamVlr";
import {placeholderImage} from "../../components/VodItems";
import {patchSelectedVlrTemplate} from "../../redux/actions/vlrTemplateActions";
import {LivingRoomMode} from "../WatchParty/enums";
import appStorage from "../../shared/appStorage";
import setUserMedia from "../../redux/actions/userMediaActions";
import {Routes} from "../../shared/routes";
import {MapVlrResponse} from "../WatchParty/Join/JoinHome";
import {Pause, Play, Repeat, Repeat1, SquareIcon, StepBack, StepForward, Volume2, VolumeX} from "lucide-react";
import { parse } from 'path';
import { set } from 'react-hook-form';

export type StreamVlr = {
    moderator: {
        username: string;
        password: string;
    };
    updateMetadata: boolean;
    roomId: string;
    publicId: string;
    fsUrl: string;
    vlrId: number;
    upSpeedUrl: string | null;
    hostName?: string;
    isMyRoom?: boolean;
};

const WP_JOIN = "wpJoin";

type JoinLivingRoomParams = {
    mapPublicIdData: MapPublicId;
    nickname: string;
    mic: string;
    cam: string;
};

export const prepareJoinLivingRoomData = ({
                                              mapPublicIdData,
                                              nickname,
                                              mic,
                                              cam,
                                          }: JoinLivingRoomParams): Partial<LivingRoomState> => {
    const { fsUrl, myRoom, vlr } = mapPublicIdData;
    const isMyRoom = !!myRoom;
    return {
        nickname,
        publicRoomId: vlr.public_id,
        mic,
        cam,
        fsUrl,
        roomId: vlr.room_id,
        channel: {
            logo: vlr?.channel?.logo || null,
        },
        share: ShareStreamOption.Camera,
        joinCamMic: true,
        myStream: null,
        streamName: null,
        files: null,
        singleConnection: false,
        vlrId: vlr.id,
        upSpeedUrl: vlr.up_speed_url,
        joinedFromJoinScreen: true,
        isHost: isMyRoom,
        joinRoomWithCoHost: isMyRoom,
        moderatorUsername: myRoom?.moderatorUsername,
        moderatorPassword: myRoom?.moderatorPassword,
        roomLayout: vlr.room_layout || null,
    };
};

const VodRoomChannel: FC<RouteComponentProps> = ({history}: RouteComponentProps) => {
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const livingRoom = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

     const { vodId, channelId} = useParams<{
      vodId?: string ;
      channelId?: string;
    }>();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roomId = queryParams.get('roomId') ?? undefined;


    const [refreshKey, setRefreshKey] = useState(0);
    const sharedStreamData = useRef<SharedVodVlrs>();
    const streamVlr = useRef<StreamVlr | null>(null);
    const profile = useSelector(({profile}: ReduxSelectors) => profile);
    const [vlrs, setVlrs] = useState<Vlr[]>([]);
    const [imHost, setImHost] = useState<boolean | null>(null);
    const userMedia = useSelector(({userMedia}: ReduxSelectors) => userMedia);
    const inRoom = useSelector(({inRoom}: ReduxSelectors) => inRoom);
    const pageRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoStreamElement>();
    const audioRef = useRef<HTMLAudioElement>(null);
    const userMediaRef = useRef<MediaStream>();
    const screenShareRef = useRef<MediaStream | null>(null);
    const vertoSessionRef = useRef<VertoSession | null>(null);
    const noVideoTrackRef = useRef<MediaStreamTrack>();
    const participantsRef = useRef<Participant[]>([]);
    const sharedRef = useRef<{ oldValue: ShareStreamOption | null, newValue: ShareStreamOption | null }>({
        oldValue: null,
        newValue: null
    });
    const shareRef = useRef<ShareStreamOption | null>(ShareStreamOption.VoD);
    const mediaRecorderRef = useRef<MediaRecorder>();
    const micMutedRef = useRef<boolean>(true);

    const [recordedId, setRecordedId] = useState<string | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [roomHost, setRoomHost] = useState<Participant>();
    const [participantTalks, setParticipantTalks] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [showProgressLeave, setShowProgressLeave] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [showParticipants, setShowParticipants] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [captureStream, setCaptureStream] = useState<MediaStream | null>(null);
    const [micMuted, setMicMuted] = useState<boolean>(true);
    const [camStopped, setCamStopped] = useState<boolean>(true);
    const [gainNode, setGainNode] = useState<GainNode>();
    const [showDebugStream, setShowDebugStream] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showChangeStream, setShowChangeStream] = useState<boolean>(false);
    const [showChangeFile, setShowChangeFile] = useState<boolean>(false);
    const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [isExitAlert, setIsExitAlert] = useState<boolean>(false)
    const [isSecondaryRecalled, setIsSecondaryRecalled] = useState<boolean>(false)
    const [showBets, setShowBets] = useState<boolean>(false);
    const [showGiveRewards, setShowGiveRewards] = useState<boolean>(false);
    const [currentLayout, setCurrentLayout] = useState<string>(VertoLayout.VideoLeftLarge);
    const [vodChannel,setVodChannel]=useState<vod[]>([]);
    const [currentVod, setCurrentVod] = useState<number | null>(null);
      const [isVertoSessionReady, setIsVertoSessionReady] = useState<boolean>(false);
    const handleNoVideoTrack = useCallback((track: MediaStreamTrack) => {
        noVideoTrackRef.current = track;
    }, []);

    let emptyAudioMediaStream: any = null;

    const template = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);

    const startNewRoom = useCallback(() => {
        startStreamVlr({
            sharedStreamData,
            streamVlr,
            setImHost,
            onReady: () => {
                startVodRoomChannel().catch(console.error);
            }
        });
    }, []);

    const joining = useRef<boolean>(false);

    const joinRoom = useCallback((vlr: Vlr) => {

        const data = appStorage.getObject(WP_JOIN);
        const user = nickname || data?.username || "";

        streamVlr.current = {
            roomId: vlr.room_id,
            publicId: vlr.public_id,
            fsUrl: vlr.fs_url || "",
            updateMetadata: false,
            moderator: {
                username: "",
                password: "",
            },
            vlrId: vlr.id,
            upSpeedUrl: vlr.up_speed_url,
            hostName: vlr.host_name,
            isMyRoom: vlr.is_my_room || false,
        };

        setProgress(0.2);
        setImHost(false);

        if (joining.current) {
            return;
        }

        joining.current = true;

        if(roomId){

            VlrService.mapVlrPublicId(roomId)
                .then(({ data }) => {

                    joining.current = false;
                    const { channelIsActive, status, vlr } = data;
                    let errorMessage = "";

                    switch (status) {
                        case MapVlrResponse.Ok:
                            if (channelIsActive) {
                                appStorage.setObject(WP_JOIN, { username: user, room: roomId });
                                const dispatchData = prepareJoinLivingRoomData({
                                    mapPublicIdData: data,
                                    mic,
                                    cam,
                                    nickname: user,
                                });
                                dispatch(setLivingRoom(dispatchData));
                                return;
                            }
                            dispatch(setInfoToast("notifications.roomNotActive"));
                            break;
                        case MapVlrResponse.RoomNotFound:
                            errorMessage = "notifications.noRoom";
                            break;
                        default:
                            errorMessage = "notifications.roomError";
                            break;
                    }
                    errorMessage && dispatch(setErrorToast(errorMessage));
                })
                .catch((err) => {
                    joining.current = false;
                    const message = VlrService.handleMapIdError(err);
                    dispatch(setErrorToast(message));
                });
        }

    }, []);

    useEffect(() => {
        dispatch(setLivingRoom({
            isHost: !!imHost
        }))
    }, [imHost]);

   
    useIonViewWillEnter(() => {
        setRefreshKey(prev => prev + 1);
    });

    useEffect(() => {
      setLoading(true);
        initVoDChannel({
            vodId,
            channelId,
            setVodChannel,
            setCurrentVod,
            roomId,
            jwt: profile.jwt,
            setVlrs,
            sharedStreamData,
            onStartNewRoom: startNewRoom,
            onJoinRoom: joinRoom,
        });
        setLoading(false);

    }, [refreshKey]);


    const vodRefValue = useRef<SharedVodVlrs | null>(null);

    useEffect(() => {
        try {

            if (
                sharedStreamData.current && vodRefValue.current !== sharedStreamData.current
            ) {
                
                vodRefValue.current = sharedStreamData.current;
                if (
                    vertoSessionRef.current
                ) {


                    vertoSessionRef.current?.sendDebugAction(
                        "a_play_stop",
                        ``,
                        "conf-control"
                    );

                    vertoSessionRef.current?.sendDebugAction(
                        "vid-layout",
                        "1up_top_left+9_orig",
                        "conf-control"
                    );

                    const vodName = getVodName(sharedStreamData.current?.url ?? "");

                    vertoSessionRef.current?.sendDebugAction(
                        "vod_play",
                        `${vodName}`,
                        "conf-control"
                    );
                }
            }else{
              console.log("No changes detected in VOD reference");
            }
        } catch (e) {
            console.error("Error in VOD effect:", e);
        }
    }, [vodId,channelId]);

    const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);
    const {cam, mic} = useSelector(({userMedia}: ReduxSelectors) => userMedia);
    const media = useSelector(({userMedia}: ReduxSelectors) => userMedia);
    const {
        useMedia,
        roomResolution,
    } = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);

    type RedirectToLivingRoom = {
        share?: ShareStreamOption | null;
        isOnlyMicCam?: boolean;
        publicId?: string;
        roomId?: string;
        joinRoomWithCoHost?: boolean;
        vlrId?: number;
        roomLayout?: RoomLayout;
    };
    const freeVlrRef = useRef<{ room_id: string, public_id: string, room_layout?: RoomLayout }>();

    const templateRef = useRef(template);
    templateRef.current = template;

    const mediaRef = useRef(media);
    mediaRef.current = media;

    const startVodRef = useRef<boolean>(false);

    const startVodRoomChannel = useCallback(async (params?: RedirectToLivingRoom) => {

        const currentStream = streamVlr.current;
        const currentStreamData = sharedStreamData.current;
        if (!currentStream || !currentStreamData) return;

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(() => {
                VlrService.checkIfVlrIsFree(streamVlr.current!.roomId).then(({data: {status}}) => {

                    const {
                        share,
                        useMedia,
                        logoUrl,
                        channelName,
                        genre,
                        description,
                        language,
                        mode,
                        room
                    } = templateRef.current ?? {};
                    const {cam: activeCam, mic: activeMic} = mediaRef.current ?? {};

                    if (status === 'free') {
                        params = {
                            share: share,
                            isOnlyMicCam: useMedia,
                            publicId: room.publicId,
                            roomId: room.roomId,
                            joinRoomWithCoHost: false,
                            vlrId: room.id,
                            ...params
                        };

                        const data: UpdateMetadata = {
                            channelLogo: logoUrl,
                            channelName,
                            roomId: params.publicId!,
                            channelGenre: genre,
                            channelDescription: description,
                            channelLanguage: language,
                            isPrivate: mode === 'private',
                            streamCamera: false,
                            vodId: currentStreamData.id,
                            streamUrl: currentStreamData.url,
                            isVlr: true,
                            isHost: true,
                            userId: profile.id
                        };

                        VlrService.updateMetadata(data).catch((error) => console.error(error));

                        const livingRoomData: Partial<LivingRoomState> = {
                            share: params.share,
                            myStream: null,
                            files: null,
                            vod: currentStreamData,
                            joinCamMic: params.isOnlyMicCam,
                            cam: activeCam,
                            mic: activeMic,
                            channel: {
                                logo: data.channelLogo,
                                name: channelName
                            },
                            streamName: currentStreamData.title,
                            epgId: null,
                            isHost: true,
                            singleConnection: !params.isOnlyMicCam,
                            roomId: params.roomId,
                            publicRoomId: params.publicId,
                            joinRoomWithCoHost: params.joinRoomWithCoHost,
                            roomResolution: 1080,
                            vlrId: params.vlrId,
                            mode,
                            joinedFromJoinScreen: false,
                            roomLayout: params.roomLayout
                        };

                        dispatch(setLivingRoom(livingRoomData));
                        startVodRef.current = true;
                    } else {
                        freeVlrRef.current = status;
                    }
                });
            })
            .catch(() => {
                // Optional: handle media access errors here
            });

    }, [sharedStreamData, streamVlr, template, useMedia, dispatch, cam, mic, history, roomResolution, profile.id]);

    useEffect(() => {
        const selectedMic = appStorage.getItem(WP_MIC);
        const selectedCam = appStorage.getItem(WP_CAM);

        const mic = selectedMic || 'any';
        const cam = selectedCam || 'none';

        dispatch(setUserMedia({mic, cam}));
    }, [dispatch]);

    useEffect(() => {
        if(sharedStreamData.current && streamVlr.current) {

            dispatch(
                setLivingRoom({
                    roomId: streamVlr.current.roomId,
                    channel: {
                        logo: placeholderImage,
                        name: sharedStreamData.current.title
                    },
                    streamName: sharedStreamData.current.title,
                    vod: sharedStreamData.current,
                    publicRoomId: streamVlr.current.publicId,
                    moderatorUsername: streamVlr.current.moderator.username,
                    moderatorPassword: streamVlr.current.moderator.password,
                    fsUrl: streamVlr.current.fsUrl,
                    upSpeedUrl: streamVlr.current.upSpeedUrl,
                    nickname,
                    vlrId: streamVlr.current.vlrId,
                    share: ShareStreamOption.VoD
                })
            )

            dispatch(
                patchSelectedVlrTemplate({
                    channelName: sharedStreamData.current.title,
                    share: ShareStreamOption.VoD,
                    genre: sharedStreamData.current.genre,
                    description: sharedStreamData.current.description,
                    language: sharedStreamData.current.language,
                    logoUrl: sharedStreamData.current.logo,
                    mode: sharedStreamData.current.isPrivate ? LivingRoomMode.Private : LivingRoomMode.Public,
                    streamId: sharedStreamData.current.id,
                    streamUrl: sharedStreamData.current.url,
                    useMedia: true,
                    room: {
                        id: streamVlr.current.vlrId,
                        roomId: streamVlr.current.roomId,
                        publicId: streamVlr.current.publicId
                    }
                })
            );
        }
    }, [sharedStreamData.current, streamVlr.current]);

    useEffect(() => {
        if(streamVlr.current){
            dispatch(
                setLivingRoom({
                    invitationUrl: generateWatchPartyInvitationUrl(streamVlr.current.publicId),
                })
            );
        }
    }, [streamVlr.current]);

    const getEmptyAudioStream = () => {
      if (emptyAudioMediaStream) {
          return emptyAudioMediaStream;
      }

      // Create a silent oscillator as the audio source
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 0; // Silence by setting frequency to 0
      oscillator.connect(destination);
      oscillator.start();

      emptyAudioMediaStream = destination.stream;
      emptyAudioMediaStream.getAudioTracks()[0].enabled = true; // Ensure it's silent

      return emptyAudioMediaStream;
    }

    const streamWidth = useNetworkUpSpeed(
      (livingRoom.share === ShareStreamOption.VoD) && inRoom.sharingInProgress, livingRoom.upSpeedUrl
    );
    useApplyVideoTrackConstrains(streamWidth, videoTrack);

    const captureMediaStream = useCallback(async () => {
        const videoEl = videoRef.current;
        if (!videoEl) {
            throw new Error('Cannot get media ref');
        }

        let capStream: MediaStream;
        if (videoEl.mozCaptureStream) {
            capStream = videoEl.mozCaptureStream();
            if (audioRef.current) {
                audioRef.current.srcObject = capStream;
            }
        } else if (videoEl.captureStream) {
            capStream = videoEl.captureStream();
        } else {
            throw new Error('Capture stream is not supported');
        }

        setVideoTrack(null);
        if (capStream.getVideoTracks().length > 0) {
            setVideoTrack(capStream.getVideoTracks()[0]);
        } else if (noVideoTrackRef.current) {
            capStream = new MediaStream([
                capStream.getAudioTracks()[0],
                noVideoTrackRef.current
            ]);
        }

        setCaptureStream(capStream);

        dispatch(setStreamDebugSentStream(capStream));
        return capStream;
    }, [dispatch]);

    const mergeAudioStreams = useCallback(
        (userStream: MediaStream, sharedStream: any, shareScreen: boolean = false) => {

            const audioContext = new AudioContext();
            // Create with shared stream
            const capturedAudioSource = audioContext.createMediaStreamSource(
                sharedStream
            );
            const audioDestination = audioContext.createMediaStreamDestination();

            // Add user microphone
            const userAudioSource = audioContext.createMediaStreamSource(userStream);
            userAudioSource.connect(audioDestination);

            if (sharedStream) {
                if (shareScreen) {
                    capturedAudioSource.connect(audioDestination);
                } else {
                    // Increase volume of shared stream
                    const gainNode = audioContext.createGain();
                    setGainNode(gainNode);
                    capturedAudioSource.connect(gainNode);
                    gainNode.connect(audioDestination);
                    gainNode.gain.value = INIT_VOL;
                }
            }

            return {primaryStream: getEmptyAudioStream(), secondaryStream: audioDestination.stream};

        }, []);

    const makeSecondaryCall = useCallback((stream: MediaStream, myName: string, sharing: string) => {
        const getOutgoingBW = (sharing: string) => {
            switch (sharing) {
                case "stream_share":
                    return 1300;
                case "screen_share":
                    return 1200;
                default:
                    return 1300;
            }
        }
        vertoSessionRef.current?.initSecondaryCall({
            stream,
            channelName: `${myName} sharing`,
            receiveStream: true,
            incomingBandwidth: 1500,
            outgoingBandwidth: getOutgoingBW(sharing),
            destinationNumber: `${livingRoom.roomId}_stream_720`,
            connectionType: `merge_watch_stream_channel`,
        });
        if (userMediaRef.current) {
            userMediaRef.current.getAudioTracks()[0].enabled = false;
        }
    }, [livingRoom])

   

    useEffect(() => {
        if (livingRoom.share === ShareStreamOption.VoD) {
            setParticipantTalks(!micMuted || !!participants.find(p => !p.audio.muted && !p.isHostSharedVideo));
        }
    }, [micMuted, participants, livingRoom.share]);

    useEffect(() => {
        dispatch(resetStreamDebugValues());

        dispatch(setInRoom({
            isCoHost: false,
            loadingStream: false,
            sharingInProgress: shareRef.current !== ShareStreamOption.Camera
        }));

        document.onfullscreenchange = () => {
            setIsFullscreen(IS_IN_FULLSCREEN());
        };

        return () => {
            userMediaRef.current?.getTracks().forEach(t => t.stop());
            screenShareRef.current?.getTracks().forEach(t => t.stop());
            if (IS_IN_FULLSCREEN()) {
                document.exitFullscreen().then();
            }
            vertoSessionRef.current?.hangup();
            vertoSessionRef.current?.cleanupWebRTC();
        };
    }, [dispatch, livingRoom.publicRoomId]);

    useEffect(() => {
        micMutedRef.current = micMuted;
    }, [micMuted]);

    useBeforeUnload(useCallback(() => {
        vertoSessionRef.current?.hangup();
        vertoSessionRef.current?.cleanupWebRTC();
    }, []));

    const handleUserMediaChange = ({cam, mic}: WebRTCUserMedia) => {
        const audio = getMicParams(mic);
        const video = getCamParams(cam);

        navigator.mediaDevices
            .getUserMedia({audio, video})
            .then((userStream: MediaStream) => {
                if (!vertoSessionRef.current) {
                    throw new Error('No session');
                }

                const sharedStream = captureStream || screenShareRef.current;


                if (!livingRoom.singleConnection && sharedStream) {
                    const mergedAudioStream: any = mergeAudioStreams(userStream, sharedStream, !!screenShareRef.current);

                    userStream.getAudioTracks()[0].enabled = userMediaRef.current?.getAudioTracks()[0].enabled || false;

                    let video: MediaStreamTrack | null = null;
                    if (userStream.getVideoTracks().length) {
                        video = userStream.getVideoTracks()[0];
                    } else if (noVideoTrackRef.current) {
                        video = noVideoTrackRef.current;
                    }

                    const audio = mergedAudioStream.secondaryStream.getAudioTracks()[0];
                    video && vertoSessionRef.current?.replacePrimaryVideoSecondaryAudioTrack(audio, video);
                } else {
                    if (userStream.getVideoTracks().length) {
                        vertoSessionRef.current.replacePrimaryTracks(userStream);
                    } else if (noVideoTrackRef.current) {
                        const audio = userStream.getAudioTracks()[0];
                        const video = noVideoTrackRef.current;
                        vertoSessionRef.current.replacePrimaryTracks(new MediaStream([audio, video]));
                    }
                }

                userMediaRef.current?.getTracks().forEach(t => t.stop());
                userMediaRef.current = userStream;
            })
            .catch((err) => console.error(err));
    };

    const handleParticipantsChange = useCallback((participants: Participant[]) => {
        participantsRef.current = participants;
        const host = participantsRef.current.filter(participant => participant.isHost)[0];
        setRoomHost(host)
        setParticipants([...participants]);
    }, []);

    const stopScreenShareTracks = () => {
        if (screenShareRef.current) {
            screenShareRef.current.getTracks().forEach(track => track.stop());
            screenShareRef.current = null;
        }

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };

    const disconnectSecondaryCall = useCallback(() => {
        const changeHost = (me: Participant) => {
            VlrService.changeHost({participantId: me.participantId, roomId: livingRoom.roomId}).then();
            vertoSessionRef.current?.giveParticipantFloor(me.participantId);
        };

        const host = participantsRef.current.find(p => p.isHost);
        if (host) {
            changeHost(host);
        } else {
            const coHost = participantsRef.current.find(p => p.isCoHost);
            coHost && changeHost(coHost);
        }

        if (userMediaRef.current) {
            vertoSessionRef.current?.replaceSecondaryTracks(new MediaStream(userMediaRef.current.getAudioTracks()));
        }

        dispatch(setInRoom({sharingInProgress: false}));
        dispatch(setLivingRoom({share: ShareStreamOption.VoD}));
        dispatch(setStreamDebug({sentStream: userMediaRef.current || null, videoElement: null}));
    }, [livingRoom.roomId, dispatch]);

    const handleStopStream = () => {
        disconnectSecondaryCall();
        resetStream();
    };

    const handleStopScreenShare = useCallback(() => {
        if (livingRoom.singleConnection) {
            vertoSessionRef.current?.hangup();
            vertoSessionRef.current?.cleanupWebRTC();
        } else {
            disconnectSecondaryCall();
        }

        stopScreenShareTracks();
    }, [livingRoom.singleConnection, disconnectSecondaryCall]);

    const resetStream = useCallback(() => {
        videojs.getPlayer(MEDIA_VIDEO_ID) && videojs(MEDIA_VIDEO_ID).dispose();
        setCaptureStream(null);
        dispatch(setLivingRoom({myStream: null, files: null, streamName: null}));
    }, [dispatch]);

    const handleStopSharing = useCallback(() => {
        disconnectSecondaryCall();
        stopScreenShareTracks();
        resetStream();
    }, [disconnectSecondaryCall, resetStream]);

    const handleStreamRefChange = useCallback((stream: MediaStream) => {
        screenShareRef.current?.getTracks().forEach(track => track.stop());
        screenShareRef.current = stream;
        screenShareRef.current.getVideoTracks()[0].onended = () => handleStopScreenShare;
        dispatch(setStreamDebug({sentStream: stream, videoElement: null}));
    }, [handleStopScreenShare, dispatch]);

    const handleOnUserStream = useCallback((userStream: MediaStream) => {
        userMediaRef.current = userStream;
    }, []);

    const handleToggleCam = async () => {
        setCamStopped(prevState => !prevState);
        userMediaRef.current?.getVideoTracks().forEach((track: MediaStreamTrack | CanvasCaptureMediaStreamTrack) => {
            if (!('canvas' in track)) {
                track.stop();
            }
        });
        const changeUserMedia = (videoTrack: MediaStreamTrack) => {
            const mediaStream = new MediaStream([videoTrack]);
            if (userMediaRef.current?.getTracks().length) {
                userMediaRef.current = new MediaStream([userMediaRef.current?.getAudioTracks()[0], videoTrack]);
            } else {
                userMediaRef.current = mediaStream;
            }
            livingRoom.share === ShareStreamOption.Camera && dispatch(setStreamDebugReplaceSentStream(mediaStream));
            vertoSessionRef.current?.replacePrimaryTracks(mediaStream);
        };

        if (camStopped) {
            try {
                const video = getCamParams(userMedia.cam, true);
                const stream = await navigator.mediaDevices.getUserMedia({audio: false, video});
                changeUserMedia(stream.getVideoTracks()[0]);
            } catch (e) {
                dispatch(setErrorToast('livingRoom.camError'));
                console.error(e);
                return;
            }
        } else if (noVideoTrackRef.current) {
            changeUserMedia(noVideoTrackRef.current);
        }

        vertoSessionRef.current?.togglePrimaryCam();
    };

    const handleToggleMic = () => {
        setMicMuted(prevState => !prevState);
        vertoSessionRef.current?.togglePrimaryMic();
        vertoSessionRef.current?.sendDebugAction("a_play_volume", "-100", "conf-control");
    };

    const handleFullscreenChange = (value: boolean) => {
        if (value) {
            pageRef.current?.requestFullscreen().then();
        } else {
            document.exitFullscreen().then();
        }
    };

    const giveSharingFloor = () => {
        const sharing = participantsRef.current.find(p => p.me && p.isHostSharedVideo && !p.video.floor);
        sharing && vertoSessionRef.current?.giveParticipantFloor(sharing.participantId);
        vertoSessionRef.current?.sendMessage.stopAllMediaShare();
    };

    const handleScreenShare = async () => {
        const displayMediaStream = await getDisplayMedia();
        handleStreamRefChange(displayMediaStream);
        let mergedMediaStream: any = null;

        debugger;
        if (livingRoom.joinCamMic && userMediaRef.current) {
            const mergedStreams = mergeAudioStreams(userMediaRef.current, displayMediaStream, true);
            mergedMediaStream = new MediaStream([
                mergedStreams.secondaryStream.getAudioTracks()[0],
                displayMediaStream.getVideoTracks()[0]
            ]);
        }

        const me = participants.find(p => p.me);
        if (me && !vertoSessionRef.current?.hasSecondaryCall() && mergedMediaStream) {
            makeSecondaryCall(mergedMediaStream, me.participantName, "screen_share");
            // @@@ Should replace primary
        } else {
            debugger;
            if (vertoSessionRef.current?.secondaryVertoCall) {
                const secondaryVertoCall = vertoSessionRef.current.secondaryVertoCall
                secondaryVertoCall.dialogParams.outgoingBandwidth = 1200
                // @@@ Does this works ?
                secondaryVertoCall.rtc.options.receiveStream = false
            }

            vertoSessionRef.current?.replaceTracks(mergedMediaStream || displayMediaStream);
            giveSharingFloor();
        }

        me && vertoSessionRef.current?.sendMessage.stopMediaShare(me.callId);
        dispatch(setLivingRoom({share: ShareStreamOption.Screen}));
        dispatch(setInRoom({sharingInProgress: true}));
    };

    const handleShareMyCamera = () => {
        handleUserMediaChange(userMedia);
    };

    const handleVertoSessionChange = useCallback((vertoSession: VertoSession) => {
        vertoSession.notification.onSecondaryCallRemoteStream.subscribe(() => {
            if (userMediaRef.current) {
                userMediaRef.current.getAudioTracks()[0].enabled = !micMutedRef.current;
            }
        });

        vertoSession.notification.onReplaceTracksDone.subscribe(() => {
            if (sharedRef.current.oldValue === sharedRef.current.newValue) {
                return;
            }

            sharedRef.current.oldValue = sharedRef.current.newValue;

            const stopUserTracks = () => {
                livingRoom.singleConnection && userMediaRef.current?.getTracks().forEach(t => t.stop());
            };

            // Cleanup tracks and screen share regardless of the new value
            stopUserTracks();
            stopScreenShareTracks();
        });
        vertoSession.notification.onWebSocketMessage.subscribe((vertoEvent) => {
            const result = getRecordingId(vertoEvent)
            if (result !== null && recordedId === null) {
                setRecordedId(result.recordingId);
            }
        })
        vertoSession.notification.onStopAllMediaShare.subscribe(() => {
            disconnectSecondaryCall();
            stopScreenShareTracks();
            resetStream();
        });
        vertoSessionRef.current = vertoSession;

        if (vertoSessionRef.current) {
            dispatch(setupVerto({session: vertoSessionRef.current}));
        }
        setIsVertoSessionReady(true);

    }, [dispatch, disconnectSecondaryCall, livingRoom.singleConnection, resetStream]);

    useEffect(() => {
        dispatch(setupVerto({participants: participants}));
    }, [participants]);

    const handleOnLeave = () => {
        if (recordedId) {
            dispatch(addRecordedVod(recordedId));
            setRecordedId(null);
        }
        vertoSessionRef.current?.hangup();
        vertoSessionRef.current?.cleanupWebRTC();
        vertoSessionRef.current = null;
        startVodRef.current = false;
        setIsVertoSessionReady(false);
        setCurrentVod(null);
        history.push(Routes.Home)
    };

    const handleMicMuted = useCallback((muted: boolean) => {
        setMicMuted(muted);
        if (userMediaRef.current) {
            const audioTrack = userMediaRef.current.getAudioTracks()[0];
            userMediaRef.current.getAudioTracks()[0].enabled = !muted;
        }
    }, []);

    const handleOnWatchPartySessionLeave = useCallback(() => {
        // history.replace(livingRoom.joinedFromJoinScreen ? Routes.Home : Routes.WatchPartyStart2);
    }, [history, livingRoom.joinedFromJoinScreen]);

    const handleExitAlert = () => {
        setIsExitAlert(true);
    }

    const [theatreMode, setTheatreMode] = useState<boolean>(false);

    const handleLayoutChange = (layout: VertoLayout) => {
        vertoSessionRef.current?.changeLayout(layout);
        setCurrentLayout(layout);
    }

    const handleTheatreModeChange = () => {
        if (currentLayout === VertoLayout.OnlyVideo) {
            setCurrentLayout(VertoLayout.VideoLeftLarge);
            vertoSessionRef.current?.changeLayout(VertoLayout.VideoLeftLarge);
        } else {
            setCurrentLayout(VertoLayout.OnlyVideo);
            vertoSessionRef.current?.changeLayout(VertoLayout.OnlyVideo);

        }

    };

    const syncAudioControls = useCallback((
        muted: boolean,
        volume: number,
        targetPlayer?: VideoJsPlayer
    ) => {
        if (targetPlayer) {
            targetPlayer.muted(muted);
            if (!muted) {
                targetPlayer.volume(volume);
            }
        }

        // GainNode (stream sent to user)
        if (gainNode) {
            if (muted) {
                gainNode.gain.value = 0;
            } else {
                // calcul the gain base on volume
                let gainValue;
                if (volume < 0.2) {
                    gainValue = 0.2;
                } else if (volume >= 0.2 && volume < 0.4) {
                    gainValue = 0.4;
                } else if (volume >= 0.4 && volume < 0.6) {
                    gainValue = 0.6;
                } else if (volume >= 0.6 && volume < 0.8) {
                    gainValue = 0.8;
                } else {
                    gainValue = INIT_GAIN_VOL;
                }
                gainNode.gain.value = gainValue;
            }
        }
    }, [gainNode]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const DEBOUNCE_DELAY = 300; // 300ms delay after user stops sliding

    const handleVolumeChange = (() => {
        return (e: React.ChangeEvent<HTMLInputElement>): void => {
            let  newVolume = parseFloat(e.target.value);

            // Update UI immediately for smooth visual feedback
            setVolume2(newVolume);
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Set new timeout to execute after user stops sliding
            timeoutRef.current = setTimeout(() => {
                if (videoRef.current) {
                    setIsMuted(newVolume === 0);
                    videoRef.current.volume = newVolume;
                    updateVolumeWithCommand(newVolume)
                }
            }, DEBOUNCE_DELAY);
        };
    })();

    const updateVolumeWithCommand=(newVolume: number)=>{
        // we use -50 instead of -100 because the volume gain is to small , so at -50 the volume is already null
        newVolume=(newVolume * 50) - 50;
        vertoSessionRef.current?.sendDebugAction("a_play_volume", `${newVolume}`, "conf-control")
    }

    const [isPlaying, setIsPlaying] = useState(true);
    const [vodStatus, setVodStatus] = useState<"Playing" | "Paused" | "Idle">("Playing");
    const [progress2, setProgress2] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume2, setVolume2] = useState(1);
    const [volumeBeforeMute, setVolumeBeforeMute] = useState(0.1);
    const [isMuted, setIsMuted] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<number | null>(null);

    const getVodName = (vodUrl: string): string => {
        const url = new URL(vodUrl);
        if(vodUrl.includes('records/')){
            return 'records/'+url.pathname.split('/').pop() || ""
        }
        else{
            return url.pathname.split('/').pop() || ""
        }
    }

    const formatTime = (timeInSeconds: number): string => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    const togglePlay = async () => {
        setIsPlaying(!isPlaying);
        const newStatus = vodStatus === "Playing" ? "Paused" : "Playing";
        if (sharedStreamData.current) {
            if (vodStatus === "Idle") {
                vertoSessionRef.current?.sendDebugAction("vod_play", getVodName(sharedStreamData.current.url), "conf-control");
            } else {
                vertoSessionRef.current?.sendDebugAction(newStatus === "Playing" ? "a_play_resume" : "a_play_pause", getVodName(sharedStreamData.current.url), "conf-control");
            }
        }
    };

    const handlePlayerReady = useCallback((playerElement: HTMLVideoElement) => {
        videoRef.current = playerElement;
    }, []);

    const toggleStatus = async () => {
        if (videoRef.current && sharedStreamData.current) {
            if (vodStatus === "Idle") {
                vertoSessionRef.current?.sendDebugAction("vod_play", getVodName(sharedStreamData.current.url), "conf-control")
            } else {
                vertoSessionRef.current?.sendDebugAction("a_play_stop", "", "conf-control")
                setVodStatus("Idle");
            }
        }
    };

    const toggleMute = (): void => {
        if (videoRef.current && sharedStreamData.current) {
            //videoRef.current.muted = !isMuted;
            if(isMuted){
                // in the case where the latest value of the volume before we mute was zero , we have to use 0.1 when unmuting
                if(volumeBeforeMute===0){
                    setVolume2(0.1)
                    updateVolumeWithCommand(0.1)
                }else{
                    setVolume2(volumeBeforeMute)
                    updateVolumeWithCommand(volumeBeforeMute)
                }
            }
            else{
                setVolumeBeforeMute(volume2);
                setVolume2(0)
                vertoSessionRef.current?.sendDebugAction("a_play_volume", "-50")
            }
            setIsMuted(!isMuted);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
        if (showChat) {
            if ( document.activeElement?.getAttribute("placeholder") === "Type a message") {
                return;
            }
        }else
        switch (e.code) {
            case 'Space':
                await togglePlay();
                break;
            case 'ArrowRight':
                if (videoRef.current) {
                    videoRef.current.currentTime += 5;
                }
                break;
            case 'ArrowLeft':
                if (videoRef.current) {
                    videoRef.current.currentTime -= 5;
                }
                break;
            case 'ArrowUp':
                setVolume2(prev => Math.min(1, prev + 0.1));
                if (videoRef.current) {
                    const vol= Math.min(1, videoRef.current.volume + 0.1);
                    videoRef.current.volume = vol;
                    updateVolumeWithCommand(vol)
                    setIsMuted(false);
                }
                break;
            case 'ArrowDown':
                setVolume2(prev => Math.max(0, prev - 0.1));
                if (videoRef.current) {
                    const vol=Math.max(0, videoRef.current.volume - 0.1);
                    videoRef.current.volume = vol;
                    setIsMuted(videoRef.current.volume === 0);
                    updateVolumeWithCommand(vol)
                }
                break;
            case 'KeyM':
                toggleMute();
                break;
            default:
                break;
        }
    };

    // Show controls on mouse move
    const showControls = (): void => {
        setIsControlsVisible(true);

        // Reset any existing timeout
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }

        // Set a timeout to hide controls after 3 seconds of inactivity
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) {
                setIsControlsVisible(false);
            }
        }, 3000);
    };

    const isSeekingRef = useRef(false);

    const handleSeek = (seekAmount: number, prefix: string): void => {
        vertoSessionRef.current?.sendDebugAction("a_play_seek", `${prefix}${seekAmount * 1000}`, "conf-control");
    }

    // Handle time update
    useEffect(() => {
        const video = videoRef.current;

        const handleTimeUpdate = (): void => {
            if (isSeekingRef.current) {
                // 🚫 Skip updates during seeking
                return;
            }
            if (video && sharedStreamData.current) {
                video.currentTime = (video.currentTime + 1) % ((sharedStreamData.current?.duration || 1) + 1)
                setCurrentTime(video.currentTime);
                // setProgress2(100);
                setProgress2(((video.currentTime + 1) % ((sharedStreamData.current?.duration || 1) + 1) / (sharedStreamData.current?.duration || 1)) * 100);
            }
        };

        const handleLoadedMetadata = (): void => {
            if (video && sharedStreamData.current) {
                setDuration(sharedStreamData.current?.duration);
            }
        };

        const handleEnded = (): void => {
            setIsPlaying(false);
            setProgress2(100);
        };

        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, []);

    // Add keyboard event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, duration]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                window.clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const talking =!micMuted || !!participants.find(p => !p.audio.muted && !p.isHost);
        if(talking){
            if(!isMuted){
                toggleMute()
            }
        }else if(isMuted && volumeBeforeMute > 0){
            toggleMute();
        }
    }, [micMuted, participants]);

    const [loop, setLoop] = useState(true);
    const [seek, setSeek] = useState("0");
    const progressBarRef = useRef<HTMLDivElement>(null);

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        isSeekingRef.current = true;
        if (videoRef.current && progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const seekTimeSec = pos * duration;

            const seekTimeMs = Math.floor(seekTimeSec * 1000); // milliseconds for server

            vertoSessionRef.current?.sendDebugAction("a_play_seek", `${seekTimeMs}`, "conf-control");

            videoRef.current.currentTime = seekTimeMs;

            setCurrentTime(seekTimeMs);
        }
        setTimeout(() => {
            isSeekingRef.current = false;
        }, 500);
    };

    const streamData = sharedStreamData.current;

    const handleLoop = useCallback(() => {
        if (!streamData) return;

        const nextLoop = !loop; // Toggle value

        setLoop(nextLoop); // Update state

        if (isPlaying) {
            if (nextLoop) {
                dispatch(setInfoToast("Loop mode turned on"));
                vertoSessionRef.current?.sendDebugAction("a_vod_loop", getVodName(streamData.url), "conf-control");
            } else {
                dispatch(setInfoToast("Loop mode turned off"));
                vertoSessionRef.current?.sendDebugAction("a_vod_loop", "", "conf-control");
            }
        } else {
            vertoSessionRef.current?.sendDebugAction("vod_play", getVodName(streamData.url), "conf-control");
        }

        vertoSessionRef.current?.sendDebugAction("vid-layout", "1up_top_left+9_orig", "conf-control");

    }, [loop, isPlaying, streamData, dispatch]);


    return (
        <Layout>
                <main
                    ref={pageRef}
                    // hidden={loading}
                    className={
                        `living-room-main${isFullscreen ?
                            (livingRoom.share === ShareStreamOption.VoD ? '-fullscreen player-controller' : '-fullscreen')
                            : '' + !theatreMode ? "" : "theatre-mode"}`
                    }
                >
                    {
                        !theatreMode ? (
                            <section style={{ zIndex: 100 }} className={`living-room-chat-container ${showChat ? 'side-content-open' : ''}`}>
                                <AdSenseCard
                                    slot={AdSenseSlot.Left}
                                    format={AdSenseFormat.Rectangle}
                                    className="ad"
                                />

                                {!loading && vertoSessionRef.current && (
                                    <Chat
                                        vlrId={livingRoom.vlrId}
                                        session={vertoSessionRef.current}
                                        participants={participants}
                                        show={showChat}
                                    />
                                )}
                            </section>
                        ) : <></>
                    }

                    <motion.div
                        style={{ zIndex: 100 }}
                        initial={{x: "-100%"}}
                        animate={{x: theatreMode && showChat ? "0%" : "-100%"}}
                        transition={{type: "spring", stiffness: 300, damping: 30}}
                        className="fixed left-0 bottom-0 z-100 flex chat-container-size"
                    >
                        {!loading && vertoSessionRef.current && (
                            <Chat
                                vlrId={livingRoom.vlrId}
                                session={vertoSessionRef.current}
                                participants={participants}
                                show={showChat}
                            />
                        )}
                    </motion.div>

                    <section className="video-room-container">
                        <TopBarStream
                            sharedStreamData={sharedStreamData.current}
                            logo={placeholderImage}
                            streamName={livingRoom.channel.name}
                            roomId={livingRoom.publicRoomId}
                            participants={participants}
                            onExit={handleExitAlert}
                        />
                        {
                            ((startVodRef.current || roomId) && currentVod) && (// in the case we just wan to join startVodRef will always be false so we check only if the roomId is defined
                              <main className={!theatreMode ? "video-room-main" : "video-room-main theatre-mode"}>
                                  <div className="video-room-inner"
                                        onMouseMove={showControls}
                                        onClick={async (e) => {
                                            if ((e.target as HTMLElement).closest('.video-controls')) return;
                                            await togglePlay();
                                        }}
                                  >
                                      <NoVideoCanvas onVideoTrack={handleNoVideoTrack}/>
                                      <WatchPartySession
                                          id={currentVod.toString()}
                                          noVideoTrack={noVideoTrackRef}
                                          vod={sharedStreamData}
                                          vodChannel={vodChannel}
                                          setCurrentVod={setCurrentVod}
                                          streamIsReady={isVertoSessionReady}
                                          isPlaying={isPlaying}
                                          loop={loop}
                                          volume={volume2}
                                          setLoop={setLoop}
                                          setVodStatus={setVodStatus}
                                          captureMediaStream={captureMediaStream}
                                          onMicMuted={handleMicMuted}
                                          onCamStopped={setCamStopped}
                                          onShowProgressLeave={setShowProgressLeave}
                                          onVertoSession={handleVertoSessionChange}
                                          onProgress={setProgress}
                                          onShowLoading={setLoading}
                                          onParticipants={handleParticipantsChange}
                                          onLeave={handleOnWatchPartySessionLeave}
                                          onGainNode={setGainNode}
                                          onUserStream={handleOnUserStream}
                                          onStopSharing={handleStopSharing}
                                          onMergeStreams={mergeAudioStreams}
                                          onScreenShareStream={handleStreamRefChange}
                                          onPlayerReady={handlePlayerReady}

                                      />
                                      <div className={`video-controls ${isControlsVisible ? 'visible' : 'hidden'}`}>

                                          {(roomHost?.userId === profile.id) &&
                                              <div  className="controls-row">
                                                  <div className="left-controls">

                                                      <button className="control-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                                          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                                      </button>

                                                      {vodStatus !== "Idle" &&  <button className="control-button" onClick={toggleStatus} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                                          <SquareIcon size={20} className={'text-red-500'} />
                                                      </button>}

                                                      <button className="control-button" onClick={handleLoop} aria-label="Restart">
                                                          {
                                                              loop ? <Repeat size={18} /> : <Repeat1 size={18} />
                                                          }
                                                      </button>


                                                      <div className="volume-control">
                                                          <button className="control-button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                                              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                                          </button>
                                                          <input
                                                              type="range"
                                                              min="0"
                                                              max="1"
                                                              step="0.01"
                                                              value={volume2}
                                                              onChange={handleVolumeChange}
                                                              className="volume-slider"
                                                              aria-label="Volume"
                                                          />
                                                      </div>

                                                      <div className="time-display">
                                                          {/*<b>{sharedStreamData.current && formatTime((currentTime + 1) % (sharedStreamData.current?.duration + 1))}</b> - */}
                                                          {streamData && <b style={{ color:"#ffab00" }}>{formatTime(streamData.duration)}</b>}
                                                      </div>

                                                      <div className="right-controls">

                                                          <button className="control-button" onClick={() => {
                                                              handleSeek(10, "-")
                                                          }} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                                              <StepBack />
                                                          </button>

                                                          <button className="control-button" onClick={() => {
                                                              handleSeek(10, "+")
                                                          }} aria-label={isPlaying ? 'Pause' : 'Play'}>
                                                              <StepForward />
                                                          </button>

                                                      </div>

                                                  </div>

                                                  <div className="center-controls">



                                                  </div>

                                                  <div className="right-controls">


                                                  </div>
                                              </div>
                                          }

                                      </div>
                                  </div>

                                  {!loading && sharedStreamData.current && (
                                      <SideBar
                                          showParticipants={showParticipants}
                                          showChat={showChat}
                                          streamId={sharedStreamData.current?.id}
                                          showDebugStream={showDebugStream}
                                          micMuted={micMuted}
                                          camStopped={camStopped}
                                          isFullscreen={isFullscreen}
                                          onShowParticipants={setShowParticipants}
                                          onShowChat={setShowChat}
                                          onShowDebugStream={setShowDebugStream}
                                          onUserMediaChange={handleUserMediaChange}
                                          onToggleCam={handleToggleCam}
                                          onToggleMic={handleToggleMic}
                                          onFullscreen={handleFullscreenChange}
                                          onChangeStream={() => setShowChangeStream(true)}
                                          onChangeFile={() => setShowChangeFile(true)}
                                          onStopStream={handleStopStream}
                                          onLayoutChange={layout => handleLayoutChange(layout)}
                                          onScreenShare={handleScreenShare}
                                          onStopScreenShare={handleStopScreenShare}
                                          onShareMyCamera={handleShareMyCamera}
                                          onSharedOptionChanged={option => sharedRef.current.newValue = option}
                                          setIsSecondaryRecalled={setIsSecondaryRecalled}
                                          onTheatreMode={handleTheatreModeChange}
                                          theatreMode={theatreMode}
                                          onShowBets={setShowBets}
                                          showBets={showBets}
                                          showGiveRewards={showGiveRewards}
                                          onShowGiveRewards={setShowGiveRewards}
                                          currentLayout={currentLayout}
                                          participantsCount={participantsRef.current.length}
                                          recordedId={recordedId}
                                      />
                                  )}
                              </main>
                            )
                        }

                        {vertoSessionRef.current && (
                            <>
                                <BetsBar
                                    isFullscreen={false}
                                    session={vertoSessionRef.current}
                                    roomId={Number(livingRoom.vlrId)}
                                    isRoomOwner={livingRoom.isHost}
                                    show={showBets}
                                />
                                {roomHost &&
                                    <GiveStarModal
                                        hostId={roomHost.userId as number}
                                        show={showGiveRewards}
                                        setShow={setShowGiveRewards}
                                    />
                                }
                            </>

                        )}


                    </section>

                    <audio ref={audioRef} autoPlay hidden/>

                    {
                        !theatreMode ?
                            (
                                <section
                                    className={`living-room-side-features ${showDebugStream || showParticipants ? 'side-content-open' : ''}`}>
                                    <AdSenseCard
                                        slot={AdSenseSlot.Right}
                                        format={AdSenseFormat.Rectangle}
                                        className="ad"
                                    />

                                    {showDebugStream && <StreamDebugInfo/>}

                                    {
                                        vertoSessionRef.current &&
                                        <Participants
                                            isFullscreen={isFullscreen}
                                            session={vertoSessionRef.current}
                                            participants={participants}
                                            host
                                            show={showParticipants}
                                        />
                                    }
                                </section>
                            ) :
                            <></>
                    }

                    <motion.div
                        initial={{x: "-100%"}}
                        animate={{x: (theatreMode && showParticipants) ? "0%" : "-100%"}}
                        transition={{type: "spring", stiffness: 300, damping: 30}}
                        className="fixed bottom-0 left-0 shadow-lg z-50"
                    >
                        <section className="participant-theatre">
                            {
                                vertoSessionRef.current &&
                                <Participants
                                    isFullscreen={isFullscreen}
                                    session={vertoSessionRef.current}
                                    participants={participants}
                                    host
                                    show={showParticipants}
                                />
                            }
                        </section>
                    </motion.div>

                    <FullscreenListeners isInFullscreen={isFullscreen}/>
                </main>

                {isExitAlert && <IonAlert
                    isOpen={isExitAlert}
                    onDidDismiss={() => setIsExitAlert(false)}
                    message={t("watchPartyStart.aboutToLeave")}
                    buttons={[
                        {
                            text: `${t("common.decline")}`,
                            role: 'cancel'
                        },
                        {
                            text: `${t("common.leave")}`,
                            handler: () => {
                                handleOnLeave();
                            }
                        }
                    ]}
                />}
        </Layout>
    );
};

export default VodRoomChannel;
