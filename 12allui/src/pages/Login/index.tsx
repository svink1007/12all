import React, { FC, FormEvent, useRef, useState } from "react";
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
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
} from "@ionic/react";
// @ts-ignore
import { FacebookProvider, Login as FBLogin } from "react-facebook";
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
import { Profile, ReduxSelectors } from "../../redux/shared/types";
import LocationState from "../../models/LocationState";
import { AuthService, SkipLogin } from "../../services";
import { LoginResponse } from "../../shared/types";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../redux/actions/billingRewardActions";
import { BillingServices } from "../../services";
import { updateStarsBalance } from "../../shared/helpers";

type GoogleLoginCustomButtonProps = {
  onSuccess: (token: string) => void;
};

const GoogleLoginCustomButton: FC<GoogleLoginCustomButtonProps> = ({
  onSuccess,
}: GoogleLoginCustomButtonProps) => {
  const login = useGoogleLogin({
    onSuccess: ({ access_token }) => onSuccess(access_token),
  });

  return (
    <IonButton onClick={() => login()} className="google-login" dir="ltr">
      <IonImg src={googleLogo} />
      <IonLabel>Login with Google</IonLabel>
    </IonButton>
  );
};

const BACKGROUND_COLOR = "secondary";

const Login: FC<RouteComponentProps> = ({
  history,
  location,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isAnonymous = useSelector(({ profile }: ReduxSelectors) => profile);
  const { state }: any = location;

  const usernameRef = useRef<HTMLIonInputElement>(null);
  const passRef = useRef<HTMLIonInputElement>(null);

  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showForgotPasswordEmailAlert, setShowForgotPasswordEmailAlert] =
    useState<boolean>(false);

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
      ).then(async ({ data: { result } }) => {
        dispatch(setDailyVisitReward(result));
        if (result.billingReward.creditedStars) {
          const starsBalance = await updateStarsBalance(loginData.id);
          dispatch(setTotalStarBalance(starsBalance));
          dispatch(setEnableRewardPopup({ dailyVisitReward: true }));
        }
      });
    }

    if (state?.redirectTo) {
      history.replace(state.redirectTo);
    } else {
      history.replace(Routes.Home);
    }
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!usernameRef.current?.value || !passRef.current?.value) {
      return;
    }

    AuthService.login({
      identifier: usernameRef.current.value as string,
      password: passRef.current.value as string,
    })
      .then(saveProfile)
      .catch(() => dispatch(setErrorToast("login.invalid")));
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
    }
    dispatch(setErrorToast(message));
  };

  const handleGoogleLogin = (token: string) => {
    // AuthService.loginGoogle(token)
    //   .then(saveProfile)
    //   .catch(handleProviderLoginError);
  };

  const responseFacebook = (response: any) => {
    // response.tokenDetail?.accessToken &&
    //   // AuthService.loginFacebook(response.tokenDetail.accessToken)
    //   //   .then(saveProfile)
    //   //   .catch(handleProviderLoginError);
  };

  const handleSkip = () => {
    if (state?.from === "anonymousCreateRoom") {
      return history.push(Routes.Home);
    } else if (state?.from === "anonymousStream") {
      return history.push(`${Routes.Stream}/${state?.streamId}`);
    }
    SkipLogin.getLogin()
      .then(saveProfile)
      .catch(() => dispatch(setErrorToast("login.invalid")));
  };

  return (
    <Layout className="center md">
      <IonCard color={BACKGROUND_COLOR} className="login-card">
        <IonCardHeader>
          <IonCardTitle>{t("login.header")}</IonCardTitle>
          <IonCardSubtitle className="login-subheader">
            <IonText>{t("login.noAccount")}</IonText>
            <IonButton
              color="primary"
              routerLink="/signup"
              routerDirection="back"
              fill="clear"
            >
              {t("login.signup")}
            </IonButton>
          </IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="6" sizeXl="6">
                <form noValidate onSubmit={handleLoginSubmit}>
                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="stacked">
                      {t("login.phoneEmail")}
                    </IonLabel>
                    <IonInput
                      type="text"
                      name="username"
                      required
                      ref={usernameRef}
                      placeholder={t("login.enterPhoneEmail")}
                    />
                  </IonItem>
                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="stacked">
                      {t("login.password")}
                    </IonLabel>
                    <IonInput
                      type="password"
                      name="password"
                      required
                      ref={passRef}
                      placeholder={t("login.enterPassword")}
                    />
                  </IonItem>

                  <IonRow>
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
                        onClick={() => setShowForgotPasswordEmailAlert(true)}
                      >
                        <IonLabel>{t("login.forgotPassword")}</IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonButton type="submit" className="login-button">
                    {t("login.login")}
                  </IonButton>
                  {/*We use native button for submit, because IonButton does not fire when Enter key is pressed and when more than one input is add into a form*/}
                  <button type="submit" hidden />

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
                </form>
              </IonCol>

              <IonCol
                sizeXs="12"
                sizeSm="12"
                sizeMd="12"
                sizeLg="6"
                sizeXl="6"
                className="login-g-fb-col"
              >
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLoginCustomButton onSuccess={handleGoogleLogin} />
                </GoogleOAuthProvider>
                <FacebookProvider appId={FACEBOOK_APP_ID}>
                  <FBLogin
                    scope="email"
                    onCompleted={responseFacebook}
                    onError={responseFacebook}
                  >
                    {({ handleClick }: any) => (
                      <IonButton
                        onClick={handleClick}
                        className="facebook-login"
                        dir="ltr"
                      >
                        <IonIcon icon={logoFacebook} />
                        <IonLabel>Login with Facebook</IonLabel>
                      </IonButton>
                    )}
                  </FBLogin>
                </FacebookProvider>
              </IonCol>
            </IonRow>
          </IonGrid>
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
  );
};

export default Login;
