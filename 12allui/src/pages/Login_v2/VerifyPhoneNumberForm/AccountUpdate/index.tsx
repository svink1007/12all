import React, { FC, useState } from "react";
import "./styles.scss";
import InputWithLabel from "../../../../components/InputComponent/PlainInput";
import { useTranslation } from "react-i18next";
import { IonButton, IonText, useIonViewWillLeave } from "@ionic/react";
import { UserManagementService } from "../../../../services";
import { useDispatch } from "react-redux";
import { setErrorToast } from "../../../../redux/actions/toastActions";
import { setLogout } from "../../../../redux/actions/profileActions";

type Props = {
  jwt: string;
  phoneNumber: string;
  setIsShowAccountUpdate: (value: boolean) => void;
  setShowStep2: (value: boolean) => void;
}

const AccountUpdate: FC<Props> = ({ jwt, phoneNumber, setIsShowAccountUpdate, setShowStep2 }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false)

  useIonViewWillLeave(() => {
    setIsShowAccountUpdate(false)
    setShowStep2(false)
  }, [])

  const handleEnter = () => {
    if (!email && !jwt) {
      return;
    }

    // rememberMe && appStorage.setObject(StorageKey.Login, { jwt });

    if(jwt) {
      UserManagementService.accountUpdate(email, jwt, phoneNumber)
        .then(({ data, status }) => {
          console.log("data update", data)
          if (data.status === 'ok' && status === 200) {
            setShowMessage(true)
            dispatch(setLogout())
  
            setTimeout(() => {
              window.location.reload()
              // setShowStep2(false)
              // setIsShowAccountUpdate(false)
            }, 3000);
          }
          // dispatch(setLogin(profileData));
          // dispatch(setInfoToast(t('myProfile.notifications.successSave')));
          // history.push(Routes.Home);
        })
        .catch(() => {
          dispatch(setErrorToast('myProfile.notifications.errorSave'))
        });
    }
  }

  // const handleEnter = (email: string) => {
  //   AuthService.forgotPassword(email)
  //     .then(() => dispatch(setInfoToast('login.pleaseCheckYourEmail')))
  //     .catch((error: any) => {
  //       let toastError = 'unexpectedError';

  //       if (error.response.data?.data?.length && error.response.data.data[0].messages.length) {
  //         switch (error.response.data.data[0].messages[0].id) {
  //           case 'Auth.form.error.user.not-exist':
  //             toastError = 'emailDoesNotExist';
  //             break;
  //           case 'Auth.form.error.email.format':
  //             toastError = 'emailFormatIsNotCorrect';
  //             break;
  //         }
  //       }

  //       dispatch(setErrorToast(`login.${toastError}`));
  //     });
  // };

  return (
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
      {/* <InputWithLabel
        className='input-password-update'
        label={t('login.password')}
        type="text"
        name="email"
        value={password}
        setValue={setPassword}
        placeholder={t('login.passwordPlaceholder')}
      /> */}

      <IonButton type="submit" onClick={() => handleEnter()} className="enter-button">
        {t('login.enter')}
      </IonButton>
    </div>
  )
}

export default AccountUpdate;