import React, { FC, useEffect, useState } from "react";
import { IonButton, IonImg } from "@ionic/react";
import publicImg from "../../images/icons/public.svg";
import privateImg from "../../images/icons/private.svg";
import { VlrService } from "../../services";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useDispatch } from "react-redux";

type Props = {
  isPrivateInitial: boolean;
  publicId: string;
  onChangeRoomStatus: (value: boolean) => void;
};

const ChangeRoomStatus: FC<Props> = ({
  isPrivateInitial,
  publicId,
  onChangeRoomStatus,
}: Props) => {
  const dispatch = useDispatch();
  const [isPrivate, setIsPrivate] = useState<boolean>(isPrivateInitial);

  useEffect(() => {
    setIsPrivate(isPrivateInitial);
  }, [isPrivateInitial]);

  const handleClick = () => {
    const newStatus = !isPrivate;
    VlrService.patchMetadata({ isPrivate: newStatus, publicId })
      .then(() => {
        dispatch(
          setInfoToast(
            `notifications.${newStatus ? "roomIsPrivate" : "roomIsPublic"}`
          )
        );
        setIsPrivate(newStatus);
        onChangeRoomStatus(newStatus);
      })
      .catch(() =>
        dispatch(setErrorToast("notifications.couldNotChangeRoomStatus"))
      );
  };

  return (
    <IonButton
      onClick={handleClick}
      color="dark"
      className="change-room-status-button"
    >
      <IonImg slot="icon-only" src={isPrivate ? privateImg : publicImg} />
    </IonButton>
  );
};

export default ChangeRoomStatus;
