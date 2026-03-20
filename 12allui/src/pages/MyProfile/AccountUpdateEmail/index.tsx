import React, { FC, useState } from "react";
import "./styles.scss";
import InputWithLabel from "../../../components/InputComponent/PlainInput";
import { useTranslation } from "react-i18next";
import { IonButton, IonImg, IonModal, IonText, useIonViewWillLeave } from "@ionic/react";
import { UserManagementService } from "../../../services";
import { useDispatch } from "react-redux";
import { setErrorToast, setInfoToast } from "../../../redux/actions/toastActions";
import { setLogout } from "../../../redux/actions/profileActions";
import crossIcon from '../../../images/icons/cross.svg';
import { Routes } from "../../../shared/routes";
import { useHistory } from "react-router";

type Props = {
  jwt: string;
  phoneNumber: string | undefined;
  showUpdateEmailPopup: boolean;
  handleCloseUpdateEmailPopup: () => void;
}

const AccountUpdateEmail: FC<Props> = ({ jwt, phoneNumber, showUpdateEmailPopup, handleCloseUpdateEmailPopup }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  const [email, setEmail] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false)

  useIonViewWillLeave(() => {
    handleCloseUpdateEmailPopup()
  }, [])

  const handleEnter = () => {
    if (!email && !jwt) {
      return;
    }

    // rememberMe && appStorage.setObject(StorageKey.Login, { jwt });

    if (jwt && phoneNumber && email) {
      UserManagementService.accountUpdate(email, jwt, phoneNumber)
        .then(({ data, status }) => {
          console.log("data update", data)
          if (data.status === 'ok' && status === 200) {
            setShowMessage(true)
            dispatch(setInfoToast(`The reset password link has been sent to your email address ${email}. Please check your email.`));

            setTimeout(() => {
              handleCloseUpdateEmailPopup()
              dispatch(setLogout())
              history.push(Routes.Login)
              window.location.reload()
            }, 5000);
          }
          // dispatch(setLogin(profileData));
          // history.push(Routes.Home);
        })
        .catch(() => {
          dispatch(setErrorToast('myProfile.notifications.errorSave'))
        });
    }
  }

  return (
    <IonModal
      isOpen={showUpdateEmailPopup}
      onDidDismiss={() => handleCloseUpdateEmailPopup()}
      backdropDismiss={false}
      className="account-update-email-modal"
    >
      <IonImg
        src={crossIcon}
        className="cross-button"
        onClick={() => handleCloseUpdateEmailPopup()}
      />
      <div className="account-update-container">
        <InputWithLabel
          className='input-email-update'
          label={t('login.email')}
          type="text"
          name="email"
          value={email}
          setValue={setEmail}
          placeholder={t('login.emailPlaceholder')}
        />
        {showMessage && <IonText>{`The reset password link has been sent to your email address ${email}. Please check your email.`}</IonText>}

        <IonButton type="submit" onClick={() => handleEnter()} className="enter-button">
          {t('login.enter')}
        </IonButton>
      </div>
    </IonModal>
  )
}

export default AccountUpdateEmail;