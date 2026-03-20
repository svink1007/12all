import React from 'react';
import { useTranslation } from "react-i18next";

import {
  IonCard,
  IonCardContent,
  IonRouterLink,
  IonButton
} from '@ionic/react';

import { Routes } from '../../shared/routes';


const CreateRoom: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* RESPONSIVE */}
      {/* <IonCol sizeMd="12">
            <IonCard color="secondary">
              <IonCardContent>
                <IonRouterLink
                  routerLink={Routes.WatchParty}
                  routerDirection="back"
                >
                  <IonImg src={party} />
                </IonRouterLink>
              </IonCardContent>
            </IonCard>
          </IonCol> */}
      <IonCard>
        <IonCardContent>
          <IonRouterLink routerLink={Routes.WatchPartyStart1} routerDirection="back">
            {/* <IonImg src={wpVertical} className="watch-to-win" /> */}
            <IonButton expand="block">{t('livingRoom.createRoom')}</IonButton>
          </IonRouterLink>

          <div style={{ textAlign: 'center' }}><i>{t('livingRoom.createRoomInfo')}</i></div>
        </IonCardContent>
      </IonCard>
    </>
  );
}

export default CreateRoom;
