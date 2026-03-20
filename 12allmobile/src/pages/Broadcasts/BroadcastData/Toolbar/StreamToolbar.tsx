import React, { FC, useState } from "react";
import "./styles.scss";
import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  closeCircleOutline,
  create,
  ellipsisVertical,
  heart,
  informationCircleOutline,
  readerOutline,
  shareSocialOutline,
  trashOutline,
} from "ionicons/icons";
import BroadcastInfo from "./BroadcastInfo";
import Invite from "../../../../components/Invite";
import { EpgEntry, SharedStreamVlrs } from "../../../../shared/types";
import { StreamService, UserManagementService } from "../../../../services";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../../redux/types";
import { useHistory } from "react-router-dom";
import { Routes } from "../../../../shared/routes";
import { useTranslation } from "react-i18next";
import SaveStream from "../SaveStream";
import DeleteStream from "../DeleteStream";
import { setErrorToast } from "../../../../redux/actions/toastActions";
import { updateFavoriteStreams } from "../../../../redux/actions/broadcastActions";
import StreamSchedule from "../../../../components/StreamSchedule";

interface Props {
  stream: SharedStreamVlrs;
  shareLink: string;
}

const StreamToolbar: FC<Props> = ({ stream, shareLink }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const { favoriteStreams } = useSelector(
    ({ broadcast }: ReduxSelectors) => broadcast
  );
  const [openChannelInfo, setOpenChannelInfo] = useState<boolean>(false);
  const [openChannelShare, setOpenChannelShare] = useState<boolean>(false);
  const [showSaveStream, setShowSaveStream] = useState<boolean>(false);
  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
  const [showDeleteStreamAlert, setShowDeleteStreamAlert] =
    useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [openSchedule, setOpenSchedule] = useState<boolean>(false);
  const [loadingEpgEntries, setLoadingEpgEntries] = useState<boolean>(false);
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      history.push(Routes.Login);
      return;
    }

    setSaving(true);

    if (stream.is_favorite) {
      UserManagementService.removeFavoriteStream(stream.id)
        .then(() => {
          stream.is_favorite = false;
          dispatch(
            updateFavoriteStreams(
              favoriteStreams.filter((fs) => fs.id !== stream.id)
            )
          );
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotRemoveFavorite"))
        )
        .finally(() => setSaving(false));
    } else {
      UserManagementService.addFavoriteStream(stream.id)
        .then(() => {
          stream.is_favorite = true;
          dispatch(updateFavoriteStreams([...favoriteStreams, stream]));
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotAddFavorite"))
        )
        .finally(() => setSaving(false));
    }
  };

  const handleScheduleClick = () => {
    if (stream?.epg_channel) {
      setLoadingEpgEntries(true);
      setOpenSchedule(true);

      StreamService.getEpgEntries(stream.epg_channel?.id)
        .then(({ data }) => setEpgEntries(data))
        .catch((err) => {
          console.error("Error fetching EPG entries:", err);
          dispatch(setErrorToast("Error occur while fetching the EPG data"));
        })
        .finally(() => setLoadingEpgEntries(false));
    }
  };

  return (
    <>
      <div className="broadcast-toolbar">
        <IonButtons>
          {stream?.epg_channel && (
            <IonButton onClick={handleScheduleClick} color="dark">
              <IonIcon icon={readerOutline} slot="icon-only" />
            </IonButton>
          )}
          <IonButton
            onClick={() => setOpenChannelInfo(true)}
            color={stream.is_approved === false ? "warning" : "dark"}
          >
            <IonIcon icon={informationCircleOutline} slot="icon-only" />
          </IonButton>
          <IonButton onClick={() => setOpenChannelShare(true)} color="dark">
            <IonIcon icon={shareSocialOutline} slot="icon-only" />
          </IonButton>
          <IonButton onClick={handleFavoriteClick}>
            {saving ? (
              <IonSpinner color="primary" />
            ) : (
              <IonIcon
                icon={heart}
                slot="icon-only"
                color={stream.is_favorite ? "primary" : "dark"}
              />
            )}
          </IonButton>
          {stream.is_owner && (
            <IonButton onClick={() => setShowActionSheet(true)} color="dark">
              <IonIcon icon={ellipsisVertical} slot="icon-only" />
            </IonButton>
          )}
        </IonButtons>
      </div>

      <BroadcastInfo
        show={openChannelInfo}
        name={stream.name}
        language={stream.language}
        genre={stream.genre}
        country={stream.country}
        approved={stream.is_approved}
        onClose={() => setOpenChannelInfo(false)}
      />

      <Invite
        show={openChannelShare}
        url={shareLink}
        onClose={() => setOpenChannelShare(false)}
      />

      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header={stream.name}
        cssClass="manage-stream-action-sheet"
        buttons={[
          {
            text: `${t("sharedStream.edit")}`,
            icon: create,
            cssClass: "edit",
            handler: () => {
              setShowSaveStream(true);
            },
          },
          {
            text: `${t("sharedStream.delete")}`,
            icon: trashOutline,
            cssClass: "delete",
            handler: () => {
              setShowDeleteStreamAlert(true);
            },
          },
          {
            text: `${t("common.cancel")}`,
            icon: closeCircleOutline,
            role: "cancel",
            cssClass: "cancel",
          },
        ]}
      ></IonActionSheet>

      <SaveStream
        show={showSaveStream}
        stream={stream}
        onDismiss={() => setShowSaveStream(false)}
      />

      <DeleteStream
        streamId={stream.id}
        streamName={stream.name}
        open={showDeleteStreamAlert}
        onDismiss={() => setShowDeleteStreamAlert(false)}
      />

      {stream?.epg_channel && (
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

export default StreamToolbar;
