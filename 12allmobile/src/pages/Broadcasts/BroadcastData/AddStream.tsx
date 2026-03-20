import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { IonIcon, IonItem, IonText } from "@ionic/react";
import { add } from "ionicons/icons";
import SaveStream from "./SaveStream";

const AddStream: FC = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      <div className="channel-wrapper">
        <IonItem
          button
          lines="none"
          className="add-stream-item"
          color="light"
          detail={false}
          onClick={() => setOpenModal(true)}
        >
          <div className="item-inner">
            <IonIcon icon={add} />
            <IonText>{t("sharedStream.addStream")}</IonText>
          </div>
        </IonItem>
      </div>
      <SaveStream show={openModal} onDismiss={() => setOpenModal(false)} />
    </>
  );
};

export default AddStream;
