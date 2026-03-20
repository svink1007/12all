import {
  IonButton,
  IonCol, IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  IonText,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import crossIcon from "../../../images/icons/cross.svg";
import backIcon from "../../../images/icons/back.svg";
import "./styles.scss";
import SelectCountryCode from "../../Login_v2/SelectInputCountry";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import {
  AuthService,
  BillingServices,
  UserManagementService,
} from "../../../services";
import {
  setErrorToast,
  setInfoToast,
} from "../../../redux/actions/toastActions";
import InputWithLabel from "../../../components/InputComponent/PlainInput";
import { Profile, ReduxSelectors } from "../../../redux/shared/types";
import appStorage, { StorageKey } from "../../../shared/appStorage";
import { setLogin } from "../../../redux/actions/profileActions";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { updateStarsBalance } from "../../../shared/helpers";
import {Routes} from "../../../shared/routes";

interface IConfirmPhoneNumber {
  isShow: boolean;
  handleDismiss: () => void;
  notConfirmedPhoneNumberCountryCode?: string;
  notConfirmedPhoneNumber?: string;
  sendConfirmationCodeMethod?: string;
  isForgotPassword?: boolean;
  recaptchaToken?: string;
  afterConfirmFunction?: () => void;
}

interface IScene1 {
  countryCode: string;
  setCountryCode: any;
  countryName: string;
  setCountryName: any;
  phoneNumber: string;
  setPhoneNumber: any;
  recaptchaToken: string;
  setRecaptchaToken: any;
  isRecaptchaVerified: boolean;
  setIsRecaptchaVerified: any;
  receiveOtpType: string;
  setReceiveOtpType: any;
  handleDismiss: () => void;
  setShowStep2: any;
  sendConfirmationCode: any;
  sendConfirmationCodeViaCall: any;
}

const Scene1: React.FC<IScene1> = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const {
    countryCode,
    setCountryCode,
    countryName,
    setCountryName,
    phoneNumber,
    setPhoneNumber,
    recaptchaToken,
    setRecaptchaToken,
    isRecaptchaVerified,
    setIsRecaptchaVerified,
    receiveOtpType,
    setReceiveOtpType,
    handleDismiss,
    setShowStep2,
    sendConfirmationCode,
    sendConfirmationCodeViaCall,
  } = props;

  const radioOptions = [
    { value: "SMS", label: "SMS" },
    { value: "CALL", label: "Call" },
  ];

  const handleConfirmClick = () => {
    const combinePhoneNumber = countryCode + phoneNumber;
    if (combinePhoneNumber) {
      UserManagementService.validatePhoneNumber(combinePhoneNumber)
        .then(({ data }) => {
          if (data.status === "ok") {
            if (receiveOtpType === "SMS") {
              // if (recaptchaToken) {
              //   sendConfirmationCode(combinePhoneNumber, recaptchaToken);
              //   setShowStep2(true);
              // } else {
              //   dispatch(setErrorToast("Invalid Recaptcha"));
              // }
              sendConfirmationCode(combinePhoneNumber, recaptchaToken);
              setShowStep2(true);
            } else {
              if (recaptchaToken) {
                sendConfirmationCodeViaCall(combinePhoneNumber, recaptchaToken);
                setShowStep2(true);
              } else {
                dispatch(setErrorToast("Invalid Recaptcha"));
              }
            }
          } else {
            dispatch(setErrorToast("Phone Number is invalid"));
          }
        })
        .catch((err) => {
          dispatch(setErrorToast("Phone Number is invalid"));
        });
    } else {
      dispatch(setErrorToast("Please input phone number"));
    }
  };

  return (
    <>
      <IonImg
        src={crossIcon}
        className="cross-button"
        onClick={() => handleDismiss()}
      />
      <div className="modal-header">
        {t("myProfile.fieldLabel.confirmModalHeader")}
      </div>
      <div className="modal-subscription">
        {t("myProfile.fieldLabel.confirmModalSubscription")}
      </div>

      <div className="modal-phonenumber-container">
        {/* <div className="modal-phonenumber-code-container">
            <div className="label-code-input">Phone number</div>
            <div>
                <IonInput className="code-input"></IonInput>
            </div>
            </div> */}
        {(!profile.phoneNumber || phoneNumber === "") && (
          <>
            <div className="modal-phonenumber-code-container">
              <SelectCountryCode
                // key={index}
                className="code-input"
                onSelect={(value) => {
                  setCountryCode(value.countryCode);
                  setCountryName(value.countryName);
                }}
                inputPlaceholder={t("login.countryCode")}
                disabled={false}
              />
            </div>
            <div className="modal-phonenumber-number-container">
              <IonInput
                className="number-input"
                onIonChange={({ detail: { value } }) => {
                  const numericValue = value
                    ? value.replace(/[^0-9]/g, "").trim()
                    : "";
                  setPhoneNumber(numericValue);
                }}
                value={phoneNumber}
              ></IonInput>
            </div>
          </>
        )}
      </div>

      <div>
        <div className="receive-otp-radio-buttons">
          <div className="receive-otp-radio-buttons-container">
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
        </div>
      </div>

      {/*<div className="g-recaptcha">*/}
      {/*  <GoogleRecaptchaV3*/}
      {/*    setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
      {/*    setRecaptchaToken={setRecaptchaToken}*/}
      {/*  />*/}
      {/*</div>*/}

      <div className="footer !pb-5">
        <IonButton
          type="submit"
          className="save-button"
          onClick={handleConfirmClick}
        >
          {t("myProfile.button.confirm")}
        </IonButton>
      </div>
    </>
  );
};

const INITIAL_RESEND_TIMEOUT = 30;

interface IScene2 {
  handleBack: () => void;
  combinedPhoneNumber: string;
  // isShowRecaptcha: boolean;
  // isRecaptchaVerified: boolean;
  // setIsRecaptchaVerified: any;
  setRecaptchaToken: any;
  onResendConfirmationCode: any;
  sendConfirmationCodeViaCall: any;
  recaptchaToken: string;
  handleDismiss: () => void;
  afterConfirmFunction?: () => void;
  isForgotPassword?: boolean;
}

const Scene2: React.FC<IScene2> = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [validationCode, setValidationCode] = useState<string>("");
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);
  const [sendingCode, setSendingCode] = useState<boolean>(true);
  const [isLoginButtonDisabled, setIsLoginDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isShowRecaptcha, setIsShowRecaptcha] = useState<boolean>(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
      useState<boolean>(false);

  const {
    handleBack,
    combinedPhoneNumber,
    // isShowRecaptcha,
    setRecaptchaToken,
    // setIsRecaptchaVerified,
    // isRecaptchaVerified,
    onResendConfirmationCode,
    sendConfirmationCodeViaCall,
    recaptchaToken,
    handleDismiss,
  } = props;

  const resendConfirmationCode = (resendCallOrSms: string) => {
    setIsRecaptchaVerified(false);
    setRecaptchaToken("");
    setResendTime(INITIAL_RESEND_TIMEOUT);
    setSendingCode(false);
    setIsResendButtonDisabled(true);
    switch (resendCallOrSms) {
      case "SMS":
        onResendConfirmationCode(combinedPhoneNumber, true, recaptchaToken);
        return;
      case "CALL":
        sendConfirmationCodeViaCall(combinedPhoneNumber, recaptchaToken);
        return;
      default:
        return;
    }
  };

  const handleConfirmVerificationCode = async () => {
    if (validationCode.length !== 4) {
      return;
    }

    if (validationCode && combinedPhoneNumber) {
      setLoading(true);
      UserManagementService.confirmCode(combinedPhoneNumber, validationCode)
        .then(({ data }) => {
          const { status, message } = data;

          // if (jwtToken === "") {
          //   handleForgotPassword(user.email)
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

          if (status === "ok") {
            dispatch(
              setInfoToast("phoneNumberValidation.phoneNumberConfirmed")
            );
            dispatch(
              setLogin({
                hasConfirmedPhoneNumber: true,
                phoneNumber: combinedPhoneNumber,
              })
            );
            setLoading(false);
            setIsLoginDisabled(true);
            handleDismiss();

            const currClientDate = new Date().toJSON();
            BillingServices.billingEvent(
              currClientDate,
              profile.id,
              "entry.create"
            ).then(async ({ data: { result } }) => {
              dispatch(setDailyVisitReward(result));
              if (result.billingReward.creditedStars === 100) {
                const starsBalance = await updateStarsBalance(data.user.id);
                dispatch(setTotalStarBalance(starsBalance));
                dispatch(setEnableRewardPopup({ signupReward: true }));
              } else {
                dispatch(setEnableRewardPopup({ signupReward: false }));
              }
            });
            props.afterConfirmFunction && props.afterConfirmFunction();
            return;
          }
        })
        .catch(() => {
          dispatch(setErrorToast("Something went wrong."));
          setLoading(false);
          setIsLoginDisabled(true);
        });
    }
  };

  useEffect(() => {
    if (resendTime > 0) {
      const timer = setTimeout(() => {
        setResendTime((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer); // Cleanup on unmount or state change
    }
  }, [resendTime]);

  useEffect(() => {
    if (resendTime === 0) {
      setIsShowRecaptcha(true);
      setSendingCode(true);
    }
  }, [resendTime]);

  return (
    <>
      {!props.isForgotPassword && <IonImg
        src={backIcon}
        className="back-button"
        onClick={() => handleBack()}
      />}
      <div className="modal-header">
        {t("myProfile.fieldLabel.confirmModalHeader2")}
      </div>

      <div className="verify-phone-number">
        <div className="verify-phone-content">
          <div className="otp-label opt-label-container">
            <IonText>{t("login.otpSentTo")}</IonText>
            <IonText>{`+${combinedPhoneNumber}`}</IonText>
          </div>

          <div className="verify-phone-input-container">
            <InputWithLabel
              className="verify-phone-input"
              placeholder={t("login.enterOTP")}
              type="text"
              name="verifyPhoneNumber"
              value={validationCode}
              setValue={setValidationCode}
            />
          </div>

          {/*{sendingCode && (*/}
          {/*    <div className="flex my-5 justify-center items-center">*/}
          {/*      {isShowRecaptcha && (*/}
          {/*          <div className="g-recaptcha">*/}
          {/*            <GoogleRecaptchaV3*/}
          {/*                setIsResendButtonDisabled={setIsResendButtonDisabled}*/}
          {/*                setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
          {/*                setRecaptchaToken={setRecaptchaToken}*/}
          {/*            />*/}
          {/*          </div>*/}
          {/*      )}*/}
          {/*    </div>*/}
          {/*)}*/}

          <div className="sms-call-buttons sms-call-buttons-container justify-between">
            <IonButton
              type="button"
              // color={"medium"}
              // fill="outline"
              onClick={() => resendConfirmationCode("SMS")}
              disabled={resendTime > 0}
              // disabled={resendTime > 0 || !isRecaptchaVerified}
            >
              {t("login.resendSMS")} {resendTime ? resendTime : ""}
            </IonButton>
            <IonText>or</IonText>
            <IonButton
              type="button"
              // color={"medium"}
              // fill="outline"
              onClick={() => resendConfirmationCode("CALL")}
              disabled={resendTime > 0}
              // disabled={resendTime > 0 || !isRecaptchaVerified}
            >
              {t("login.receiveCall")} {resendTime ? resendTime : ""}
            </IonButton>
          </div>
        </div>

        <div className="footer !pb-5">
          <IonButton
            type="submit"
            // onClick={handleLoginSubmit}
            className="save-button"
            disabled={isLoginButtonDisabled}
            onClick={handleConfirmVerificationCode}
          >
            {t("login.verify")}
            {loading && <IonSpinner />}
          </IonButton>
        </div>
      </div>
    </>
  );
};

const ConfirmPhoneNumber: React.FC<IConfirmPhoneNumber> = (props) => {
  const dispatch = useDispatch();

  const [receiveOtpType, setReceiveOtpType] = useState<string>("SMS");
  const [countryCode, setCountryCode] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [showStep2, setShowStep2] = useState<boolean>(false);

  const { isShow, handleDismiss } = props;

  useEffect(() => {
    if (props.isForgotPassword && props.notConfirmedPhoneNumber && props.notConfirmedPhoneNumberCountryCode) {
      setPhoneNumber(props.notConfirmedPhoneNumber);
      setCountryCode(props.notConfirmedPhoneNumberCountryCode);
      setShowStep2(true);
    } else if (!props.isForgotPassword && props.notConfirmedPhoneNumber) {
      setPhoneNumber(props.notConfirmedPhoneNumber);
    }
  }, [props]);

  const handleBack = () => {
    setShowStep2(false);
  };

  const sendConfirmationCode = (
    phoneNumber: string,
    isResend: boolean,
    recaptchaToken: string
  ) => {
    UserManagementService.sendConfirmationCode(phoneNumber, recaptchaToken, isResend)
      .then(({ data }) => {
        if (data.status === "ok") {
          dispatch(setInfoToast("OTP Code Resent"));
          setShowStep2(true);
        }
        if (data.status === "nok_ip_sent_too_many_requests") {
          dispatch(
            setErrorToast(
              "phoneNumberValidation.confirmationCodeCanNotBeRequested"
            )
          );
        } else if (data.status === "nok_phone_number_invalid") {
          dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
        }
      })
      .catch(() => {
        dispatch(setErrorToast("signup.unknownErrorOnConfirmPhoneNumber"));
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
        } else if (data.status === "nok_phone_number_invalid") {
          dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
        }
      })
      .catch(() => {
        dispatch(setErrorToast("signup.unknownErrorOnConfirmPhoneNumber"));
      });
  };

  return (
    <IonModal
      isOpen={isShow}
      onDidDismiss={() => handleDismiss()}
      backdropDismiss={false}
      className="confirm-phonenumber-modal"
    >
      <div className={"flex justify-end items-center"}>
        <IonButton
            color="transparent"
            className="ion-transparent-button border-0 shadow-transparent inset-0"
            onClick={() => {
              handleDismiss()
            }}
        >
          <IonIcon size="small" slot="icon-only" color="white" icon={crossIcon} />
        </IonButton>
      </div>
      {!showStep2 && (
        <Scene1
          receiveOtpType={receiveOtpType}
          setReceiveOtpType={setReceiveOtpType}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
          countryName={countryName}
          setCountryName={setCountryName}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          recaptchaToken={recaptchaToken}
          setRecaptchaToken={setRecaptchaToken}
          isRecaptchaVerified={isRecaptchaVerified}
          setIsRecaptchaVerified={setIsRecaptchaVerified}
          handleDismiss={handleDismiss}
          setShowStep2={setShowStep2}
          sendConfirmationCode={sendConfirmationCode}
          sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
        />
      )}
      {showStep2 && (
        <Scene2
          handleBack={handleBack}
          combinedPhoneNumber={countryCode + phoneNumber}
          // isShowRecaptcha={!!recaptchaToken}
          // isRecaptchaVerified={isRecaptchaVerified}
          onResendConfirmationCode={sendConfirmationCode}
          sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
          recaptchaToken={recaptchaToken}
          // setIsRecaptchaVerified={setIsRecaptchaVerified}
          setRecaptchaToken={setRecaptchaToken}
          handleDismiss={handleDismiss}
          afterConfirmFunction={props.afterConfirmFunction}
          isForgotPassword={props.isForgotPassword}
        />
      )}
    </IonModal>
  );
};

export default ConfirmPhoneNumber;
