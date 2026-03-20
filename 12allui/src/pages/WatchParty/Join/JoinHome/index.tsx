import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";
import {
  LivingRoomState,
  ReduxSelectors,
} from "../../../../redux/shared/types";
import { Routes } from "../../../../shared/routes";
import UserMediaSettings from "../../../../components/UserMediaSettings";
import appStorage from "../../../../shared/appStorage";
import Layout from "../../../../components/Layout";
import { RouteComponentProps, useParams } from "react-router";
import {
  setErrorToast,
  setInfoToast,
  setWarnToast,
} from "../../../../redux/actions/toastActions";
import { BillingServices, VlrService } from "../../../../services";
import setLivingRoom from "../../../../redux/actions/livingRoomActions";
import { ShareStreamOption } from "../../enums";
import { MapPublicId } from "../../../../shared/types";
import { setEnableRewardPopup } from "../../../../redux/actions/billingRewardActions";
import BillingPopup from "../../../../components/Billing/BillingCommonPopup";

export enum MapVlrResponse {
  Ok = "ok",
  RoomNotFound = "room_not_found",
}

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

const WatchPartyJoinHome: FC<RouteComponentProps> = ({
  history,
  location: { search },
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();
  const { mic, cam } = useSelector(
    ({ userMedia }: ReduxSelectors) => userMedia
  );
  const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const joining = useRef<boolean>(false);

  const [username, setUsername] = useState<string>(nickname);
  const [room, setRoom] = useState<string>("");
  const { enablePopup } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards);

  const [openCostChanneAlert, setOpenCostChannelAlert] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    const data = appStorage.getObject(WP_JOIN);
    const user = nickname || data?.username || "";
    setUsername(user);

    const roomId = (id?.trim() !== "join" && id) || data?.room || "";
    setRoom(roomId);
  }, [id, nickname]);

  const onJoin = () => {
    if (joining.current) {
      return;
    }

    joining.current = true;

    VlrService.mapVlrPublicId(room)
      .then(({ data }) => {
        joining.current = false;
        const { channelIsActive, status, vlr } = data;
        let errorMessage = "";
        switch (status) {
          case MapVlrResponse.Ok:
            if (channelIsActive) {
              appStorage.setObject(WP_JOIN, { username, room });
              if (vlr.channel.stream_id && !vlr.channel.is_vlr && vlr.vod === null) {
                history.push(
                  `${Routes.Stream}/${vlr.channel.stream_id}/${room}`
                );
              } else if (vlr.channel.stream_camera) {
                history.push(`${Routes.StreamCamera}/${room}`);
              } else {
                const dispatchData = prepareJoinLivingRoomData({
                  mapPublicIdData: data,
                  mic,
                  cam,
                  nickname: username,
                });
                dispatch(setLivingRoom(dispatchData));
                history.push(`${Routes.WatchPartyJoinRoom}${search}`);
              }
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
  };

  const closeRewardModal = useCallback(() => {
    if (enablePopup.openPaidStreamGuest) {
      dispatch(setEnableRewardPopup({ openPaidStreamGuest: false }));
      setTimeout(() => {
        // setShowRewardPopup(false)
        // history.push(Routes.Home);
      }, 2000);
    }
  }, [enablePopup, dispatch]);

  const onYesClick = () => {
    BillingServices.payRoomPrice(profile.id, id).then(({data}) => {
      if (data.status === "ok" && data.result.status === "SUCCESS") {
        dispatch(setInfoToast(t("billing.enteringRoom.paidSuccess")));
        setIsOpen(false);
      } else if (data.status === "ok" && data.result.status !== "SUCCESS") {
        dispatch(setWarnToast(t('billing.enteringRoom.notEnoughStars')));
        setIsOpen(false);
      } else {
        dispatch(setErrorToast(t("myProfile.notifications.errorSave")));
        setIsOpen(false);
      }
    });
  };

  const onNoClick = () => {
    history.push(`/home`);
    setIsOpen(false);
  };

  useEffect(() => {
    BillingServices.getRoomPrice(id).then(
      ({ data: { result: roomPriceResult } }) => {
        if (roomPriceResult && roomPriceResult.stars > 0 && profile.id === 0) {
          dispatch(setInfoToast("login.loginFirst"));
          history.push("/login");
        } else if (
          roomPriceResult &&
          roomPriceResult.stars > 0 &&
          profile.id !== 0
        ) {
          BillingServices.isRoomPaid(profile.id, id).then(
            ({ data: { result: isRoomPaidResult } }) => {
              if (!isRoomPaidResult.paid) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }
          );
        }
      }
    );
  }, []);


  return (
    <>
      <Layout className="join-lr-page center md">
        {openCostChanneAlert && (
          <BillingPopup closeRewardModal={closeRewardModal} />
        )}

        <div className="join-container">
          {(!id || id.trim() === "join") && (
            <IonItem>
              <IonLabel position="stacked">{t("joinScreen.room")}</IonLabel>
              <IonInput
                placeholder={t("joinScreen.typeRoom")}
                value={room}
                onIonChange={(e) =>
                  setRoom(e.detail.value ? e.detail.value.trim() : "")
                }
              />
            </IonItem>
          )}
          {!nickname && (
            <IonItem>
              <IonLabel position="stacked">{t("joinScreen.name")}</IonLabel>
              <IonInput
                placeholder={t("joinScreen.typeName")}
                value={username}
                onIonChange={(e) =>
                  setUsername(e.detail.value ? e.detail.value.trim() : "")
                }
              />
            </IonItem>
          )}
          <UserMediaSettings />

          <IonButton
            onClick={onJoin}
            color="primary"
            fill="solid"
            disabled={!username || !room}
          >
            {t("joinScreen.join")}
          </IonButton>
        </div>
      </Layout>
      <IonModal
        isOpen={isOpen}
        className="searchable-language-modal"
        backdropDismiss={false}
      >
        <IonToolbar>
          <IonTitle>Do you want to pay?</IonTitle>
        </IonToolbar>
        <IonButtons className="home-filter confirm-buttons-group">
          <IonButton onClick={onYesClick}>Yes</IonButton>
          <IonButton onClick={onNoClick}>No</IonButton>
        </IonButtons>
      </IonModal>
    </>
  );
};

export default WatchPartyJoinHome;
