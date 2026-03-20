import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonPage,
  IonText,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from "@ionic/react";
import { RouteComponentProps } from "react-router";
import { useTranslation } from "react-i18next";
import { Ad } from "capacitor-ad-plugin";

import "./styles.scss";

import { setProfile } from "../../redux/actions/profileActions";
import { useDispatch, useSelector } from "react-redux";
import { Routes } from "../../shared/routes";
import { ReceiveCodeVia, ReduxSelectors } from "../../redux/types";
import Loader from "../../components/Loader";
import { setErrorToast } from "../../redux/actions/toastActions";
import { UserManagementService } from "../../services";
import appStorage, { StorageKey } from "../../shared/appStorage";
import BaseService from "../../services/BaseService";
import { MOBILE_VIEW } from "../../shared/constants";
import addSmartlookShow from "../../shared/methods/addSmartlookShow";

import logo from "../../images/12all-logo-168.svg";
import Close from "../../images/settings/close.svg";
import { BillingServices } from "../../services/BillingServices";
import { setTotalStarBalance } from "../../redux/actions/billingRewardActions";

const INITIAL_RESEND_VALUE = 30;

const ConfirmCodePage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { prevUrl } = useSelector(({ route }: ReduxSelectors) => route);
  const code1Ref = useRef<HTMLIonInputElement>(null);
  const code2Ref = useRef<HTMLIonInputElement>(null);
  const code3Ref = useRef<HTMLIonInputElement>(null);
  const code4Ref = useRef<HTMLIonInputElement>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const [resend, setResend] = useState<number>(INITIAL_RESEND_VALUE);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendCode = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }

    setResend(INITIAL_RESEND_VALUE);

    interval.current = setInterval(
      () =>
        setResend((prevState) => {
          if (prevState > 0) {
            return prevState - 1;
          } else {
            return 0;
          }
        }),
      1000
    );

    if (profile.codeProvider === ReceiveCodeVia.Sms) {
      UserManagementService.sendConfirmationCodeViaSms(
        profile.phoneNumber,
        "",
        profile.countryOfResidence,
        true
      )
        .then(({ data }) => {
          if (data.status === "nok_ip_sent_too_many_requests") {
            dispatch(
              setErrorToast("notifications.confirmationCodeCanNotBeRequested")
            );
          }
        })
        .catch(() =>
          dispatch(
            setErrorToast(
              "notifications.unexpectedErrorWhileSendingConfirmationCode"
            )
          )
        );
    } else {
      UserManagementService.sendConfirmationCodeViaCall(
        profile.phoneNumber,
        "",
        true
      ).catch(() =>
        dispatch(
          setErrorToast(
            "notifications.unexpectedErrorWhileSendingConfirmationCode"
          )
        )
      );
    }
  }, [
    dispatch,
    profile.phoneNumber,
    profile.codeProvider,
    profile.countryOfResidence,
  ]);

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData?.getData("text");
    if (paste && paste.length === 4) {
      code1Ref.current!.value = paste[0];
      code2Ref.current!.value = paste[1];
      code3Ref.current!.value = paste[2];
      code4Ref.current!.value = paste[3];
    }
  };

  useEffect(() => {
    code1Ref.current?.getInputElement().then((inputElement) => {
      addSmartlookShow(inputElement);
      inputElement.addEventListener("paste", handlePaste);
    });
    code2Ref.current?.getInputElement().then((inputElement) => {
      addSmartlookShow(inputElement);
      inputElement.addEventListener("paste", handlePaste);
    });
    code3Ref.current?.getInputElement().then((inputElement) => {
      addSmartlookShow(inputElement);
      inputElement.addEventListener("paste", handlePaste);
    });
    code4Ref.current?.getInputElement().then((inputElement) => {
      addSmartlookShow(inputElement);
      inputElement.addEventListener("paste", handlePaste);
    });

    handleSendCode();

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    dispatch(setProfile({ ...profile, recaptchaToken: "" }));
  }, []);

  useIonViewWillEnter(() => {
    console.log("ConfirmCode: Checking phone number:", profile.phoneNumber);
    console.log("ConfirmCode: Profile data:", {
      phoneNumber: profile.phoneNumber,
      nickname: profile.nickname,
      countryOfResidence: profile.countryOfResidence,
      codeProvider: profile.codeProvider,
    });

    if (!profile.phoneNumber) {
      console.log("ConfirmCode: No phone number found, redirecting to login");
      history.replace(Routes.Login);
    } else {
      console.log("ConfirmCode: Phone number found, proceeding");
    }
  }, [history, profile.phoneNumber]);

  useIonViewDidEnter(() => {
    code1Ref.current?.setFocus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !code1Ref.current?.value ||
      !code2Ref.current?.value ||
      !code3Ref.current?.value ||
      !code4Ref.current?.value ||
      loading
    ) {
      return;
    }

    const validationCode = `${code1Ref.current.value}${code2Ref.current.value}${code3Ref.current.value}${code4Ref.current.value}`;
    console.log(
      "Confirming OTP:",
      profile.phoneNumber,
      validationCode,
      profile.nickname
    );

    // Validate that we have all required data
    if (!profile.phoneNumber || !profile.nickname) {
      console.error("Missing required data for OTP confirmation:", {
        phoneNumber: profile.phoneNumber,
        nickname: profile.nickname,
      });
      dispatch(setErrorToast("Missing required data. Please try again."));
      return;
    }

    setLoading(true);

    const execute = async () => {
      try {
        const {
          data: { status, message },
        } = await UserManagementService.confirmCode(
          profile.phoneNumber,
          validationCode,
          profile.nickname
        );

        console.log("OTP confirmation response:", { status, message });

        if (status === "ok") {
          // Don't clear the interval here - let it continue running
          // Only clear it on successful login

          // Add a small delay before app login to ensure backend processing is complete
          setTimeout(() => {
            UserManagementService.appLogin(
              profile.phoneNumber,
              profile.countryOfResidence,
              profile.nickname
            )
              .then(async ({ data }) => {
                if (data.status === "ok") {
                  // Only clear the interval on successful login
                  if (interval.current) {
                    clearInterval(interval.current);
                    interval.current = null;
                  }

                  const confirmed = data.confirmed;
                  const user = confirmed?.user;
                  appStorage
                    .setObject(StorageKey.Login, {
                      token:
                        confirmed?.user.auth_tokens &&
                        confirmed?.user.auth_tokens.length > 0
                          ? confirmed?.user.auth_tokens[0].token
                          : "",
                      jwtToken: confirmed?.jwtToken,
                      phoneNumber: confirmed?.user.phone_number,
                    })
                    .then();

                  BaseService.setAuth({
                    token:
                      confirmed?.user.auth_tokens &&
                      confirmed?.user.auth_tokens.length > 0
                        ? confirmed?.user.auth_tokens[0].token
                        : "",
                    phoneNumber: confirmed?.user.phone_number as string,
                    jwtToken: confirmed?.jwtToken,
                  });

                  if (user) {
                    const {
                      avatar,
                      country_of_residence,
                      preferred_language,
                      preferred_genre,
                      gender,
                      premium_status,
                      has_confirmed_is_over_eighteen,
                      show_debug_info,
                      id,
                      email,
                    } = user;

                    dispatch(
                      setProfile({
                        id,
                        avatar,
                        countryOfResidence: country_of_residence,
                        preferredLanguage: preferred_language,
                        gender,
                        preferredGenre: preferred_genre,
                        premium: premium_status,
                        isOverEighteen: has_confirmed_is_over_eighteen,
                        token:
                          confirmed?.user.auth_tokens &&
                          confirmed?.user.auth_tokens.length > 0
                            ? confirmed?.user.auth_tokens[0].token
                            : "",
                        showDebugInfo: show_debug_info || false,
                        jwtToken: confirmed.jwtToken,
                        phoneNumber: confirmed.user.phone_number,
                        isAnonymous: !email
                          ? false
                          : email.includes("@skiplogin.com")
                            ? true
                            : false,
                      })
                    );

                    BillingServices.billingStarBalance(user.id).then(
                      ({ data }) => {
                        if (data) {
                          dispatch(setTotalStarBalance(data));
                        }
                      }
                    );
                  }
                  history.replace(prevUrl || Routes.Broadcasts);
                } else {
                  console.error("App login failed:", data);
                  dispatch(
                    setErrorToast(
                      data.error?.message || "Login failed. Please try again."
                    )
                  );
                  // Don't clear the interval - let the resend timer continue
                }
              })
              .catch((error) => {
                console.error("App login error:", error);
                dispatch(setErrorToast("Login failed. Please try again."));
                // Don't clear the interval - let the resend timer continue
              });
          }, 1000); // 1 second delay

          if (MOBILE_VIEW) {
            Ad.getAdId().then(({ id }) =>
              UserManagementService.updateAdvertisingId(id)
            );
          }
        } else if (status === "nok") {
          console.error("OTP confirmation failed:", message);
          if (message === "nok_not_valid_code") {
            dispatch(
              setErrorToast("Invalid code. Please check and try again.")
            );
          } else {
            dispatch(
              setErrorToast(message || "Verification failed. Please try again.")
            );
          }
          // Don't clear the interval - let the resend timer continue
        }
      } catch (error) {
        console.error("OTP confirmation error:", error);
        dispatch(
          setErrorToast(
            "Network error. Please check your connection and try again."
          )
        );
        // Don't clear the interval - let the resend timer continue
      } finally {
        setLoading(false);
      }
    };

    execute();
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="code-page">
        <Loader show={loading} />

        <div className="flex justify-center relative w-full mt-8">
          <IonImg src={Close} className="close" onClick={handleGoBack} />
          <IonImg src={logo} className="logo"></IonImg>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <IonText className="header" color="medium">
            {t(
              profile.codeProvider === ReceiveCodeVia.Sms
                ? "code.verificationCodeSend"
                : "code.receiveCallWithVerificationCode"
            )}{" "}
            +{profile.phoneNumber}. <br /> {t("code.enterItBellow")}
          </IonText>
          <IonItem lines="none" className="verification-item">
            <div className="flex">
              <IonInput
                ref={code1Ref}
                inputmode="numeric"
                name="code1"
                maxlength={1}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (value) {
                    code2Ref.current?.setFocus();
                  }
                }}
              />

              <IonInput
                ref={code2Ref}
                inputmode="numeric"
                name="code2"
                maxlength={1}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (value) {
                    code3Ref.current?.setFocus();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value) {
                    code1Ref.current?.setFocus();
                  }
                }}
              />

              <IonInput
                ref={code3Ref}
                inputmode="numeric"
                name="code3"
                maxlength={1}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (value) {
                    code4Ref.current?.setFocus();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value) {
                    code2Ref.current?.setFocus();
                  }
                }}
              />

              <IonInput
                ref={code4Ref}
                inputmode="numeric"
                name="code4"
                maxlength={1}
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (value) {
                    // Maybe trigger submit here or set focus to the submit button
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value) {
                    code3Ref.current?.setFocus();
                  }
                }}
              />
            </div>
          </IonItem>

          <div className="button-group">
            <IonButton
              type="submit"
              expand="block"
              shape="round"
              className="verify-btn"
            >
              {t("code.verify")}
            </IonButton>
            <IonButton
              expand="block"
              color="dark"
              disabled={resend > 0}
              onClick={handleSendCode}
              shape="round"
              className="resend-btn"
            >
              {t(
                profile.codeProvider === ReceiveCodeVia.Sms
                  ? "code.send"
                  : "code.call"
              )}{" "}
              {resend > 0 ? resend : null}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmCodePage;
