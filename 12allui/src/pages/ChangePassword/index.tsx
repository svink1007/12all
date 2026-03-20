import React, { FC, FormEvent, useEffect, useRef, useState } from "react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { useTranslation } from "react-i18next";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  useIonViewWillLeave,
} from "@ionic/react";
import { RouteComponentProps } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Routes } from "../../shared/routes";
import { setErrorToast, setInfoToast, setSuccessToast } from "../../redux/actions/toastActions";
import { AuthService, UserManagementService } from "../../services";
import crossIcon from "../../images/icons/cross.svg";
import { key, personCircleOutline } from "ionicons/icons";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";
import { ReduxSelectors } from "../../redux/shared/types";

const BACKGROUND_COLOR = "secondary-new";

const INITIAL_RESEND_TIMEOUT = 30;

const ChangePasswordPage: FC<RouteComponentProps> = ({
  history,
  location,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [otpCode, setOtpCode] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [recaptchaToken, setRecaptchaToken] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !password ||
      !passwordConfirmation ||
      password !== passwordConfirmation
    ) {
      dispatch(setErrorToast("resetPassword.invalidPasswords"));
      return;
    }

    setSubmitting(true);

    UserManagementService.changePassword(otpCode!, password)
      .then((response) => {
        if (response.data?.status == "ok") {
          dispatch(setInfoToast("resetPassword.passwordReset"));
          setTimeout(function () {
            setOtpCode("");
            setPassword("");
            setPasswordConfirmation("");
            history.push(Routes.Home);
          }, 1000);
        } else if (
          response.data?.status == "nok" &&
          response.data.error.code == 400
        ) {
          dispatch(setErrorToast(response.data.error.message));
        } else {
          dispatch(setErrorToast(`resetPassword.error`));
        }
      })
      .catch((error: any) => {
        dispatch(setErrorToast(`resetPassword.error`));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const [sendingCode, setSendingCode] = useState<boolean>(true);
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [isShowRecaptcha, setIsShowRecaptcha] = useState<boolean>(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);

  const resendCodeInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (resendTime === 0) {
      setIsShowRecaptcha(true);
      setSendingCode(true);
    }
  }, [resendTime]);

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

  useIonViewWillLeave(() => {
    if (resendCodeInterval.current) {
      clearInterval(resendCodeInterval.current);
    }
  }, []);

  return (
    <Layout className="center">
      <IonCard color={BACKGROUND_COLOR} className="change-password-container">
        <IonButton
          color="transparent"
          className="ion-transparent-button"
          onClick={() => {
            history.replace(Routes.resetCode);
          }}
        >
          <IonIcon slot="icon-only" color="white" icon={crossIcon} />
        </IonButton>

        <IonCardHeader>
          <IonCardTitle>
            <b className={"text-white"}>{t("resetPassword.title")}</b>
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <div className={"icon-block"}>
            <IonIcon icon={key} color="dark" />

            <span className={"mt-4 text-[#ff0000]"}>
              {password !== passwordConfirmation
                ? "Password does not match"
                : ""}
            </span>
          </div>

          <form noValidate onSubmit={handleSubmit}>
            <IonItem color={BACKGROUND_COLOR} className={"mb-12"}>
              <IonLabel position="stacked">
                {t("resetPassword.otpCode")}
              </IonLabel>
              <IonInput
                type="tel"
                name="otpCode"
                maxlength={4}
                placeholder={t("resetPassword.otpCodePlaceholder")}
                required
                value={otpCode}
                onIonChange={({ detail: { value } }) =>
                  setOtpCode(value ? value.trim() : "")
                }
              />
            </IonItem>
            <br />
            <br />

            <IonItem color={BACKGROUND_COLOR}>
              <IonLabel position="stacked">
                {t("resetPassword.newPassword")}
              </IonLabel>
              <IonInput
                type="password"
                name="password"
                placeholder={t("resetPassword.newPasswordPlaceholder")}
                required
                value={password}
                onIonChange={({ detail: { value } }) =>
                  setPassword(value ? value.trim() : "")
                }
              />
            </IonItem>

            <IonItem color={BACKGROUND_COLOR}>
              <IonLabel position="stacked">
                {t("resetPassword.confirmPassword")}
              </IonLabel>
              <IonInput
                type="password"
                name="passwordConfirmation"
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                required
                value={passwordConfirmation}
                onIonChange={({ detail: { value } }) =>
                  setPasswordConfirmation(value ? value.trim() : "")
                }
              />
            </IonItem>

            {sendingCode && (
              <div className="flex my-5 justify-center items-center">
                {/*{isShowRecaptcha && (*/}
                {/*  <div className="g-recaptcha">*/}
                {/*    <GoogleRecaptchaV3*/}
                {/*      setIsResendButtonDisabled={setIsResendButtonDisabled}*/}
                {/*      setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
                {/*      setRecaptchaToken={setRecaptchaToken}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*)}*/}
              </div>
            )}

            <div className={"flex justify-center"}>
              <IonButton
                className="w-100"
                type="submit"
                disabled={
                  !password ||
                  !passwordConfirmation ||
                  password !== passwordConfirmation ||
                  submitting
                }
              >
                {t("resetPassword.header")}
              </IonButton>
              <IonButton
                type="button"
                color="dark"
                disabled={resendTime > 0}
                // disabled={isResendButtonDisabled}
                onClick={async (e) => {
                  setIsRecaptchaVerified(false);
                  setIsShowRecaptcha(false);
                  setRecaptchaToken("");
                  setResendTime(INITIAL_RESEND_TIMEOUT);
                  setSendingCode(true);
                  setIsResendButtonDisabled(true);

                  e.preventDefault();
                  // if (!isRecaptchaVerified || !recaptchaToken) {
                  //   dispatch(setErrorToast("Please check the recaptcha"));
                  //   return;
                  // }
                  setSubmitting(true);
                  let status = await UserManagementService.sendConfirmationCode(
                    profile.phoneNumber,
                    recaptchaToken,
                    true
                  );
                  if (status.data.status === "ok") {
                    dispatch(
                      setSuccessToast("OTP Code resend")
                    );
                  } else {
                    dispatch(
                      setErrorToast("phoneNumberValidation.invalidNumber")
                    );
                  }
                  setSubmitting(false);
                }}
              >
                {t("myProfile.button.resend_code")}{" "}
                {resendTime > 0 ? resendTime : ""}
              </IonButton>
            </div>
          </form>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default ChangePasswordPage;
