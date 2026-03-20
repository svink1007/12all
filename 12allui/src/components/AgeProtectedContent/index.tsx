import React, {FC, SyntheticEvent, useEffect, useState} from 'react';
import {IonButton, IonContent, IonModal} from '@ionic/react';
import axios from 'axios';
import appStorage from '../../shared/appStorage';
import {API_URL} from '../../shared/constants';
import './style.scss';

const AgeBasedProtectedContent: FC<any> = ( { children, active }: { children: React.ReactNode, active: boolean} ) => {
  const [user, setUser] = useState<string>("");
  const [passedProtectionCriteria, setPassedProtectionCriteria] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const showConformationModal = async () => {
    setShowModal(true);
    setUser(appStorage.getItem("login") || "");
  }

  useEffect(() => {
    if (active) {
      setPassedProtectionCriteria(false);
      (() => {
        const existingUser = appStorage.getItem("login");
          if (!!existingUser && JSON.parse(existingUser).has_confirmed_is_over_eighteen) {
            setPassedProtectionCriteria(true);
            setShowModal(false);
          } else {
            showConformationModal();
          }
      })();
    } else {
      setPassedProtectionCriteria(true);
    }
  }, [active]);

  const handleUserConfirmation = (e: SyntheticEvent) => {
    e.preventDefault();

    if (user) {
      axios(`${API_URL}/user-management`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(user).jwt}`,
        },
        data: {
          IsOverEighteen: true
        }
      });

      appStorage.setItem("login", JSON.stringify({...JSON.parse(user), isOverEighteen: true}));
    } else {
      appStorage.setItem("login", JSON.stringify({isOverEighteen: true}));
    }
    setShowModal(false);
    setPassedProtectionCriteria(true);
  }

  const renderConfirmationModal = (
    <IonContent>
      <IonModal isOpen={showModal} backdropDismiss={false} className="confirm-modal">
        <p>Age restricted content! This channel contains adult content. To continue please confirm you are over eighteen!!</p>
        <div className="confirm-modal-buttons">
        <IonButton routerLink={"/home"} className="modal-button" onClick={() => setShowModal(false)}>
            Exit to home
        </IonButton>
        <IonButton onClick={handleUserConfirmation} className="modal-button-confirm">
            I am over 18 or older!
        </IonButton>
        </div>
      </IonModal>
      { passedProtectionCriteria ? children : <h3>Must be over 18 to watch this channel</h3> }
    </IonContent>
  );

  return (!active && passedProtectionCriteria) ?  <>{children}</> : <>{renderConfirmationModal}</>;
}

export default AgeBasedProtectedContent;
