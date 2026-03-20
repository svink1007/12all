import React, { FC } from "react";
import { IonAlert } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { StreamService } from "../../../services";
import { useDispatch } from "react-redux";
import {
  setErrorToast,
  setInfoToast,
} from "../../../redux/actions/toastActions";
import { removeStream } from "../../../redux/actions/broadcastActions";

type Props = {
  streamId: number;
  streamName: string;
  open: boolean;
  onDismiss: () => void;
};

const DeleteStream: FC<Props> = ({
  streamId,
  streamName,
  open,
  onDismiss,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDeleteStreamConfirmed = () => {
    onDismiss();
    StreamService.deleteStream(streamId)
      .then(() => {
        dispatch(setInfoToast("manageStream.deleted"));
        dispatch(removeStream(streamId));
      })
      .catch(() => {
        dispatch(setErrorToast("manageStream.generalError"));
      });
  };

  return (
    <IonAlert
      isOpen={open}
      onDidDismiss={onDismiss}
      header={`${t("manageStream.delete")} ${streamName}`}
      message={`${t("manageStream.deleteStreamConfirmation")} "${streamName}"?`}
      buttons={[
        {
          text: t("common.cancel"),
          role: "cancel",
        },
        {
          text: t("common.yes"),
          handler: handleDeleteStreamConfirmed,
        },
      ]}
    />
  );
};

export default DeleteStream;
