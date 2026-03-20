import React, { FC } from "react";
import "./styles.scss";
import { IonItem, IonLabel, IonList } from "@ionic/react";
import { useTranslation } from "react-i18next";

type Props = {
  setItemAsActive: (value: string) => void;
  activeNav: string
}

const LeftNavMenu: FC<Props> = ({setItemAsActive, activeNav}) => {
  const { t } = useTranslation()
  const menuItems = [
    "menu1",
    // "menu2", 
    // "menu3", 
    "menu4", 
    "menu5", 
    // "menu6"
  ];

  return (
    <div className="left-nav-menu-container">
      <IonList className="nav-list">
        {menuItems.map((menu, index) => {
          return (
            <IonItem
              key={index}
              className={`nav-item ${activeNav === `active-nav-${menu}` ? "active-nav" : ""}`}
              onClick={() => setItemAsActive(menu)}>
              <IonLabel>{t(`billing.accountStatus.leftNavMenu.${menu}`)}</IonLabel>
            </IonItem>
          )

        })}
      </IonList>
    </div>
  )
}

export default LeftNavMenu

