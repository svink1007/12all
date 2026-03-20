import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import "./styles.scss";
import {useTranslation} from "react-i18next";
import {
    IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonItemGroup,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonPopover,
    IonSelect,
    IonSelectOption, IonText,
    IonToolbar,
    useIonRouter,
    // useIonRouter
} from "@ionic/react";





import {globeOutline, heart, heartOutline, personCircleOutline} from "ionicons/icons";
import {useHistory, useLocation} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {ReduxSelectors} from "../../redux/shared/types";
import {setErrorToast, setInfoToast} from "../../redux/actions/toastActions";
import redSharpStar from "../../images/icons/star-sharp.svg";
import {
    setEnableRewardPopup,
    setFirstFavoriteReward,
    setTotalStarBalance
} from "../../redux/actions/billingRewardActions";
import {BillingServices, ChatHistoryService, UserManagementService} from "../../services";
import {SharedStreamVlrs, SharedVodVlrs, Vlr} from "../../shared/types";
import {addFavoriteStream, removeFavoriteStream, toggleStreamFavorite} from "../../redux/actions/streamActions";
import {updateStarsBalance} from "../../shared/helpers";
import VertoSession from "../../verto/VertoSession";
import {io, Socket} from 'socket.io-client';
import {API_URL, BILLING_SOCKET} from "../../shared/constants";
import {Participant} from "../../verto/models";

type MenuItemsProps = {
    inToolbar?: boolean;
};

const MenuItems: FC<MenuItemsProps> = ({
                                           inToolbar,
                                       }: MenuItemsProps) => {
    const {pathname} = useLocation();
    const {t} = useTranslation();
    const router = useIonRouter();
    const history = useHistory();
    const profile = useSelector(({profile}: ReduxSelectors) => profile);
    const language = useSelector(({language}: ReduxSelectors) => language);
    const {starsBalance} = useSelector(
        ({billingRewards}: ReduxSelectors) => billingRewards
    );
    const lines = useRef<"none" | "full">(inToolbar ? "none" : "full");
    const [activeRoute, setActiveRoute] = useState<string>("");
    const [selectedStar, setSelectedStar] = useState<string>("");

    useEffect(() => {
        setActiveRoute(pathname);
    }, [pathname]);

    useEffect(() => {
        const unlisten = history.listen(() => {
            if (selectedStar) {
                setSelectedStar("");
            }
        });

        return () => {
            unlisten();
        };
    }, [history, selectedStar]);

    const dispatch = useDispatch();

    return (
        <>
            {/* billing: */}
            <div
                className='flex items-center mr-11'
            >
                <IonImg className='w-5 mr-2.5' src={redSharpStar}/>
                <span>{`${profile.jwt &&
                !profile.isAnonymous &&
                ((!!profile?.email && !profile?.email.includes("@skiplogin.com")) || profile?.email === null) ? starsBalance : "Stars"}`}</span>
            </div>
        </>
    );
};

type Props = {
    sharedStreamData?: SharedStreamVlrs | SharedVodVlrs;
    params?: "vod" | "stream";
};

const Header: FC<Props> = ({sharedStreamData, params = "stream"}) => {

    const dispatch = useDispatch();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const profile = useSelector(({profile}: ReduxSelectors) => profile);

    const [socket, setSocket] = useState<WebSocket | null>();
    const [messages, setMessages] = useState<any>([]);

    const [connectionTime, setConnectionTime] = useState<Date | null>(null);
    const [futureTime, setFutureTime] = useState<Date | null>(null);

    const livingRoom = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

    const [timer, setTimer] = useState<number | null>(null);

    const vertoSession: VertoSession | null = useSelector(({ verto }: ReduxSelectors) => verto.session);
    const currentID: string | null = useSelector(({ verto }: ReduxSelectors) => verto.vlr);
    const participants: Participant[] = useSelector(({ verto }: ReduxSelectors) => verto.participants);

    const [callId, setCallerID] = useState<string | null>(null)

    useEffect(() => {
        setCallerID(participants.find((p) => p.userId === profile.id)?.callId ?? null);
    }, [profile, participants]);

    

    useEffect(() => {
        async function billingEvent() {
            let billing = await BillingServices.getBillingEvents();
            if (billing.data.status === "ok") {
                const watchVideo = billing.data.result.find(item => item.type === "WATCH_VIDEO");
                const hostVideo = billing.data.result.find(item => item.type === "HOST_VIDEO");
                // setTimer(0.25)
                setTimer(watchVideo ? watchVideo.minutePeriod : 0)
            } else {
                dispatch(setErrorToast(
                    "Failed to load billing events"
                ))
            }
        }

        // if(params === "stream" || livingRoom.vod === null){
        if(true){
            billingEvent();
        }
    }, []);

    useEffect(() => {
        // if(params === "stream" || livingRoom.vod === null){
        if(true){
            if (!timer || timer <= 0) return;

            const now = new Date();
            setConnectionTime(now);
            const future = new Date(now.getTime() + timer * 60000);
            setFutureTime(future);
            setTimeLeft(timer * 60);

            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (vertoSession && callId) {
                            const message = `Watching Reward Transferred`;
                            vertoSession.sendMessage.oneToOne(message, callId);
                        }
                        return timer * 60;
                    }

                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, vertoSession, callId]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const hasConnected = useRef(false);

    useEffect(() => {
        // if (!hasConnected.current && (params === "stream" || livingRoom.vod === null) && profile.id) {
        if (!hasConnected.current && true && profile.id) {
            hasConnected.current = true;

            const wsUrl = `${BILLING_SOCKET}?externalClientId=${profile.id}`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                if (timer !== null) {
                    const now = new Date();
                    setConnectionTime(now);
                    const future = new Date(now.getTime() + timer * 60000);
                    setFutureTime(future);
                    setSocket(socket);
                }
            };

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.stars && message.description) {
                        setMessages((prevMessages: any[]) => [...prevMessages, message]);
                        // dispatch(setTotalStarBalance());
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            socket.onerror = (error) => {
                console.debug(`WebSocket error for ${wsUrl}:`, error);
            };
           
            // Cleanup on unmount
            return () => {
                socket.close();
                setSocket(null);
            };
        }
    }, []);

    function isSharedStreamVlrs(data: SharedStreamVlrs | SharedVodVlrs): data is SharedStreamVlrs {
        return (
            data !== undefined &&
            'name' in data &&
            'is_owner' in data &&
            'stream_snapshot' in data &&
            'epg_channel' in data
        );
    }

    const handleFavoriteClick = () => {
        if (!sharedStreamData) return;

        if(params === "stream" || livingRoom.vod === null){
            const sharedStream = sharedStreamData as SharedStreamVlrs; // Now TypeScript knows it's a SharedStreamVlrs

            const updateStream = () => {
                sharedStream.is_favorite = !sharedStream.is_favorite
                const {vlr, ...stream} = sharedStream;
                dispatch(toggleStreamFavorite(stream));
                dispatch(
                    stream.is_favorite
                        ? addFavoriteStream(stream)
                        : removeFavoriteStream(stream)
                );
            };

            if (sharedStream.is_favorite) {
                UserManagementService.removeFavoriteStream(sharedStreamData.id)
                    .then(updateStream)
                    .catch((err) => console.error(err));
            } else {
                UserManagementService.addFavoriteStream(sharedStreamData.id)
                    .then(updateStream)
                    .then((response) => {
                        const favStreamEvent = "entry.favorite_stream";
                        if (!sharedStream.is_favorite) {
                            BillingServices.billingFavorite(profile.id, favStreamEvent).then(
                                async ({data: {result}}) => {
                                    if (
                                        result.billingReward.creditedStars &&
                                        result.billingReward.creditedStars > 0
                                    ) {
                                        const starsBalance = await updateStarsBalance(profile.id);
                                        dispatch(setTotalStarBalance(starsBalance));
                                        dispatch(setFirstFavoriteReward(result));
                                        dispatch(setEnableRewardPopup({firstFavoriteAward: true}));
                                    }
                                }
                            );
                        }
                    })
                    .catch((err) => console.error(err));
            }
        }
    };

    return (
        <div className="app-header-2">
            <div className="header-toolbar">
                <div className="flex justify-start items-center">

                    {
                        // params === "stream" || livingRoom.vod === null && <IonItem
                        true && <IonItem
                            lines="none"
                            data-id="reward"
                            className={"star-balance-display stars-item"}
                        >
                            <>
                                <IonImg className='w-5 mr-2 hidden sm:block' src={redSharpStar}/>
                                <IonLabel className="text-md hidden sm:block">Next reward in <b className={"mr-2 ml-1"} style={{color: "#ffab00"}}>{formatTime(timeLeft)}</b></IonLabel>
                            </>

                        </IonItem>
                    }

                    {sharedStreamData && params === "stream" &&
                        <IonButton className='ml-2 mr-5 heart-icon' onClick={handleFavoriteClick}>
                            <IonIcon
                                slot="icon-only"
                                icon={(sharedStreamData as SharedStreamVlrs)?.is_favorite ? heart : heartOutline}
                                color={(sharedStreamData as SharedStreamVlrs)?.is_favorite ? "primary" : ""}
                            />
                        </IonButton>
                    }

                    <MenuItems
                        inToolbar
                    />

                </div>
            </div>
        </div>
    );
};

export default Header;
