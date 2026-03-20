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
import { Profile, SignupDataUsingPhone } from "../../../redux/shared/types";
import appStorage, { StorageKey } from "../../../shared/appStorage";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import AccountUpdate from "./AccountUpdate";
import {
  setErrorToast,
  setInfoToast,
} from "../../../redux/actions/toastActions";
import { updateStarsBalance } from "../../../shared/helpers";
import { useHistory } from "react-router";
import { Routes } from "../../../shared/routes";

const INITIAL_RESEND_TIMEOUT = 30;

type Props = {
  combinedPhoneNumber: string;
  rememberMe: boolean;
  recaptchaToken: string;
  isShowAccountUpdate: boolean;
  openModal: boolean;
  handleSkip: () => void;
  onResendConfirmationCode: (
    combinedPhoneNumber: string,
    recaptchaToken: string
  ) => void;
  sendConfirmationCodeViaCall: (
    combinedPhoneNumber: string,
    recaptchaToken: string
  ) => void;
  handleLocationState: () => void;
  setRecaptchaToken: (value: string) => void;
  setIsRecaptchaVerified: (value: boolean) => void;
  setShowStep2: (value: boolean) => void;
  setIsShowAccountUpdate: (value: boolean) => void;
  handleForgotPassword: (value: string) => void;
  setOpenModal: (value: boolean) => void;
};

const VerifyPhoneNumberForm: FC<Props> = ({
  combinedPhoneNumber,
  rememberMe,
  recaptchaToken,
  isShowAccountUpdate,
  openModal,
  handleSkip,
  onResendConfirmationCode,
  sendConfirmationCodeViaCall,
  handleLocationState,
  setRecaptchaToken,
  setIsRecaptchaVerified,
  setShowStep2,
  setIsShowAccountUpdate,
  handleForgotPassword,
  setOpenModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const resendCodeInterval = useRef<NodeJS.Timeout>();

  const [validationCode, setValidationCode] = useState<string>("");
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [sendingCode, setSendingCode] = useState<boolean>(true);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);
  const [isLoginButtonDisabled, setIsLoginDisabled] = useState<boolean>(true);
  const [isShowRecaptcha, setIsShowRecaptcha] = useState<boolean>(false);
  const [jwt, setJwt] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const saveProfile = (jwtToken: string, user: any) => {
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

  const handleLoginSubmit = async () => {
    if (validationCode.length !== 4) {
      return;
    }

    if (validationCode) {
      setLoading(true);
      UserManagementService.confirmCode(combinedPhoneNumber, validationCode)
        .then(({ data }) => {
          console.log("data confirm code", data);
          const { status, message } = data;

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

              // case "please_reset_password":
              //   handleForgotPassword(user.email);
              //   return;
              default:
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

          if (status === "ok") {
            const loginData: SignupDataUsingPhone = {
              nickname: "" as string,
              phoneNumber: combinedPhoneNumber as string,
              countryName: "",
              isCallFrom: "WEB_LOGIN",
            };

            AuthService.loginWithPhone(loginData).then(({ data }) => {
              const { status: loginStatus, error } = data;
              const confirmed = data.confirmed;
              const user = confirmed?.user;

              if (loginStatus === "nok") {
                setLoading(false);
                if (error.code === 400 && error.message === "PLEASE_REGISTER_BEFORE_SIGNIN") {
                  dispatch(setErrorToast("phoneNumberValidation.pleaseRegisterBeforeLogin"));
                  setLoading(false);
                  return;
                } else {
                  dispatch(
                    setErrorToast(
                      "Something went wrong. Please try after sometime."
                    )
                  );
                  return;
                }
              } else if (loginStatus === "ok") {
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
                  isOverEighteen:
                    user?.has_confirmed_is_over_eighteen as boolean,
                  hasConfirmedPhoneNumber:
                    user?.has_confirmed_phone_number as boolean,
                  showDebugInfo: user?.show_debug_info || false,
                  isAnonymous: user?.isAnonymous || false,
                  avatar: user?.avatar,
                };

                dispatch(setLogin(loginData));

                saveProfile(confirmed?.jwtToken as string, user);
                const currClientDate = new Date().toJSON();
                BillingServices.billingEvent(
                  currClientDate,
                  user?.id as number,
                  "entry.create"
                ).then(async ({ data: { result } }) => {
                  dispatch(setDailyVisitReward(result));
                  if (result.billingReward.creditedStars === 100) {
                    const starsBalance = await updateStarsBalance(
                      user?.id as number
                    );
                    dispatch(setTotalStarBalance(starsBalance));
                    dispatch(setEnableRewardPopup({ signupReward: true }));
                  } else {
                    dispatch(setEnableRewardPopup({ signupReward: false }));
                  }
                });

                history.replace(Routes.Home);
              }
            });
          }

          // if (status)
          //   if (jwtToken) {
          //     saveProfile(jwtToken, user);
          //     const currClientDate = new Date().toJSON();
          //     BillingServices.billingEvent(
          //       currClientDate,
          //       user.id,
          //       "entry.create"
          //     ).then(async ({ data: { result } }) => {
          //       dispatch(setDailyVisitReward(result));
          //       if (result.billingReward.creditedStars === 100) {
          //         const starsBalance = await updateStarsBalance(data.user.id);
          //         dispatch(setTotalStarBalance(starsBalance));
          //         dispatch(setEnableRewardPopup({ signupReward: true }));
          //       } else {
          //         dispatch(setEnableRewardPopup({ signupReward: false }));
          //       }
          //     });
          //     return;
          //   }

          // if (!jwtToken && user.email.includes("@12all.anon")) {
          //   setJwt(jwtToken);
          //   setPhoneNumber(user.phone_number);
          //   setLoading(false);
          //   setIsShowAccountUpdate(true);
          //   return;
          // }

          // if (!user.email.includes("@12all.anon") && isPasswordReset) {
          //   saveProfile(jwtToken, user);
          //   return;
          // } else if (
          //   jwtToken &&
          //   user.email.includes("@12all.anon") &&
          //   !isPasswordReset
          // ) {
          //   // appStorage.setObject(StorageKey.Login, { jwt: jwtToken });
          //   setJwt(jwtToken);
          //   setPhoneNumber(user.phone_number);
          //   setLoading(false);
          //   setIsShowAccountUpdate(true);
          //   return;
          // } else if (!user.email.includes("@12all.anon") && !isPasswordReset) {
          //   handleForgotPassword(user.email);
          //   setEmail(user.email);
          //   setIsModalOpen(true);
          //   setOpenModal(true);
          //   setLoading(false);
          //   return;
          // } else {
          //   saveProfile(jwtToken, user);
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
    // onResendConfirmationCode(combinedPhoneNumber, recaptchaToken);
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
          <div className="reset-password-notify">
            <IonText className="password-reset-text">
              {`The reset password link has been sent to your email address`}{" "}
              <span>{email}</span>
              {`. Please check your email.`}
            </IonText>
            <IonButton
              type="button"
              onClick={() => window.location.reload()}
              // disabled={isResendButtonDisabled}
            >
              {"OK"}
            </IonButton>
          </div>
        </IonModal>
      )}
      {!isShowAccountUpdate ? (
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

            {isShowRecaptcha && (
              <div className="g-recaptcha">
                <GoogleRecaptchaV3
                  setIsResendButtonDisabled={setIsResendButtonDisabled}
                  setIsRecaptchaVerified={setIsRecaptchaVerified}
                  setRecaptchaToken={setRecaptchaToken}
                />
              </div>
            )}

            <div className="sms-call-buttons">
              <IonButton
                type="button"
                // color={"medium"}
                // fill="outline"
                onClick={() => resendConfirmationCode("SMS")}
                disabled={isResendButtonDisabled}
              >
                {t("login.resendSMS")} {resendTime ? resendTime : ""}
              </IonButton>
              <IonText>Or</IonText>
              <IonButton
                type="button"
                // color={"medium"}
                // fill="outline"
                onClick={() => resendConfirmationCode("CALL")}
                disabled={isResendButtonDisabled}
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

            <div className="resend-button-div">
              <IonButton
                type="button"
                color={"medium"}
                fill="outline"
                onClick={() => {handleSkip();}}
                // disabled={isResendButtonDisabled}
              >
                {t("login.skip")}
              </IonButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-update-popup">
          <AccountUpdate
            jwt={jwt}
            phoneNumber={phoneNumber}
            setIsShowAccountUpdate={setIsShowAccountUpdate}
            setShowStep2={setShowStep2}
          />
        </div>
      )}
    </>
  );
};

export default VerifyPhoneNumberForm;
