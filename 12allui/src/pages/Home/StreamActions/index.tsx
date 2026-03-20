import React, { useState } from "react";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { EpgEntry, SharedStream } from "../../../shared/types";
import {
  heart,
  heartOutline,
  informationCircleOutline,
  readerOutline,
  shareSocialOutline,
} from "ionicons/icons";
import Invite from "../../../components/Invite";
import BroadcastInfo from "../BroadcastInfo";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { UserManagementService } from "../../../services";
import { StreamService } from "../../../services/StreamService";
import StreamSchedule from "../StreamSchedule";
import {
  addFavoriteStream,
  removeFavoriteStream,
  toggleStreamFavorite,
} from "../../../redux/actions/streamActions";
import {
  setEnableRewardPopup,
  setFirstFavoriteReward,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { BillingServices } from "../../../services";
import { updateStarsBalance } from "../../../shared/helpers";

type Props = {
  stream: SharedStream;
};

const StreamActions: React.FC<Props> = ({ stream }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { jwt, isAnonymous, id, email } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [openChannelInfo, setOpenChannelInfo] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [openSchedule, setOpenSchedule] = useState<boolean>(false);
  const [loadingEpgEntries, setLoadingEpgEntries] = useState<boolean>(false);
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);

  const handleShare = (stream: SharedStream) => {
    setInviteUrl(`${window.location.origin}/stream/${stream.id}`);
    setShowInviteModal(true);
  };

  const onInviteClose = () => {
    setShowInviteModal(false);
  };

  const handleChannelInfo = () => {
    setOpenChannelInfo(true);
  };

  const handleFavoriteClick = () => {
    const updateStream = () => {
      stream.is_favorite = !stream.is_favorite;
      dispatch(toggleStreamFavorite(stream));
      dispatch(
        stream.is_favorite
          ? addFavoriteStream(stream)
          : removeFavoriteStream(stream)
      );
      return stream
    };

    console.log("Is Favourite", stream.is_favorite)

    if (stream.is_favorite) {
      UserManagementService.removeFavoriteStream(stream.id)
        .then(updateStream)
        .catch((err) => console.error(err));
    } else {
      UserManagementService.addFavoriteStream(stream.id)
        .then(updateStream)
        .then((response) => {
          // console.log("response fav",response)
          const favStreamEvent = "entry.favorite_stream";
          // if (!stream.is_favorite) {
          //
          // }
          BillingServices.billingFavorite(id, favStreamEvent).then(
              async ({ data: { result } }) => {
                console.log("response", result);
                if (
                    result.billingReward.creditedStars &&
                    result.billingReward.creditedStars > 0
                ) {
                  const starsBalance = await updateStarsBalance(id);
                  dispatch(setTotalStarBalance(starsBalance));
                  dispatch(setFirstFavoriteReward(result));
                  dispatch(setEnableRewardPopup({ firstFavoriteAward: true }));
                }
              }
          );
        })
        .catch((err) => console.error(err));
    }
  };

  const handleScheduleClick = () => {
    if (stream.epg_channel) {
      setLoadingEpgEntries(true);
      setOpenSchedule(true);

      StreamService.getEpgEntries(stream.epg_channel.id)
        .then(({ data }) => setEpgEntries(data))
        .finally(() => setLoadingEpgEntries(false));
    }
  };

  return (
    <>
      <IonButtons className="stream-actions-buttons">
        {stream.epg_channel && (
          <IonButton onClick={handleScheduleClick}>
            <IonIcon
              slot="icon-only"
              icon={readerOutline}
              color={openSchedule ? "success" : "dark"}
            />
          </IonButton>
        )}

        <IonButton onClick={handleChannelInfo}>
          <IonIcon
            slot="icon-only"
            icon={informationCircleOutline}
            color={openChannelInfo ? "success" : "dark"}
          />
        </IonButton>

        <IonButton onClick={() => handleShare(stream)}>
          <IonIcon
            slot="icon-only"
            icon={shareSocialOutline}
            color={showInviteModal ? "success" : "dark"}
          />
        </IonButton>

        {(jwt &&
            !isAnonymous &&
            ((!!email && !email.includes("@skiplogin.com")) || email === null)) && (
          <IonButton onClick={handleFavoriteClick}>
            <IonIcon
              slot="icon-only"
              icon={stream.is_favorite ? heart : heartOutline}
              color="primary"
            />
          </IonButton>
        )}
      </IonButtons>

      <Invite
        title={t("home.share")}
        show={showInviteModal}
        onClose={() => onInviteClose()}
        url={inviteUrl}
      />

      <BroadcastInfo
        show={openChannelInfo}
        name={stream.name}
        language={stream.language}
        genre={stream.genre}
        country={stream.country}
        starsAmount={stream.starsAmount}
        onClose={() => setOpenChannelInfo(false)}
      />

      {stream.epg_channel && (
        <StreamSchedule
          show={openSchedule}
          onClose={() => setOpenSchedule(false)}
          streamName={stream.name}
          epgEntries={epgEntries}
          loading={loadingEpgEntries}
        />
      )}
    </>
  );
};

export default StreamActions;
