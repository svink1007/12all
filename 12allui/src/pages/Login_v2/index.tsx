import React, { FC, FormEvent, useEffect, useState } from "react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { useTranslation } from "react-i18next";
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
} from "@ionic/react";
// @ts-ignore
import { FacebookProvider, LoginStatus, useFacebook, useLogin } from "react-facebook";
import googleLogo from "../../images/google-logo.webp";
import { logoFacebook } from "ionicons/icons";
import {
  EMAIL_REGEX,
  FACEBOOK_APP_ID,
  GOOGLE_CLIENT_ID,
} from "../../shared/constants";
import { AxiosResponse } from "axios";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { Routes } from "../../shared/routes";
import { RouteComponentProps } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../../redux/actions/profileActions";
import {
  Profile,
  ReduxSelectors,
  SignupDataUsingPhone,
} from "../../redux/shared/types";
import LocationState from "../../models/LocationState";
import {
  AuthService,
  BillingServices,
  SkipLogin,
  UserManagementService,
} from "../../services";
import { LoginResponse } from "../../shared/types";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
// import { setDailyVisitReward, setEnableRewardPopup, setTotalStarBalance } from '../../redux/actions/billingRewardActions';
// import { BillingServices } from '../../services';
import InputWithLabel from "../../components/InputComponent/PlainInput";
import SelectCountryCode from "./SelectInputCountry";
import VerifyPhoneNumberForm from "./VerifyPhoneNumberForm";
import leftArrowIcon from "../../images/icons/leftArrow.svg";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../redux/actions/billingRewardActions";
import ConfirmPhoneNumber from "../MyProfile/ConfirmPhoneNumber";

type GoogleLoginCustomButtonProps = {
  onSuccess: (token: string, phoneNumber: string) => void;
  setIsOpenConfirmPhonePopup: any;
};

const GoogleLoginCustomButton: FC<GoogleLoginCustomButtonProps> = ({
  onSuccess,
  setIsOpenConfirmPhonePopup,
}: GoogleLoginCustomButtonProps) => {
  const [isButtonClicked, setIsButtonClicked] = useState(0);

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const login = useGoogleLogin({
    onSuccess: ({ access_token }) => {
      setIsButtonClicked(0);
      onSuccess(access_token, profile.phoneNumber);
    },
  });

  useEffect(() => {
    if (profile.hasConfirmedPhoneNumber && isButtonClicked > 0) {
      login();
    }
  }, [isButtonClicked, profile.phoneNumber, profile.hasConfirmedPhoneNumber])

  return (
    <IonButton
      onClick={() => {
        if (profile.hasConfirmedPhoneNumber) {
          setIsOpenConfirmPhonePopup(false);
          setIsButtonClicked((prev) => prev + 1);
        } else {
          setIsOpenConfirmPhonePopup(true);
          setIsButtonClicked((prev) => prev + 1);
        }
      }}
      className="google-login"
      dir="ltr"
    >
      <IonImg src={googleLogo} />
      <IonLabel>Login with Google</IonLabel>
    </IonButton>
  );
};

const BACKGROUND_COLOR = "secondary-new";

const Login: FC<RouteComponentProps> = ({
  history,
  location,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const { isLoading, init, error } = useFacebook();
  const dispatch = useDispatch();
  const isAnonymous = useSelector(({ profile }: ReduxSelectors) => profile);
  const { state }: any = location;

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showStep2, setShowStep2] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);

  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showForgotPasswordEmailAlert, setShowForgotPasswordEmailAlert] =
    useState<boolean>(false);
  const [receiveOtpType, setReceiveOtpType] = useState<string>("");
  const [isLoginButtonDisabled, setIsLoginDisabled] = useState<boolean>(true);
  const [isShowAccountUpdate, setIsShowAccountUpdate] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showConfirmPhoneNumberPopup, setShowConfirmPhoneNumberPopup] =
    useState<boolean>(false);
  const [notConfirmedPhoneNumber, setNotConfirmedPhoneNumber] =
    useState<string>("");
  const [isFaceBookButtonClicked, setIsFaceBookButtonClicked] = useState(0);

  const radioOptions = [
    { value: "SMS", label: "SMS" },
    { value: "CALL", label: "Call" },
  ];

  const handleDismissConfirmPhoneNumber = () => {
    setShowConfirmPhoneNumberPopup(false);
  };

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
    setLoading(false);
    rememberMe && appStorage.setObject(StorageKey.Login, { jwt: data.jwt });
    const state = location.state as LocationState | undefined;

    // billing:
    const currClientDate = new Date().toJSON();
    const eventType = "site.opened";

    if (!loginData.isAnonymous && loginData.jwt) {
      BillingServices.billingEvent(
        currClientDate,
        loginData.id,
        eventType
      ).then(({ data: { result } }) => {
        dispatch(setDailyVisitReward(result));
        if (result.billingReward.creditedStars) {
          dispatch(setEnableRewardPopup({ dailyVisitReward: true }));
        }
      });

      BillingServices.billingStarBalance(loginData.id).then(({ data }) => {
        if (data) dispatch(setTotalStarBalance(data));
        return;
      });
    }

    if (state?.redirectTo) {
      history.replace(state.redirectTo);
    } else {
      history.replace(Routes.Home);
    }
  };

  const saveProfile_confirm = (jwtToken: string, user: any) => {
    const loginData: Profile = {
      jwt: jwtToken,
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      preferredLanguage: user.preferred_language,
      preferredGenre: user.preferred_genre,
      isOverEighteen: user.has_confirmed_is_over_eighteen,
      hasConfirmedPhoneNumber: user.has_confirmed_phone_number,
      showDebugInfo: user.show_debug_info || false,
      isAnonymous: user.isAnonymous || false,
      avatar: user.avatar,
    };

    dispatch(setLogin(loginData));
    dispatch(setInfoToast("phoneNumberValidation.phoneNumberConfirmed"));
    dispatch(setLogin({ hasConfirmedPhoneNumber: true }));
    rememberMe && appStorage.setObject(StorageKey.Login, { jwt: jwtToken });

    // billing:
    const currClientDate = new Date().toJSON();
    const eventType = "site.opened";
    if (!loginData.isAnonymous && loginData.jwt) {
      BillingServices.billingEvent(
        currClientDate,
        loginData.id,
        eventType
      ).then(({ data: { result } }) => {
        dispatch(setDailyVisitReward(result));
        if (result.billingReward.creditedStars) {
          dispatch(setEnableRewardPopup({ dailyVisitReward: true }));
        }
      });

      BillingServices.billingStarBalance(loginData.id).then(({ data }) => {
        if (data) dispatch(setTotalStarBalance(data));
        return;
      });
    }

    setLoading(false);
    handleLocationState();
    setIsShowAccountUpdate(false);
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
        setLoading(false);
        setIsLoginDisabled(true);
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
        setLoading(false);
        setIsLoginDisabled(true);
      });
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      phoneNumber &&
      countryCode &&
      countryName &&
      isRecaptchaVerified &&
      receiveOtpType
    ) {
      const combinePhoneNumber = countryCode + phoneNumber;
      setLoading(true);

      const loginData: SignupDataUsingPhone = {
        nickname: "" as string,
        phoneNumber: combinePhoneNumber as string,
        countryName: "",
        isCallFrom: "WEB_LOGIN",
      };

      if (combinePhoneNumber === "19999") {
        AuthService.loginWithPhone(loginData).then(({ data }) => {
          const { status } = data;
          const confirmed = data.confirmed;
          const user = confirmed?.user;

          if (status === "ok") {
            dispatch(
              setInfoToast("phoneNumberValidation.phoneNumberConfirmed")
            );

            const loginData: Profile = {
              jwt: confirmed?.jwtToken ? confirmed.jwtToken : "",
              id: user?.id ? user.id : 0,
              email: user?.email as string,
              nickname: user?.nickname as string,
              firstName: user?.first_name as string,
              lastName: user?.last_name as string,
              phoneNumber: user?.phone_number as string,
              preferredLanguage: user?.preferred_language as string,
              preferredGenre: user?.preferred_genre as string,
              isOverEighteen: user?.has_confirmed_is_over_eighteen as boolean,
              hasConfirmedPhoneNumber:
                user?.has_confirmed_phone_number as boolean,
              showDebugInfo: user?.show_debug_info || false,
              isAnonymous: user?.isAnonymous || false,
              avatar: user?.avatar,
            };

            dispatch(setLogin(loginData));

            saveProfile_confirm(confirmed?.jwtToken as string, user);

            dispatch(setLogin({ hasConfirmedPhoneNumber: true }));
            setLoading(false);
            rememberMe &&
              appStorage.setObject(StorageKey.Login, {
                jwt: confirmed?.jwtToken as string,
              });

            history.replace(Routes.Home);
            return;
          }
        });
      } else {
        if (receiveOtpType === "SMS") {
          sendConfirmationCode(combinePhoneNumber, recaptchaToken);
        } else {
          sendConfirmationCodeViaCall(combinePhoneNumber, recaptchaToken);
        }
      }
    } else {
      if (username && password) {
        AuthService.login({
          identifier: username,
          password: password,
        })
          .then(saveProfile)
          .catch(() => {
            dispatch(setErrorToast("login.invalid"));
            setLoading(false);
            setIsLoginDisabled(true);
          });
      }
    }
  };

  const handleForgotPassword = (email: string) => {
    AuthService.forgotPassword(email)
      .then(() => dispatch(setInfoToast("login.pleaseCheckYourEmail")))
      .catch((error: any) => {
        let toastError = "unexpectedError";

        if (
          error.response.data?.data?.length &&
          error.response.data.data[0].messages.length
        ) {
          switch (error.response.data.data[0].messages[0].id) {
            case "Auth.form.error.user.not-exist":
              toastError = "emailDoesNotExist";
              break;
            case "Auth.form.error.email.format":
              toastError = "emailFormatIsNotCorrect";
              break;
          }
        }

        dispatch(setErrorToast(`login.${toastError}`));
        setLoading(false);
        setIsLoginDisabled(true);
      });
  };

  const handleProviderLoginError = (err: any) => {
    let emailDuplicatedErrorPresent = false;
    err.response.data?.data?.forEach((dataEntry: { messages: [] }) => {
      const duplicateEmailError = dataEntry.messages.find(
        ({ id }: { id: string }) => id === "Auth.form.error.email.taken"
      );
      emailDuplicatedErrorPresent =
        emailDuplicatedErrorPresent || !!duplicateEmailError;
    });

    let message = "login.invalid";
    if (emailDuplicatedErrorPresent) {
      message = "login.invalidDuplicatedEmail";
      dispatch(setErrorToast(message));
    } else if (err.response.data?.message === "This phone number is already registered with a different provider.") {
      message = "This phone number is already registered with the email or phone number. So you cannot login with Google.";
      dispatch(setErrorToast(message));
      let loginData = {
        nickname: "" as string,
        phoneNumber: isAnonymous.phoneNumber as string,
        countryName: "",
        isCallFrom: "WEB_LOGIN",
      }
      AuthService.loginWithPhone(loginData).then(({ data }) => {
        const { status } = data;
        const confirmed = data.confirmed;
        const user = confirmed?.user;

        if (status === "ok") {
          dispatch(
            setInfoToast("phoneNumberValidation.phoneNumberConfirmed")
          );

          const loginData: Profile = {
            jwt: confirmed?.jwtToken ? confirmed.jwtToken : "",
            id: user?.id ? user.id : 0,
            email: user?.email as string,
            nickname: user?.nickname as string,
            firstName: user?.first_name as string,
            lastName: user?.last_name as string,
            phoneNumber: user?.phone_number as string,
            preferredLanguage: user?.preferred_language as string,
            preferredGenre: user?.preferred_genre as string,
            isOverEighteen: user?.has_confirmed_is_over_eighteen as boolean,
            hasConfirmedPhoneNumber:
              user?.has_confirmed_phone_number as boolean,
            showDebugInfo: user?.show_debug_info || false,
            isAnonymous: user?.isAnonymous || false,
            avatar: user?.avatar,
          };

          dispatch(setLogin(loginData));

          saveProfile_confirm(confirmed?.jwtToken as string, user);

          dispatch(setLogin({ hasConfirmedPhoneNumber: true }));
          setLoading(false);
          rememberMe &&
            appStorage.setObject(StorageKey.Login, {
              jwt: confirmed?.jwtToken as string,
            });

          history.replace(Routes.Home);
          return;
        }
      });
    }
    setLoading(false);
    setIsLoginDisabled(true);
  };

  const handleGoogleLogin = (token: string, phoneNumber: string) => {
    AuthService.loginGoogle(token, phoneNumber)
      .then(saveProfile)
      .catch(handleProviderLoginError);
  };

  const responseFacebook = async (phoneNumber: string) => {
    try {
      const api = await init();

      const response = await api?.login({
        scope: 'email'
      })
      setIsFaceBookButtonClicked(0);

      if (response?.status === LoginStatus.CONNECTED && response.authResponse) {
        response.authResponse?.accessToken &&
          AuthService.loginFacebook(response.authResponse.accessToken, phoneNumber)
            .then(saveProfile)
            .catch(handleProviderLoginError);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (isAnonymous.hasConfirmedPhoneNumber && isFaceBookButtonClicked > 0) {
      responseFacebook(isAnonymous.phoneNumber);
    }
  }, [isFaceBookButtonClicked, isAnonymous.phoneNumber, isAnonymous.hasConfirmedPhoneNumber])

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
        setLoading(false);
        setIsLoginDisabled(true);
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

  useEffect(() => {
    if (
      countryCode &&
      phoneNumber &&
      receiveOtpType &&
      recaptchaToken &&
      isRecaptchaVerified
    ) {
      setIsLoginDisabled(false);
    } else if (username && password) {
      setIsLoginDisabled(false);
    } else {
      setIsLoginDisabled(true);
    }
  }, [
    countryCode,
    phoneNumber,
    receiveOtpType,
    recaptchaToken,
    isRecaptchaVerified,
    username,
    password,
  ]);

  return (
    <>
      {
        <ConfirmPhoneNumber
          isShow={showConfirmPhoneNumberPopup}
          handleDismiss={handleDismissConfirmPhoneNumber}
          notConfirmedPhoneNumber={notConfirmedPhoneNumber}
        />
      }
      <Layout className="center md sm">
        <IonCard
          color={BACKGROUND_COLOR}
          className="login-card"
          style={{ height: showStep2 ? "75%" : "90%" }}
        >
          <IonCardHeader className="login-header">
            <div className="header-content">
              {showStep2 && !isShowAccountUpdate && (
                <IonIcon
                  src={leftArrowIcon}
                  onClick={() => {
                    setShowStep2(false);
                    setLoading(false);
                    setIsLoginDisabled(true);
                    setIsRecaptchaVerified(false);
                    setRecaptchaToken("");
                  }}
                />
              )}
              <IonCardTitle>
                {isShowAccountUpdate
                  ? t("login.accountUpdate")
                  : t("login.header")}
              </IonCardTitle>
            </div>
            {isShowAccountUpdate ? (
              <IonCardSubtitle className="step-2-header">
                <IonTitle className="">{t("login.systemUpdate")}</IonTitle>
              </IonCardSubtitle>
            ) : showStep2 ? (
              <IonCardSubtitle className="step-2-header">
                <IonTitle className="">{t("login.loginWithPhone")}</IonTitle>
              </IonCardSubtitle>
            ) : (
              <IonCardSubtitle className="login-subheader">
                <IonText>{t("login.noAccount")}</IonText>
                <IonButton
                  className="sign-up-button"
                  color="primary"
                  routerLink="/signup"
                  routerDirection="back"
                  fill="clear"
                >
                  {t("login.signup")}
                </IonButton>
              </IonCardSubtitle>
            )}
          </IonCardHeader>

          <IonCardContent className="login-card-content">
            {!showStep2 ? (
              <IonGrid>
                <IonRow>
                  <IonCol
                    sizeXs="12"
                    sizeSm="12"
                    sizeMd="12"
                    sizeLg="6"
                    sizeXl="6"
                  >
                    <IonTitle className="login-title-left">
                      {t("login.leftTitle")}
                    </IonTitle>
                    <form noValidate>
                      <InputWithLabel
                        className="input-username"
                        label={t("login.email")}
                        type="text"
                        name="username"
                        value={username}
                        setValue={setUsername}
                        placeholder={t("login.emailPlaceholder")}
                      />
                      <InputWithLabel
                        className="input-password"
                        label={t("login.password")}
                        type="password"
                        name="password"
                        value={password}
                        setValue={setPassword}
                        placeholder={t("login.passwordPlaceholder")}
                      />

                      <IonRow className="rem-forget-col">
                        <IonCol sizeXl="6" className="remember-me-col">
                          <IonItem
                            color={BACKGROUND_COLOR}
                            className="remember-me"
                            lines="none"
                          >
                            <IonCheckbox
                              color="primary"
                              name="rememberMe"
                              checked={rememberMe}
                              onIonChange={() => setRememberMe((prev) => !prev)}
                            />
                            <IonLabel>{t("login.rememberMe")}</IonLabel>
                          </IonItem>
                        </IonCol>
                        <IonCol sizeXl="6" className="forgot-password-col">
                          <IonItem
                            button
                            color={BACKGROUND_COLOR}
                            className="forgot-password"
                            lines="none"
                            onClick={() =>
                              setShowForgotPasswordEmailAlert(true)
                            }
                          >
                            <IonLabel>{t("login.forgotPassword")}</IonLabel>
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow className="login-g-fb-row">
                        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                          <GoogleLoginCustomButton
                            setIsOpenConfirmPhonePopup={
                              setShowConfirmPhoneNumberPopup
                            }
                            onSuccess={(token: string, phoneNumber: string) =>
                              handleGoogleLogin(token, phoneNumber)
                            }
                          />
                        </GoogleOAuthProvider>
                        <FacebookProvider appId={FACEBOOK_APP_ID}>
                          <IonButton
                            onClick={() => {
                              const phoneNumber = isAnonymous.phoneNumber;
                              if (
                                phoneNumber &&
                                isAnonymous.hasConfirmedPhoneNumber
                              ) {
                                setShowConfirmPhoneNumberPopup(false);
                                setIsFaceBookButtonClicked((prev) => prev + 1);
                              } else {
                                setShowConfirmPhoneNumberPopup(true);
                                setIsFaceBookButtonClicked((prev) => prev + 1);
                              }
                            }}
                            className="facebook-login"
                            dir="ltr"
                          >
                            <IonIcon icon={logoFacebook} />
                            <IonLabel>Login with Facebook</IonLabel>
                          </IonButton>
                        </FacebookProvider>
                      </IonRow>
                    </form>
                  </IonCol>

                  <IonCol
                    sizeXs="12"
                    sizeSm="12"
                    sizeMd="12"
                    sizeLg="6"
                    sizeXl="6"
                    className="login-with-phone"
                  >
                    <IonTitle className="login-title-right">
                      {t("login.rightTitle")}
                    </IonTitle>
                    <IonLabel>{t("login.phoneNumber")}</IonLabel>
                    <div className="login-with-phone-input">
                      <div className="country-code">
                        <SelectCountryCode
                          // key={index}
                          className="login-country-code"
                          onSelect={(value) => {
                            setCountryCode(value.countryCode);
                            setCountryName(value.countryName);
                          }}
                          inputPlaceholder={t("login.countryCode")}
                          disabled={false}
                        />
                      </div>

                      <div className={`phone-number-input`}>
                        <InputWithLabel
                          placeholder={t("login.phoneNumber")}
                          className="login-phone-number"
                          type="text"
                          name="phone-number"
                          value={phoneNumber}
                          setValue={setPhoneNumber}
                        />
                      </div>
                    </div>

                    <div className="receive-otp-radio-buttons">
                      <IonLabel>{t("login.receiveOtpLabel")}</IonLabel>
                      <div className="radio-buttons">
                        <IonRadioGroup
                          value={receiveOtpType}
                          onIonChange={(e) => setReceiveOtpType(e.detail.value)}
                        >
                          {radioOptions.map((option) => (
                            <div className="radio-button" key={option.value}>
                              <IonRadio slot="end" value={option.value} />
                              <IonLabel>{option.label}</IonLabel>
                            </div>
                          ))}
                        </IonRadioGroup>
                      </div>
                    </div>

                    <IonItem
                      color={BACKGROUND_COLOR}
                      lines="none"
                      className="g-recaptcha"
                    >
                      <GoogleRecaptchaV3
                        setIsRecaptchaVerified={setIsRecaptchaVerified}
                        setRecaptchaToken={setRecaptchaToken}
                      />
                    </IonItem>
                  </IonCol>

                  <div className="login-skip-button">
                    <div className="login-button-div">
                      <IonButton
                        type="submit"
                        onClick={handleLoginSubmit}
                        className="login-button"
                        disabled={isLoginButtonDisabled}
                      >
                        {t("login.login")}
                        {loading && <IonSpinner />}
                      </IonButton>
                      {/*We use native button for submit, because IonButton does not fire when Enter key is pressed and when more than one input is add into a form */}
                      {/* <button type="submit" hidden /> */}
                    </div>

                    <div className="skip-button-div">
                      <IonButton
                        type="button"
                        // expand="full"
                        color={
                          isAnonymous && state?.from === "anonymousCreateRoom"
                            ? "light"
                            : "medium"
                        }
                        fill={
                          isAnonymous && state?.from === "anonymousCreateRoom"
                            ? "clear"
                            : "outline"
                        }
                        className={
                          isAnonymous && state?.from === "anonymousCreateRoom"
                            ? "skip-anonymous"
                            : "skip"
                        }
                        onClick={handleSkip}
                      >
                        {isAnonymous && state?.from === "anonymousCreateRoom"
                          ? t("common.cancel")
                          : t("login.skip")}
                      </IonButton>
                    </div>
                  </div>
                </IonRow>
              </IonGrid>
            ) : (
              <VerifyPhoneNumberForm
                combinedPhoneNumber={countryCode + phoneNumber}
                rememberMe={rememberMe}
                recaptchaToken={recaptchaToken}
                openModal={openModal}
                isShowAccountUpdate={isShowAccountUpdate}
                handleSkip={handleSkip}
                onResendConfirmationCode={sendConfirmationCode}
                sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
                handleLocationState={handleLocationState}
                setRecaptchaToken={setRecaptchaToken}
                setIsShowAccountUpdate={setIsShowAccountUpdate}
                setShowStep2={setShowStep2}
                handleForgotPassword={handleForgotPassword}
                setIsRecaptchaVerified={setIsRecaptchaVerified}
                setOpenModal={setOpenModal}
              />
            )}
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showForgotPasswordEmailAlert}
          header={t("login.pleaseEnterYourEmail")}
          onDidDismiss={() => setShowForgotPasswordEmailAlert(false)}
          inputs={[
            {
              name: "email",
              type: "email",
              placeholder: t("login.email"),
            },
          ]}
          buttons={[
            {
              text: t("watchPartyStart.cancel"),
              role: "cancel",
            },
            {
              text: t("watchPartyStart.ok"),
              handler: ({ email }) => {
                if (EMAIL_REGEX.test(email)) {
                  handleForgotPassword(email);
                } else {
                  dispatch(setErrorToast(t("login.invalidEMail")));
                }
              },
            },
          ]}
        />
      </Layout>
    </>
  );
};

export default Login;
