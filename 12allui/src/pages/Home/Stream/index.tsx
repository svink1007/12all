import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { SharedStreamVlrs, Vlr } from "../../../shared/types";
import { IonImg, IonItem, IonRouterLink, IonText } from "@ionic/react";
import logo from "../../../images/12all-logo-128.png";
import sharpStar from "../../../images/icons/star-sharp.svg";
import { Routes } from "../../../shared/routes";
import StreamActions from "../StreamActions";
import {API_URL, SNAPSHOT_URL} from "../../../shared/constants";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { useHistory } from "react-router";
import audioOnly from "../../../images/audio-only.gif";
import {
  setEnableRewardPopup,
  setOpenChannelDirectStream,
} from "../../../redux/actions/billingRewardActions";
import { setCurrentStreamRoute } from "../../../redux/actions/streamActions";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { BillingServices } from "../../../services";
import { StreamService } from "src/services/StreamService";
import VodActions from "src/pages/VoD/VodActions";

type Props = {
  stream: SharedStreamVlrs;
  redirectFrom?: string;
};

const Stream: FC<Props> = ({ stream, redirectFrom }) => {
  const {
    isAnonymous,
    jwt,
    id: userId,
  } = useSelector(({ profile }: ReduxSelectors) => profile);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const history = useHistory();
  const dispatch = useDispatch();

  const [vlrs, setVlrs] = useState<Vlr[]>([]);
  const [snapshotError, setSnapshotError] = useState(false);

  useEffect(() => {
    setVlrs(stream.vlr ? stream.vlr : []);
  }, [stream.vlr]);

  const handleAnonymousStreamRoute = (stream: SharedStreamVlrs) => {
    switch (redirectFrom) {
      case "CHANNELS_ROW":
        dispatch(setCurrentStreamRoute("FROM_CHANNEL"));
        break;

      case "GENRE":
        dispatch(setCurrentStreamRoute("FROM_GENRE"));
        break;

      case "HOME":
        dispatch(setCurrentStreamRoute("FROM_HOME"));
        break;

      default:
        break;
    }

    // billing:
    if ((isAnonymous || !jwt) && parseInt(stream.starsAmount) > 0) {
      BillingServices.isRoomPaid(userId, stream.id.toString())
      .then(
        (result) => {
          try {
            if (!result.data.result?.paid) {
              dispatch(
                setEnableRewardPopup({
                  openPaidStreamAnon: true,
                })
              );
            }
          } catch (error) {
            console.error("Error checking room payment status:", error);
          }
          
        }
      );
      return;
    }

    if (stream.starsAmount && parseInt(stream.starsAmount)>0 && jwt && !isAnonymous) {
      BillingServices.isRoomPaid(userId, stream.id.toString()).then(
        (result) => {
          try {
            if (!result.data.result?.paid) {
              dispatch(
                setOpenChannelDirectStream({
                  enablePopup: { openChannelDirectStream: true },
                  channelCostDescription: {
                    channelCost: stream.starsAmount,
                    streamId: stream.id,
                  },
                })
              );
            }else if(stream.vod_owner){
              history.push(`${Routes.VodChannel}/${stream.id}/vod`);
            }else {
              return history.push(`${Routes.Stream}/${stream.id}`);
            }
          } catch (error) {
            console.error("Error checking room payment status:", error);
          }
          
        }
      );
    } else if(stream.vod_owner){
      history.push(`${Routes.VodChannel}/${stream.id}/vod`);
    }else {
      return history.push(`${Routes.Stream}/${stream.id}`);
    }

    // }
  };

  return (
    <IonItem button className="shared-stream-item" lines="none" detail={false}>
      <IonRouterLink
        className="shared-stream-wrapper"
        // routerLink={`${Routes.Stream}/${stream.id}`}
        onClick={() => {
          if (userId === 0 || isAnonymous) {
            handleAnonymousStreamRoute(stream);
          } else if (!profile.nickname && !profile.phoneNumber) {
            dispatch(setErrorToast("Nickname or Phone Number is required"));
          } else if (!profile.nickname && (profile.phoneNumber && !profile.hasConfirmedPhoneNumber)) {
            dispatch(setErrorToast("Phone Number must be confirmed"));
          } else if (
            profile.nickname ||(
            profile.phoneNumber &&
            profile.hasConfirmedPhoneNumber)
          ) {
            handleAnonymousStreamRoute(stream);
          }
        }}
      >
        {vlrs.length > 0 ? (
          <div
            className={`stream-preview-holder stream-previews-${vlrs.length}`}
          >
            {vlrs.map((vlr) => (
              <IonImg
                key={vlr.id}
                src={vlr.channel.https_preview_high as string}
                onIonError={() => setVlrs(vlrs.filter((v) => v.id !== vlr.id))}
                alt=""
              />
            ))}
          </div>
        ) : stream.audioOnly ? (
          <IonImg
            src={audioOnly}
            alt="audio only"
            className="stream-snapshot"
          />
        ) : stream.id ? (
          <IonImg
            src={snapshotError ? logo : `${SNAPSHOT_URL}/${stream.id}.jpg`}
            alt={""}
            className="stream-snapshot"
            onIonError={() => setSnapshotError(true)}
          />
        ) : null}

        {!stream?.audioOnly && (
          <IonImg
            src={
              stream.logo_image
                ? `${API_URL}${
                    stream.logo_image.formats?.thumbnail?.url ||
                    stream.logo_image.url
                  }`
                : stream.logo || logo
            }
            alt=""
            className="stream-logo"
          />
        )}
        <div className="shared-stream-name-container">
          {parseInt(stream.starsAmount) > 0 && <img src={sharpStar} />}
          <IonText className="shared-stream-name" color="dark">
            {stream.name}
          </IonText>
          {parseInt(stream.starsAmount) > 0 && <img src={sharpStar} />}
        </div>
      </IonRouterLink>
      <StreamActions stream={stream} />
    </IonItem>
  );
};

export default Stream;
