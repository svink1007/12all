import React, { FC, FormEvent, useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";
import { EMAIL_REGEX } from "../../shared/constants";
import { Trans, useTranslation } from "react-i18next";
import { AuthService } from "../../services";
import {
  Profile,
  ReduxSelectors,
  SignUpRedux,
  SignupDataUsingPhone,
} from "../../redux/shared/types";
import { ToastTextFormat } from "../../redux/shared/enums";
import { setLogin } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useDispatch, useSelector } from "react-redux";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import TermsModal from "./TermsModal";
import { setSignUpData } from "../../redux/actions/singUpActions";
import PhoneNumberField from "../../components/PhoneNumberField";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";

const BACKGROUND_COLOR = "secondary";

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

type Props = {
  recaptchaToken: string | "";
  setRecaptchaToken: Function;
  setIsRecaptchaVerified: Function;
  isRecaptchaVerified: boolean;
  emailRef: React.RefObject<HTMLIonInputElement>;
  nicknameRef: React.RefObject<HTMLIonInputElement>;
  email: Email;
  nickname: string | null;
  phoneNumber: string | null;
  password: string | null;
  username: string | null;
  isOverEighteen: boolean;
  receiveOtpType: string;
  state: any;
  onShowStep2: () => void;
  onSendConfirmationCode: (phoneNumber: string, recaptchaToken: string) => void;
  sendConfirmationCodeViaCall: (
    combinedPhoneNumber: string,
    recaptchaToken: string
  ) => void;
  setPhoneNumber: (value: string | null) => void;
  setEmail: React.Dispatch<React.SetStateAction<Email>>;
  setNickname: React.Dispatch<React.SetStateAction<string | null>>;
  setPassword: React.Dispatch<React.SetStateAction<string | null>>;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOverEighteen: (value: boolean) => void;
  handleSkip: () => void;
};

type CustomError = {
  code: number;
  message: string;
};

const SingUpForm: FC<Props> = ({
  recaptchaToken,
  setRecaptchaToken,
  setIsRecaptchaVerified,
  isRecaptchaVerified,
  emailRef,
  email,
  nickname,
  phoneNumber,
  password,
  username,
  setPassword,
  setUsername,
  isOverEighteen,
  receiveOtpType,
  state,
  setPhoneNumber,
  onShowStep2,
  onSendConfirmationCode,
  sendConfirmationCodeViaCall,
  setEmail,
  setNickname,
  setIsOverEighteen,
  handleSkip,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAnonymous } = useSelector(({ profile }: ReduxSelectors) => profile);

  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [isEmailBased, setIsEmailBased] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    if (username) {
      setUsername(null);
    }

    if (nickname) {
      setNickname(null);
    }

    if (password) {
      setPassword(null);
    }
    setEmail(EMAIL_INITIAL);
    setShowPassword(true);
    setIsOverEighteen(false);
  }, []);

  const handleEmailChange = () => {
    setIsEmailBased(true);
    emailRef.current?.getInputElement().then((el) => {
      const valid = EMAIL_REGEX.test(el.value);
      setEmail((prev: Email) => {
        return { ...prev, value: el.value ? el.value.trim() : "", valid };
      });
    });
  };

  const handleEmailBlur = () => {
    setEmail((prev: Email) => {
      let valid = false;
      if (prev.value) {
        valid = EMAIL_REGEX.test(prev.value);
      }
      return { ...prev, touched: true, valid };
    });
  };

  const handleCustomErrors = (error: CustomError) => {
    switch (error.message) {
      case "USERNAME_ALREADY_EXIST":
        return dispatch(
          setErrorToast("signup.customError.usernameAlreadyExist")
        );
      case "PHONE_NUMBER_ALREADY_EXIST":
        return dispatch(setErrorToast("signup.customError.phoneAlreadyExist"));
      case "EMAIL_ALREADY_EXIST":
        return dispatch(setErrorToast("signup.customError.emailAlreadyExist"));

      default:
        return dispatch(setErrorToast("signup.customError.somethingWentWrong"));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    let invalidFields = [];

    if (!isRecaptchaVerified) {
      invalidFields.push(t("signup.recaptcha"));
    }
    console.log("email valid", email);

    if (email.value) {
      if (!phoneNumber) {
        invalidFields.push(t("signup.phoneNumber"));
      }

      if (!nickname) {
        invalidFields.push(t("signup.nickname"));
      }

      if (!email.valid || !email.value) {
        invalidFields.push(t("signup.email"));
      }

      if (!password) {
        invalidFields.push(t("signup.password"));
      }

      if (invalidFields.length) {
        const message = `${t(
          "signup.fillInCorrectlyTheFollowingFields"
        )}: ${invalidFields.join(", ")}`;
        dispatch(setErrorToast(message, ToastTextFormat.Text));
        return;
      }

      const singUpData: SignUpRedux = {
        nickname: (username || phoneNumber) as string,
        password: password as string,
        email: email.value as string,
        phoneNumber: phoneNumber as string,
        has_confirmed_is_over_eighteen: isOverEighteen
      };

      onShowStep2();
      onSendConfirmationCode(singUpData.phoneNumber, recaptchaToken);

      // AuthService.registerNewUser(singUpData)
      //   .then(({ data }) => {
      //     const { error, response, status } = data;
      //     if (error && status === "nok" && error.code === 400) {
      //       handleCustomErrors(error);
      //     } else if (response && status === "ok") {
      //       console.log("inside else after register", response);
      //       const profileData: Profile = {
      //         jwt: response.jwt,
      //         id: response.user.id,
      //         email: response.user.email,
      //         nickname: response.user.nickname || singUpData.nickname,
      //         firstName: response.user.first_name,
      //         lastName: response.user.last_name,
      //         preferredLanguage: response.user.preferred_language,
      //         preferredGenre: response.user.preferred_genre,
      //         isOverEighteen:
      //           response.user.has_confirmed_is_over_eighteen || false,
      //         hasConfirmedPhoneNumber:
      //           response.user.has_confirmed_phone_number || false,
      //         phoneNumber: response.user.phone_number || phoneNumber,
      //         showDebugInfo: response.user.show_debug_info || false,
      //         isAnonymous: response.user.isAnonymous || false,
      //         avatar: response.data?.user?.avatar,
      //       };

      //       appStorage.setObject(StorageKey.Login, { jwt: response.jwt });
      //       dispatch(setSignUpData(singUpData));
      //       dispatch(setLogin(profileData));
      //       dispatch(setInfoToast("signup.success"));
      //       onShowStep2();
      //       onSendConfirmationCode(singUpData.phoneNumber, recaptchaToken);
      //     }
      //   })
      //   .catch((err) => {
      //     let errors = "";
      //     err.response.data.message.forEach((m: any) => {
      //       m.messages.forEach((im: any) => (errors += `${im.message}`));
      //     });
      //     dispatch(setErrorToast(errors || "signup.inputError"));
      //   });
    } else {
      if (!phoneNumber) {
        invalidFields.push(t("signup.phoneNumber"));
      }

      if (!nickname) {
        invalidFields.push(t("signup.nickname"));
      }

      if (invalidFields.length) {
        const message = `${t(
          "signup.fillInCorrectlyTheFollowingFields"
        )}: ${invalidFields.join(", ")}`;
        dispatch(setErrorToast(message, ToastTextFormat.Text));
        return;
      }

      const singUpData: SignupDataUsingPhone = {
        nickname: nickname as string,
        phoneNumber: phoneNumber as string,
        countryName: "",
        has_confirmed_is_over_eighteen: isOverEighteen,
        isCallFrom: "WEB_SIGNUP",
      };

      console.log("signup data else part", singUpData);

      AuthService.loginWithPhone(singUpData)
        .then(({ data: { confirmed, status, error } }) => {
          if (error?.code === 400 && error?.message === "USER_ALREADY_EXIST") {
            dispatch(setErrorToast("User already exists"));
            return;
          }

          if (confirmed && confirmed.user && status === "ok") {
            console.log("inside else after register", confirmed.user);
            const profileData: Profile = {
              jwt: "",
              id: confirmed.user.id,
              email: confirmed.user.email,
              nickname: confirmed.user.nickname || singUpData.nickname,
              firstName: confirmed.user.first_name,
              lastName: confirmed.user.last_name,
              preferredLanguage: confirmed.user.preferred_language,
              preferredGenre: confirmed.user.preferred_genre,
              isOverEighteen:
                confirmed.user.has_confirmed_is_over_eighteen || false,
              hasConfirmedPhoneNumber:
                confirmed.user.has_confirmed_phone_number || false,
              phoneNumber:
                confirmed.user.phone_number || (phoneNumber as string),
              showDebugInfo: confirmed.user.show_debug_info || false,
              isAnonymous: confirmed.user.isAnonymous || false,
              avatar: confirmed.user?.avatar,
            };

            dispatch(setLogin(profileData));
            if (receiveOtpType === "SMS") {
              onSendConfirmationCode(
                confirmed.user.phone_number,
                recaptchaToken
              );
            } else {
              sendConfirmationCodeViaCall(
                confirmed.user.phone_number,
                recaptchaToken
              );
            }
          } else if (receiveOtpType === "SMS" && phoneNumber) {
            onSendConfirmationCode(phoneNumber, recaptchaToken);
          } else if (phoneNumber) {
            sendConfirmationCodeViaCall(phoneNumber, recaptchaToken);
          }
        })
        .catch(() => {
          dispatch(setErrorToast("login.invalid"));
        });
    }
  };

  useEffect(() => {
    if (!email.value) {
      setIsEmailBased(false);
    }
  }, [email.value]);

  return (
    <form noValidate onSubmit={onSubmit}>
      <PhoneNumberField onPhoneNumber={setPhoneNumber} />

      <IonItem color={BACKGROUND_COLOR}>
        <IonLabel position="stacked">{t("signup.email")}</IonLabel>
        <IonInput
          ref={emailRef}
          placeholder={t("signup.enterEmail")}
          type="email"
          name="email"
          value={email.value}
          onIonChange={handleEmailChange}
          onIonBlur={handleEmailBlur}
          required
        />
      </IonItem>

      {isEmailBased && !email.valid && email.touched && (
        <IonText color="danger" className="invalid-message">
          {t("signup.invalidEmail")}
        </IonText>
      )}

      <IonItem color={BACKGROUND_COLOR}>
        <IonLabel position="stacked">{`${t("signup.nickname")} *`}</IonLabel>
        <IonInput
          value={nickname}
          placeholder={t("signup.enterNickname")}
          name="nickname"
          onIonChange={(e) => {
            setNickname(e.detail.value!);
          }}
          required
        />
      </IonItem>

      <IonItem color={BACKGROUND_COLOR}>
        <IonLabel position="stacked">{t("signup.username")}</IonLabel>
        <IonInput
          value={username}
          name="username"
          placeholder={t("signup.enterUsername")}
          onIonChange={(e) => setUsername(e.detail.value!)}
        />
      </IonItem>

      <IonItem color={BACKGROUND_COLOR}>
        <IonLabel position="stacked">{t("signup.password")}</IonLabel>
        <IonInput
          placeholder={t("signup.enterPassword")}
          type={showPassword ? "password" : "text"}
          name="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
          required
        />
      </IonItem>
      <IonItem color={BACKGROUND_COLOR} lines="none">
        <IonCheckbox
          color="tertiary"
          slot="start"
          onIonChange={() => setShowPassword((prev) => !prev)}
        />
        <IonLabel>{t("signup.showPassword")}</IonLabel>
      </IonItem>

      <IonItem color={BACKGROUND_COLOR} lines="none">
        <IonCheckbox
          checked={isOverEighteen}
          color="tertiary"
          slot="start"
          onIonChange={() => setIsOverEighteen(!isOverEighteen)}
        />
        <IonLabel>{t("signup.confirmOver18")}</IonLabel>
      </IonItem>

      <IonItem color={BACKGROUND_COLOR} lines="none">
        <GoogleRecaptchaV3
          setIsRecaptchaVerified={setIsRecaptchaVerified}
          setRecaptchaToken={setRecaptchaToken}
        />
      </IonItem>

      <IonItem color={BACKGROUND_COLOR} lines="none">
        <IonText className="signup-agreement">
          {
            <Trans i18nKey="signup.agreement">
              By signing up, you agree to our
              <IonText
                role="button"
                color="primary"
                className="agreement-terms"
                onClick={() => setShowTerms(true)}
              >
                Terms of Use
              </IonText>
              and to receive 12all.tv emails and updates, and acknowledge that
              you read our
              <IonText
                role="button"
                color="primary"
                className="agreement-privacy"
                onClick={() => setShowPrivacyPolicy(true)}
              >
                Privacy Policy
              </IonText>
              . You also acknowledge that 12all.tv uses cookies to give the best
              user experience.
            </Trans>
          }
        </IonText>
      </IonItem>

      <div className="submit-skip-buttons">
        <IonButton
          type="submit"
          className="submit-button"
          disabled={isRecaptchaVerified ? false : true}
        >
          {t("signup.submit")}
        </IonButton>

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

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onDismiss={() => setShowPrivacyPolicy(false)}
      />
      <TermsModal isOpen={showTerms} onDismiss={() => setShowTerms(false)} />
    </form>
  );
};

export default SingUpForm;
