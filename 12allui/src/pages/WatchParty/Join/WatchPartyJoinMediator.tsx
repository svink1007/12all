import { FC, useEffect, useState } from "react";
import { RouteComponentProps, useParams } from "react-router";
import { BillingServices, VlrService } from "../../../services";
import { Routes } from "../../../shared/routes";
import setLivingRoom from "../../../redux/actions/livingRoomActions";
import {
  setErrorToast,
  setInfoToast,
  setWarnToast,
} from "../../../redux/actions/toastActions";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import appStorage from "../../../shared/appStorage";
import { WP_CAM, WP_MIC } from "../../../shared/constants";
import { MapVlrResponse, prepareJoinLivingRoomData } from "./JoinHome";
import {
  IonButton,
  IonButtons,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

const WatchPartyJoinMediator: FC<RouteComponentProps> = ({ history }) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onYesClick = () => {
    BillingServices.payRoomPrice(profile.id, id).then(({data}) => {
      if (data.status === "ok" && data.result.status === "SUCCESS") {
        dispatch(setInfoToast(t("billing.enteringRoom.paidSuccess")));
        setIsOpen(false);
      } else if (data.status === "ok" && data.result.status !== "SUCCESS") {
        dispatch(setWarnToast(t("billing.enteringRoom.notEnoughStars")));
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

  useEffect(() => {
    if (!profile.nickname) {
      history.push(`${Routes.WatchParty}/${id}`);
      return;
    }

    const mic = appStorage.getItem(WP_MIC) || "any",
      cam = appStorage.getItem(WP_CAM) || "any";

    VlrService.mapVlrPublicId(id)
      .then(({ data }) => {
        const { channelIsActive, status, vlr } = data;
        let errorMessage = "";

        switch (status) {
          case MapVlrResponse.Ok:
            if (channelIsActive) {
              if (vlr.channel.stream_id && !vlr.channel.is_vlr) {
                history.push(`${Routes.Stream}/${vlr.channel.stream_id}/${id}`);
              } else if (vlr.channel.stream_camera) {
                history.push(`${Routes.StreamCamera}/${id}`);
              } else {
                const dispatchData = prepareJoinLivingRoomData({
                  mapPublicIdData: data,
                  mic,
                  cam,
                  nickname: profile.nickname,
                });
                dispatch(setLivingRoom(dispatchData));
                history.push(`${Routes.WatchPartyJoinRoom}`);
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
        history.replace(Routes.Home);
      })
      .catch((err) => {
        const message = VlrService.handleMapIdError(err);
        dispatch(setErrorToast(message));
        history.replace(Routes.Home);
      });
  }, [history, id, dispatch, profile.nickname]);

  return (
    <IonModal isOpen={isOpen} className="searchable-language-modal">
      <IonToolbar>
        <IonTitle>Do you want to pay?</IonTitle>
      </IonToolbar>
      <IonButtons className="home-filter confirm-buttons-group">
        <IonButton onClick={onYesClick}>Yes</IonButton>
        <IonButton onClick={onNoClick}>No</IonButton>
      </IonButtons>
    </IonModal>
  );
};

export default WatchPartyJoinMediator;
