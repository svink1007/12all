import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonAlert, IonButton, IonIcon } from "@ionic/react";
import { VertoLayout } from "../../verto/types";
import { gridOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import appStorage from "../../shared/appStorage";
import { useSelector } from "react-redux";
import { RoomLayoutService } from "../../services";
import { RoomLayout } from "../../shared/types";
import { ReduxSelectors } from "../../redux/types";
import VertoSession from "../../verto/VertoSession";

export const ROOM_LAYOUT = "roomLayout";

type Props = {
  vertoSession: VertoSession;
};

const RoomChangeLayout: FC<Props> = ({ vertoSession }: Props) => {
  const { t } = useTranslation();
  const roomLayout = useSelector(
    ({ roomLayout }: ReduxSelectors) => roomLayout
  );
  const [layouts, setLayouts] = useState<RoomLayout[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    RoomLayoutService.getLayouts().then(({ data }) => setLayouts(data));
  }, []);

  const handleLayoutChange = (layout: VertoLayout) => {
    setShowAlert(false);
    vertoSession.changeLayout(layout);
    appStorage.setItem(ROOM_LAYOUT, layout).then();
  };

  return (
    <>
      <IonButton
        onClick={() => {
          setShowAlert(true);
        }}
        color="dark"
      >
        <IonIcon slot="icon-only" icon={gridOutline} />
      </IonButton>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={t("vertoLayout.changeRoomLayout")}
        inputs={layouts.map(({ layout, name, key }) => ({
          name: layout,
          type: "radio",
          label: key ? t(`vertoLayout.${key}`) : name,
          value: layout,
          handler: () => handleLayoutChange(layout),
          checked: roomLayout === layout,
        }))}
        cssClass="alert-room-layout"
      />
    </>
  );
};

export default RoomChangeLayout;
