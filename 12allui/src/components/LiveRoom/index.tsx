import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonImg,
  IonItem,
  IonList,
  IonListHeader,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import logo from "../../images/12all-logo-128.png";
import sharpStar from "../../images/icons/star-sharp.svg";
import { Vlr, VlrParticipant } from "../../shared/types";
import RoomActions from "../RoomActions";
import { API_URL } from "../../shared/constants";
import { BillingServices } from "../../services";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import {  updateStarsBalance } from "../../shared/helpers";
import { setTotalStarBalance } from "../../redux/actions/billingRewardActions";
import { Routes } from "src/shared/routes";

type Props = {
  room: Vlr;
  isHome: boolean
};

interface Participant extends VlrParticipant {
  firstLetter: string;
}

const parseStatAt = (startAt: string) => {
  const startAtDate = new Date(startAt);
  return `${startAtDate.getHours()}:${startAtDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const LiveRoom: React.FC<Props> = ({ room, isHome }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const profile = useSelector((state: any) => state.profile);
  const billingRewards = useSelector((state: any) => state.billingRewards);
  const [previewLoaded, setPreviewLoaded] = useState<{
    [key: number]: boolean;
  }>({});
  const startedAt = useRef<string>(
    room.started_at ? parseStatAt(room.started_at) : ""
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hostFirstLetter, setHostFirstLetter] = useState<string>("");
  const [host, setHost] = useState<VlrParticipant>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [roomPrice, setRoomPrice] = useState(0);

  useEffect(() => {
    const participants = room.participants
      .filter((p) => p.role !== "host")
      .slice(0, 5)
      .reverse()
      .map((participant) => ({
        ...participant,
        firstLetter: participant.nickname
          ? participant.nickname.charAt(0)
          : "U",
      }));

    setParticipants(participants);

    const host = room.participants.find(({ role }) => role === "host");
    setHost(host);
    host?.nickname && setHostFirstLetter(host.nickname.charAt(0));
  }, [room]);

  const getUrlLink=()=>{
    if(room.vod?.id && !room.stream){
      return `${Routes.WatchParty}/${room.channel.channel_deep_link}`;
    }else if( !room.channel.is_vlr && room.channel.stream_id) {
      return `${Routes.Stream}/${room.channel.stream_id}/${room.channel.channel_deep_link}`;
    }
    return `${Routes.WatchParty}/${room.channel.channel_deep_link}`;
  }

  const onItemClick = async () => {
    if(room.vod?.id && !room.stream){
      onClickOnVODRoom();
      return 
    }
    try {
      const { data: { result: roomPriceResult } } = await BillingServices.getRoomPrice(room.channel.channel_deep_link);
      const roomPriceStars = roomPriceResult === "" ? 0 : roomPriceResult.stars;
      setRoomPrice(roomPriceStars);

      const isRoomFree = roomPriceStars === 0;
      const isLoggedIn = profile.id !== 0;

      if (isRoomFree) {
        history.push(`${getUrlLink()}${isLoggedIn ? '' : '/m'}`);
      } else { // Room has a price (roomPriceStars > 0)
        if (!isLoggedIn) {
          dispatch(setInfoToast("login.loginFirst"));
        } else {
          const { data: { result: isRoomPaidResult } } = await BillingServices.isRoomPaid(
            profile.id,
            room.channel.channel_deep_link
          );

          if (isRoomPaidResult.paid) {
            history.push(`${getUrlLink()}/m`);
          } else {
            setIsOpen(true);
          }
        }
      }
    } catch (error) {
      console.error("Error in onItemClick:", error);
    }
  };

  const onClickOnVODRoom = async () => {
  try {
    const isLoggedIn = profile.id !== 0;

    if (!isLoggedIn) {
      dispatch(setInfoToast("login.loginFirst"));
      return; // Stop if not logged in
    }

    if (!room.vod?.id) {
      console.warn("Attempted to click on VOD room, but room.vod.id is missing.");
      return;
    }

    const { data: { result: isRoomPaidResult } } = await BillingServices.isRoomPaid(
      profile.id,
      room.vod.id.toString() + '_vod'
    );
    if (room.vod.starsAmount<=0 || isRoomPaidResult?.paid) {
      history.push(`${getUrlLink()}`);
    } else {
      setRoomPrice(room.vod.starsAmount);
      setIsOpen(true);
    }
  } catch (error) {
    console.error("Error in onClickOnVODRoom:", error);
  }
};
  const onYesClick = () => {
    let BillingStreamId=room.channel.channel_deep_link;
    if(room.vod?.id && !room.stream){
      BillingStreamId=room.vod?.id+ '_vod';
    }
    BillingServices.payRoomPrice(
      profile.id,
      BillingStreamId
    ).then(async ({ data }) => {
      if (data.status === "ok" && data.result.status === "SUCCESS") {
        const starsBalance = await updateStarsBalance(profile.id);
        dispatch(setTotalStarBalance(starsBalance));
        dispatch(setInfoToast(t("billing.enteringRoom.paidSuccess")));
        history.push(`${getUrlLink()}`);
        setIsOpen(false);
      } else if (data.status === "ok" && data.result.status !== "SUCCESS") {
        dispatch(setInfoToast(t("billing.enteringRoom.notEnoughStars")));
      } else {
        dispatch(setErrorToast(t("myProfile.notifications.errorSave")));
        setIsOpen(false);
      }
    });
  };

  const onNoClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <IonList className={`live-room !max-h-[300px] ${!isHome ? '!min-w-[300px]' : ''}`}>

        <IonItem onClick={onItemClick} className="room-meta !text-left" lines="none">
          <IonImg
            src={
              !room.channel.is_adult_content && room.channel.logo
                ? room.channel.logo
                : logo
            }
            className={
              previewLoaded[room.id]
                ? "room-logo-small"
                : `room-logo${room.channel.logo ? " has-logo" : ""}`
            }
          />

          {room.channel.https_preview_high && (
            <IonImg
              src={room.channel.https_preview_high}
              className={`room-preview${
                previewLoaded[room.id] ? " room-loaded" : ""
              }`}
              onIonImgDidLoad={() =>
                setPreviewLoaded((prev) => ({ ...prev, [room.id]: true }))
              }
            />
          )}

          <div className="flex flex-col justify-start px-2.5 py-3 w-full text-left">
            <span className="!text-[0.85rem]">
              {room.vod?.title ?? room.channel.name}
            </span>
          </div>
        </IonItem>

        <div className={"flex justify-start items-center"}>
          <div className="participants !w-[56px] !max-w-[56px] ps-2 !m-0">
            {host?.avatar ? (
                <IonAvatar
                    slot="start"
                    className="host"
                    title={host.nickname || ""}
                >
                  <img src={`${API_URL}${host.avatar}`} alt="" />
                </IonAvatar>
            ) : hostFirstLetter ? (
                <IonText
                    slot="start"
                    className="host-default-avatar"
                    title={host?.nickname || ""}
                >
                  {hostFirstLetter}
                </IonText>
            ) : null}

          </div>

          {startedAt.current && (
              <span className={'!bg-transparent ps-1 !w-[70%] !text-[0.7rem]'}>
                {t("liveRoom.startedAt")} {startedAt.current}
              </span>
          )}

          <RoomActions room={room} />
        </div>

        {
          participants.length > 0 && (
                <IonList className="participants-list">
                  {participants.map(
                      ({ id, nickname, avatar, firstLetter, color }) => (
                          <div key={id} title={nickname} className="participant">
                            {avatar ? (
                                <IonAvatar>
                                  <img src={`${API_URL}${avatar}`} alt="" />
                                </IonAvatar>
                            ) : firstLetter ? (
                                <IonText
                                    className="default-avatar"
                                    style={{ backgroundColor: color }}
                                >
                                  {firstLetter}
                                </IonText>
                            ) : null}
                          </div>
                      )
                  )}
                </IonList>
            )
        }

      </IonList>

      <IonModal isOpen={isOpen} className="searchable-language-modal">
        <IonToolbar>
          <IonTitle>Do you want to pay?</IonTitle>
        </IonToolbar>
        <div className="modal-body">
          <IonText>Room Price</IonText>
          <div className="modal-room-price">
            <IonImg src={sharpStar} />
            <IonText>{roomPrice}</IonText>
          </div>
        </div>
        <IonButtons className="home-filter confirm-buttons-group">
          <IonButton className="confirm-button" onClick={onYesClick}>
            Yes
          </IonButton>
          <IonButton className="confirm-button" onClick={onNoClick}>
            No
          </IonButton>
        </IonButtons>
      </IonModal>
    </>
  );
};

export default LiveRoom;
