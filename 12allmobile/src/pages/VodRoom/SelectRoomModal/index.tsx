import React, { FC, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { Vlr } from "../../../shared/types";
import { JoinStreamVlr } from "../index";

interface Props {
  open: boolean;
  vlrs: Vlr[];
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: JoinStreamVlr) => void;
  onCancel: () => void;
}

const SelectRoomModal: FC<Props> = ({
  open,
  vlrs,
  onStartNewRoom,
  onJoinRoom,
  onCancel,
}: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number>(0);

  const handleJoinVlr = () => {
    const vlr = vlrs[selected];
    onJoinRoom(new JoinStreamVlr(vlr));
  };

  return (
    <IonModal
      isOpen={open}
      className="select-room-stream-modal"
      backdropDismiss={false}
    >
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{t("sharedStream.joinOrStartRoom")}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonRadioGroup
            value={selected}
            onIonChange={(e) => setSelected(e.detail.value)}
          >
            {vlrs.map(({ id, public_id, active_connections_count }, index) => (
              <IonItem key={id}>
                <IonRadio value={index} slot="start" />
                <IonLabel>
                  {t("sharedStream.room")} {public_id} (
                  {t("sharedStream.viewers")}: {active_connections_count})
                </IonLabel>
              </IonItem>
            ))}

            <IonItem>
              <IonRadio value={-1} slot="start" />
              <IonLabel>{t("sharedStream.startNewRoom")}</IonLabel>
            </IonItem>
          </IonRadioGroup>
        </IonCardContent>

        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={onCancel} color="primary">
              {t("sharedStream.cancel")}
            </IonButton>
            <IonButton
              onClick={() =>
                selected === -1 ? onStartNewRoom() : handleJoinVlr()
              }
              color="primary"
            >
              {t("sharedStream.ok")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonCard>
    </IonModal>
  );
};

export default SelectRoomModal;
