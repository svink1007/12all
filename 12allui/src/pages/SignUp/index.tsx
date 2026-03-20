import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  useIonViewWillLeave,
} from "@ionic/react";
import "./styles.scss";
import { RouteComponentProps } from "react-router";
import SingUpForm from "./SingUpForm";
// import ConfirmPhoneNumberForm from './ConfirmPhoneNumberForm';
import { SkipLogin, UserManagementService } from "../../services";
import { setErrorToast } from "../../redux/actions/toastActions";
import { Routes } from "../../shared/routes";
import { useDispatch } from "react-redux";
import ConfirmPhoneNumberFormNew from "./ConfirmPhoneNumberFormNew";
import LocationState from "../../models/LocationState";
import leftArrowIcon from "../../images/icons/leftArrow.svg";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../../shared/types";
import { Profile } from "../../redux/shared/types";
import { setLogin } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";

const EMAIL_INITIAL = {
  value: null,
  valid: false,
  touched: false,
};

type Email = {
  value?: string | null;
  valid: boolean;
  touched: boolean;
};

const Signup: React.FC<RouteComponentProps> = ({ history, location }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const { state }: any = location;

  const emailRef = useRef<HTMLIonInputElement>(null);
  const nicknameRef = useRef<HTMLIonInputElement>(null);

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [email, setEmail] = useState<Email>(EMAIL_INITIAL);
  const [password, setPassword] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isOverEighteen, setIsOverEighteen] = useState<boolean>(false);
  const [showStep2, setShowStep2] = useState<boolean>(false);
  // const [isLoginButtonDisabled, setIsLoginDisabled] = useState<boolean>(true);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [receiveOtpType, setReceiveOtpType] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);

  useIonViewWillLeave(() => {
    setShowStep2(false);
  }, []);

  // const sendConfirmationCode = (phoneNumber: string, recaptchaToken: string) => {
  //   UserManagementService.sendConfirmationCode(phoneNumber, recaptchaToken)
  //     .then(({data}) => {
  //       if (data.status === 'nok_ip_sent_too_many_requests') {
  //         dispatch(setErrorToast('phoneNumberValidation.confirmationCodeCanNotBeRequested'));
  //         history.push(Routes.Home);
  //       } else if (data.status === 'nok_phone_number_invalid') {
  //         dispatch(setErrorToast('phoneNumberValidation.invalidNumber'));
  //       }
  //     })
  //     .catch(() => dispatch(setErrorToast('signup.unknownErrorOnConfirmPhoneNumber')));
  // };

  const saveProfile = ({ data }: AxiosResponse<LoginResponse>) => {
    const loginData: Profile = {
      jwt: data.jwt,
      id: data.user.id,
      email: data.user.email,
      nickname: data.user.nickname,
      firstName: data.user.first_name,
      lastName: data.user.last_name,
      phoneNumber: data.user.phone_number,
      preferredLanguage: data.user.preferred_language,
      preferredGenre: data.user.preferred_genre,
      isOverEighteen: data.user.has_confirmed_is_over_eighteen,
      hasConfirmedPhoneNumber: data.user.has_confirmed_phone_number,
      showDebugInfo: data.user.show_debug_info || false,
      isAnonymous: data.user.isAnonymous || false,
      avatar: data.user.avatar,
    };

    dispatch(setLogin(loginData));
    // setLoading(false)
    appStorage.setObject(StorageKey.Login, { jwt: data.jwt });
    const state = location.state as LocationState | undefined;

    if (state?.redirectTo) {
      history.replace(state.redirectTo);
    } else {
      history.replace(Routes.Home);
    }
  };

  const sendConfirmationCode = (
    phoneNumber: string,
    recaptchaToken: string
  ) => {
    UserManagementService.sendConfirmationCode(phoneNumber, recaptchaToken)
      .then(({ data }) => {
        if (data.status === "ok") {
          setShowStep2(true);
        }
        if (data.status === "nok_ip_sent_too_many_requests") {
          dispatch(
            setErrorToast(
              "phoneNumberValidation.confirmationCodeCanNotBeRequested"
            )
          );
          history.push(Routes.Home);
        } else if (data.status === "nok_phone_number_invalid") {
          dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
        }
      })
      .catch(() => {
        dispatch(setErrorToast("signup.unknownErrorOnConfirmPhoneNumber"));
        // setLoading(false)
        // setIsLoginDisabled(true)
      });
  };

  const sendConfirmationCodeViaCall = (
    phoneNumber: string,
    recaptchaToken: string
  ) => {
    UserManagementService.sendConfirmationCodeViaCall(
      phoneNumber,
      recaptchaToken
    )
      .then(({ data }) => {
        console.log("send confirm code via call", data);
        if (data.status === "ok") {
          setShowStep2(true);
        }
        if (data.status === "nok_ip_sent_too_many_requests") {
          dispatch(
            setErrorToast(
              "phoneNumberValidation.confirmationCodeCanNotBeRequested"
            )
          );
          history.push(Routes.Home);
        } else if (data.status === "nok_phone_number_invalid") {
          dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
        }
      })
      .catch(() => {
        dispatch(setErrorToast("signup.unknownErrorOnConfirmPhoneNumber"));
        // setLoading(false)
        // setIsLoginDisabled(true)
      });
  };

  const handleLocationState = () => {
    const state = location.state as LocationState | undefined;
    setShowStep2(false);
    if (state?.redirectTo) {
      history.replace(state.redirectTo);
    } else {
      history.replace(Routes.Home);
    }
  };

  const handleSkip = () => {
    if (state?.from === "anonymousCreateRoom") {
      return history.push(Routes.Home);
    } else if (state?.from === "anonymousStream") {
      return history.push(`${Routes.Stream}/${state?.streamId}`);
    }
    SkipLogin.getLogin()
      .then(saveProfile)
      .catch(() => {
        dispatch(setErrorToast("login.invalid"));
      });
  };

  return (
    <Layout className="center md">
      <IonCard color="secondary" className="signup-card">
        <IonCardHeader className="signup-otp-back-button">
          {showStep2 && (
            <IonIcon
              src={leftArrowIcon}
              className="back-button"
              onClick={() => {
                window.location.reload();
              }}
            />
          )}
          <IonCardTitle>
            {t(!showStep2 ? "signup.header" : "signup.headerStep2")}
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          {!showStep2 ? (
            <SingUpForm
              recaptchaToken={recaptchaToken}
              setRecaptchaToken={setRecaptchaToken}
              setIsRecaptchaVerified={setIsRecaptchaVerified}
              isRecaptchaVerified={isRecaptchaVerified}
              emailRef={emailRef}
              nicknameRef={nicknameRef}
              email={email}
              nickname={nickname}
              phoneNumber={phoneNumber}
              password={password}
              username={username}
              setEmail={setEmail}
              setNickname={setNickname}
              setUsername={setUsername}
              setPassword={setPassword}
              setPhoneNumber={setPhoneNumber}
              setIsOverEighteen={setIsOverEighteen}
              isOverEighteen={isOverEighteen}
              receiveOtpType={"SMS"}
              onShowStep2={() => setShowStep2(true)}
              onSendConfirmationCode={sendConfirmationCode}
              sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
              handleSkip={handleSkip}
              state={state}
            />
          ) : (
            // email.valid ?
            //   <ConfirmPhoneNumberForm
            //     onResendConfirmationCode={sendConfirmationCode}
            //     recaptchaToken={recaptchaToken}
            //     setRecaptchaToken={setRecaptchaToken}
            //     setIsRecaptchaVerified={setIsRecaptchaVerified}
            //     isRecaptchaVerified={isRecaptchaVerified}
            //   /> :
            <ConfirmPhoneNumberFormNew
              combinedPhoneNumber={phoneNumber}
              recaptchaToken={recaptchaToken}
              openModal={openModal}
              email={email}
              nickname={nickname}
              username={username}
              password={password}
              isOverEighteen={isOverEighteen}
              onResendConfirmationCode={sendConfirmationCode}
              sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
              handleLocationState={handleLocationState}
              setRecaptchaToken={setRecaptchaToken}
              setShowStep2={setShowStep2}
              setIsRecaptchaVerified={setIsRecaptchaVerified}
              setOpenModal={setOpenModal}
            />
          )}
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default Signup;
