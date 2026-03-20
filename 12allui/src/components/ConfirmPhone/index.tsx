import React from 'react';
// import { useTranslation } from "react-i18next";
import {useSelector} from 'react-redux';

import {IonButton, IonCard, IonCardContent, IonRouterLink} from '@ionic/react';

import {Routes} from '../../shared/routes';
import {ReduxSelectors} from '../../redux/shared/types';
import './style.scss';


const CreateRoom: React.FC = () => {
  // const { t } = useTranslation();
  // const [showConfirmNumberQuestion, setShowConfirmNumberQuestion] = useState<boolean>(false);
  const user = useSelector(({ profile }: ReduxSelectors) => profile);

  return (
    <>
      {user.jwt && !user.hasConfirmedPhoneNumber ? (
        <IonCard>
          <IonCardContent style={{ textAlign: "center" }}>
            <div className="text-white">You haven't confirmed your number yet! Some features depend on that!</div>
            <IonRouterLink
              routerLink={Routes.MyProfile}
              routerDirection="back"
            >
              <IonButton>Confirm now</IonButton>
            </IonRouterLink>
          </IonCardContent>
        </IonCard>
      ) : (
        <></>
      )}

      {/* What is this modal for? */}
      {/* <IonModal
        isOpen={showConfirmNumberQuestion}
        onWillDismiss={() => setShowConfirmNumberQuestion(false)}
        cssClass="confirm-number-question-modal"
      >
        <IonButtons slot="end">
          <IonButton color="primary" onClick={() => setShowEPG(false)}>
            {t("dismiss")}
          </IonButton>
        </IonButtons>
      </IonModal> */}

    </>
  );
}

export default CreateRoom;
