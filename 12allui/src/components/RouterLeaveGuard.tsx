import React, {FC, useEffect, useState} from 'react';
import {Prompt, useHistory} from 'react-router-dom';
import {Routes} from '../shared/routes';
import {IonAlert} from '@ionic/react';
import {useTranslation} from 'react-i18next';

interface Props {
  canLeave: boolean;
  defaultDestination: Routes;
  redirectTo?: Routes | null;
  onCanLeave: () => void;
}

const RouterLeaveGuard: FC<Props> = ({canLeave, defaultDestination, redirectTo, onCanLeave}: Props) => {
  const {t} = useTranslation();
  const history = useHistory();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [path, setPath] = useState<string>();

  useEffect(() => {
    if (canLeave) {
      history.replace(path || defaultDestination);
    }
  }, [history, canLeave, defaultDestination, path]);

  useEffect(() => {
    if (redirectTo) {
      setPath(redirectTo);
    }
  }, [redirectTo]);

  const handlePromptMessage = (location: any) => {
    if (!canLeave) {
      setShowAlert(true);
      setPath(location.pathname);
      return false;
    }

    return true;
  };

  return (
    <>
      <Prompt message={handlePromptMessage}/>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        message={t("watchPartyStart.aboutToLeave")}
        buttons={[
          {
            text: `${t("common.decline")}`,
            role: 'cancel'
          },
          {
            text: `${t("common.leave")}`,
            handler: () => {
              onCanLeave();
            }
          }
        ]}
      />
    </>
  );
};

export default RouterLeaveGuard;
