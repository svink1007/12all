import React, { FC, useEffect, useRef, useState } from "react";
import InputWithLabel from "../../../components/InputComponent/PlainInput";
import {
  IonButton,
  IonModal,
  IonSpinner,
  IonText,
  useIonViewWillLeave,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  AuthService,
  BillingServices,
  UserManagementService,
} from "../../../services";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../redux/actions/profileActions";
import { Profile, SignUpRedux } from "../../../redux/shared/types";
import appStorage, { StorageKey } from "../../../shared/appStorage";
// import { setDailyVisitReward, setEnableRewardPopup, setTotalStarBalance } from "../../../redux/actions/billingRewardActions";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import {
  setErrorToast,
  setInfoToast,
} from "../../../redux/actions/toastActions";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { updateStarsBalance } from "../../../shared/helpers";
import { setSignUpData } from "../../../redux/actions/singUpActions";

const INITIAL_RESEND_TIMEOUT = 30;

type Email = {
  value?: string | null;
  valid: boolean;
  touched: boolean;
};

type CustomError = {
  code: number;
  message: string;
};

type Props = {
  combinedPhoneNumber: string | null;
  recaptchaToken: string;
  openModal: boolean;
  email: Email;
  nickname: string | null;
  username: string | null;
  password: string | null;
  isOverEighteen: boolean;
  onResendConfirmationCode: (
    combinedPhoneNumber: string,
    recaptchaToken: string
  ) => void;
  sendConfirmationCodeViaCall: (
    combinedPhoneNumber: string,
    recaptchaToken: string
  ) => void;
  setRecaptchaToken: (value: string) => void;
  setIsRecaptchaVerified: (value: boolean) => void;
  setShowStep2: (value: boolean) => void;
  setOpenModal: (value: boolean) => void;
  handleLocationState: () => void;
};

const ConfirmPhoneNumberFormNew: FC<Props> = ({
  combinedPhoneNumber,
  recaptchaToken,
  openModal,
  email,
  nickname,
  username,
  password,
  isOverEighteen,
  onResendConfirmationCode,
  sendConfirmationCodeViaCall,
  setRecaptchaToken,
  setIsRecaptchaVerified,
  setShowStep2,
  setOpenModal,
  handleLocationState,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const resendCodeInterval = useRef<NodeJS.Timeout>();

  const [validationCode, setValidationCode] = useState<string>("");
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [sendingCode, setSendingCode] = useState<boolean>(true);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);
  const [isLoginButtonDisabled, setIsLoginDisabled] = useState<boolean>(true);
  const [isShowRecaptcha, setIsShowRecaptcha] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const saveProfile = (jwtToken: string, user: any) => {
    const loginData: Profile = {
      jwt: jwtToken,
      id: user.id,
      email: user.email,
      nickname: user.nickname || user.username,
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

    appStorage.setObject(StorageKey.Login, { jwt: jwtToken });
    dispatch(setLogin(loginData));
    dispatch(setInfoToast("phoneNumberValidation.phoneNumberConfirmed"));
    dispatch(setLogin({ hasConfirmedPhoneNumber: true }));

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

      BillingServices.billingEvent(
        currClientDate,
        loginData.id,
        "entry.update"
      ).then(({ data: { result } }) => {
        // console.log("result event update", result);
      });

      BillingServices.billingStarBalance(loginData.id).then(({ data }) => {
        if (data) dispatch(setTotalStarBalance(data));
        return;
      });
    }

    setLoading(false);
    handleLocationState();
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

  const handleLoginSubmit = async () => {
    if (validationCode.length !== 4) {
      return;
    }

    if (validationCode && combinedPhoneNumber) {
      setLoading(true);
      UserManagementService.confirmCode(combinedPhoneNumber, validationCode)
        .then(({ data }) => {
          // console.log("data confirm code", data);
          const { status, message } = data;

          // if (jwtToken === "") {
          //   handleForgotPassword(user.email);
          //   return;
          // }

          if (message) {
            switch (message) {
              case "nok_not_valid_code":
                dispatch(setErrorToast("phoneNumberValidation.invalidCode"));
                setLoading(false);
                return;
              case "nok_code_expired":
                dispatch(setErrorToast("phoneNumberValidation.codeExpired"));
                setLoading(false);
                return;

              case "please_reset_password":
                return;
            }
          }

          if (status === "nok") {
            dispatch(
              setErrorToast("Something went wrong. Please try again later.")
            );
            setLoading(false);
            return;
          }

          // if (status === "ok" && jwtToken && user) {
          //   saveProfile(jwtToken, user);
          //   const currClientDate = new Date().toJSON();
          //   BillingServices.billingEvent(
          //     currClientDate,
          //     user.id,
          //     "entry.create"
          //   ).then(async ({ data: { result } }) => {
          //     dispatch(setDailyVisitReward(result));
          //     if (result.billingReward.creditedStars === 100) {
          //       const starsBalance = await updateStarsBalance(data.user.id);
          //       dispatch(setTotalStarBalance(starsBalance));
          //       dispatch(setEnableRewardPopup({ signupReward: true }));
          //     } else {
          //       dispatch(setEnableRewardPopup({ signupReward: false }));
          //     }
          //   });
          //   return;
          // }

          if (status === "ok") {
            const signUpData: SignUpRedux = {
              nickname: (username || combinedPhoneNumber) as string,
              password: password as string,
              email: email.value as string,
              phoneNumber: combinedPhoneNumber as string,
              has_confirmed_is_over_eighteen: isOverEighteen,
            };

            AuthService.registerNewUser(signUpData)
              .then(({ data }) => {
                const { error, response, status } = data;
                if (error && status === "nok" && error.code === 400) {
                  handleCustomErrors(error);
                } else if (response && status === "ok") {
                  // console.log("inside else after register", response);
                  const profileData: Profile = {
                    jwt: response.jwt,
                    id: response.user.id,
                    email: response.user.email,
                    nickname: response.user.nickname || signUpData.nickname || response.user.username,
                    firstName: response.user.first_name,
                    lastName: response.user.last_name,
                    preferredLanguage: response.user.preferred_language,
                    preferredGenre: response.user.preferred_genre,
                    isOverEighteen:
                      response.user.has_confirmed_is_over_eighteen || false,
                    hasConfirmedPhoneNumber:
                      response.user.has_confirmed_phone_number || false,
                    phoneNumber:
                      response.user.phone_number || combinedPhoneNumber,
                    showDebugInfo: response.user.show_debug_info || false,
                    isAnonymous: response.user.isAnonymous || false,
                    avatar: response.data?.user?.avatar,
                  };

                  appStorage.setObject(StorageKey.Login, { jwt: response.jwt });
                  dispatch(setSignUpData(signUpData));
                  dispatch(setLogin(profileData));
                  dispatch(setInfoToast("signup.success"));
                }

                if (response.jwt && response.user) {
                  saveProfile(response.jwt, response.user);
                  const currClientDate = new Date().toJSON();
                  BillingServices.billingEvent(
                    currClientDate,
                    response.user.id,
                    "entry.create"
                  ).then(async ({ data: { result } }) => {
                    dispatch(setDailyVisitReward(result));
                    if (result.billingReward.creditedStars === 100) {
                      const starsBalance = await updateStarsBalance(
                        data.user.id
                      );
                      dispatch(setTotalStarBalance(starsBalance));
                      dispatch(setEnableRewardPopup({ signupReward: true }));
                    } else {
                      dispatch(setEnableRewardPopup({ signupReward: false }));
                    }
                  });
                  return;
                }
              })
              .catch((err) => {
                let errors = "";
                err.response.data.message.forEach((m: any) => {
                  m.messages.forEach((im: any) => (errors += `${im.message}`));
                });
                dispatch(setErrorToast(errors || "signup.inputError"));
              });
            setLoading(false);
          }

          // if (!user.email.includes("@12all.anon") && isPasswordReset) {
          //   saveProfile(jwtToken, user)
          //   return;
          // }
          // else if (jwtToken && ((user.email.includes("@12all.anon")) && !isPasswordReset)) {
          //   appStorage.setObject(StorageKey.Login, { jwt: jwtToken });
          //   setJwt(jwtToken)
          //   setPhoneNumber(user.phone_number)
          //   setLoading(false)
          //   return;
          // } else if (!user.email.includes("@12all.anon") && !isPasswordReset) {
          //   // handleForgotPassword(user.email)
          //   setEmail(user.email)
          //   setIsModalOpen(true)
          //   setOpenModal(true)
          //   setLoading(false)
          //   return;
          // } else {
          //   saveProfile(jwtToken, user)
          //   return;
          // }
        })
        .catch(() => {
          dispatch(setErrorToast("Something went wrong."));
          setLoading(false);
          setIsLoginDisabled(true);
        });
    }
  };

  useIonViewWillLeave(() => {
    if (resendCodeInterval.current) {
      clearInterval(resendCodeInterval.current);
    }
  }, []);

  useEffect(() => {
    if (sendingCode) {
      resendCodeInterval.current = setInterval(() => {
        setResendTime((prevState) => prevState - 1);
      }, 1000);
    }

    return () => {
      if (resendCodeInterval.current) {
        clearInterval(resendCodeInterval.current);
      }
    };
  }, [sendingCode]);

  useEffect(() => {
    if (resendTime === 0) {
      setIsShowRecaptcha(true);
      setSendingCode(false);
    }
  }, [resendTime]);

  useEffect(() => {
    if (loading) {
      setIsLoginDisabled(true);
    } else if (validationCode.length === 4) {
      setIsLoginDisabled(false);
    } else {
      setIsLoginDisabled(true);
    }
  }, [validationCode, loading]);

  const resendConfirmationCode = (resendCallOrSms: string) => {
    setIsRecaptchaVerified(false);
    setIsShowRecaptcha(false);
    setRecaptchaToken("");
    setResendTime(INITIAL_RESEND_TIMEOUT);
    setSendingCode(true);
    setIsResendButtonDisabled(true);

    if (combinedPhoneNumber) {
      switch (resendCallOrSms) {
        case "SMS":
          onResendConfirmationCode(combinedPhoneNumber, recaptchaToken);
          return;
        case "CALL":
          sendConfirmationCodeViaCall(combinedPhoneNumber, recaptchaToken);
          return;
        default:
          return;
      }
    }
  };

  return (
    <>
      {isModalOpen && (
        <IonModal
          isOpen={openModal}
          onDidDismiss={() => setIsModalOpen(false)}
          className="ion-reward-modal"
          backdropDismiss={false}
        >
          <IonButton type="button" onClick={() => window.location.reload()}>
            {"OK"}
          </IonButton>
        </IonModal>
      )}

      <div className="verify-phone-number">
        <div className="verify-phone-content">
          <div className="otp-label">
            <IonText>{t("login.otpSentTo")}</IonText>
            <IonText>{`+${combinedPhoneNumber}`}</IonText>
          </div>

          <InputWithLabel
            className="verify-phone-input"
            placeholder={t("login.enterOTP")}
            type="text"
            name="verifyPhoneNumber"
            value={validationCode}
            setValue={setValidationCode}
          />

          {/*{isShowRecaptcha && (*/}
          {/*  <div className="g-recaptcha">*/}
          {/*    <GoogleRecaptchaV3*/}
          {/*      setIsResendButtonDisabled={setIsResendButtonDisabled}*/}
          {/*      setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
          {/*      setRecaptchaToken={setRecaptchaToken}*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*)}*/}

          <div className="sms-call-buttons">
            <IonButton
              type="button"
              onClick={() => resendConfirmationCode("SMS")}
              // disabled={isResendButtonDisabled}
              disabled={resendTime > 0}
            >
              {t("login.resendSMS")} {resendTime ? resendTime : ""}
            </IonButton>
            <IonText>Or</IonText>
            <IonButton
              type="button"
              onClick={() => resendConfirmationCode("CALL")}
              disabled={resendTime > 0}
            >
              {t("login.receiveCall")} {resendTime ? resendTime : ""}
            </IonButton>
          </div>
        </div>

        <div className="login-skip-button verify-phone-buttons">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmPhoneNumberFormNew;
