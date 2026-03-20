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
  IonCheckbox,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import { RouteComponentProps } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Profile, ReduxSelectors } from "../../redux/shared/types";
import { setLogin, setLogout } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { BillingServices, UserManagementService } from "../../services";
import {
  setErrorToast,
  setInfoToast,
  setWarnToast,
} from "../../redux/actions/toastActions";
import { Routes } from "../../shared/routes";
import SelectLanguage from "../../components/SelectLanguage";
import SelectGenre from "../../components/SelectGenre";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../redux/actions/billingRewardActions";
import { updateStarsBalance } from "../../shared/helpers";

const BACKGROUND_COLOR = "secondary";
const INITIAL_RESEND_TIMEOUT = 30;

const MyProfile: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const resendCodeInterval = useRef<NodeJS.Timeout>();
  const isOverEighteenRef = useRef<HTMLIonCheckboxElement>(null);

  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [nickname, setNickname] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(
    null
  );
  const [preferredGenre, setPreferredGenre] = useState<string | null>(null);

  const [confirmationText, setConfirmationText] = useState<string>("");
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [validationCode, setValidationCode] = useState<string>("");
  const [sendingConfirmationCode, setSendingConfirmationCode] =
    useState<boolean>(false);
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [showValidate, setShowValidate] = useState<boolean>(false);
  const [validPhoneNumber, setValidPhoneNumber] = useState<boolean | null>(
    null
  );
  // eslint-disable-next-line
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");

  useIonViewWillEnter(() => {
    UserManagementService.getUserData().then(({ data: { result } }) => {
      const profileData: Partial<Profile> = {
        firstName: result.first_name,
        lastName: result.last_name,
        nickname: result.nickname || result.username,
        phoneNumber: result.phone_number,
        isOverEighteen: result.has_confirmed_is_over_eighteen,
        hasConfirmedPhoneNumber: result.has_confirmed_phone_number,
        isAnonymous: profile?.isAnonymous || false,
      };
      dispatch(setLogin({ ...profileData }));
    });
  }, [dispatch]);

  useEffect(() => {
    setFirstName(profile.firstName);
  }, [profile.firstName]);

  useEffect(() => {
    setLastName(profile.lastName);
  }, [profile.lastName]);

  useEffect(() => {
    setNickname(profile.nickname);
  }, [profile.nickname]);

  useEffect(() => {
    setPhoneNumber(profile.phoneNumber);
  }, [profile.phoneNumber]);

  useEffect(() => {
    setPreferredLanguage(profile.preferredLanguage);
  }, [profile.preferredLanguage]);

  useEffect(() => {
    setPreferredGenre(profile.preferredGenre);
  }, [profile.preferredGenre]);

  useIonViewWillLeave(() => {
    if (resendCodeInterval.current) {
      clearInterval(resendCodeInterval.current);
    }
  }, []);

  useEffect(() => {
    if (sendingConfirmationCode) {
      resendCodeInterval.current = setInterval(() => {
        setResendTime((prevState) => prevState - 1);
      }, 1000);
    }

    return () => {
      if (resendCodeInterval.current) {
        clearInterval(resendCodeInterval.current);
      }
    };
  }, [sendingConfirmationCode]);

  useEffect(() => {
    if (resendTime === 0) {
      setSendingConfirmationCode(false);
    }
  }, [resendTime]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!inputIsValid()) {
      return;
    }

    const profileData: Partial<Profile> = {
      firstName,
      lastName,
      phoneNumber,
      nickname,
      preferredGenre,
      preferredLanguage,
      isOverEighteen: isOverEighteenRef.current?.checked,
    };

    UserManagementService.editProfile(profileData)
      .then(() => {
        dispatch(setLogin(profileData));
        dispatch(setInfoToast(t("myProfile.notifications.successSave")));
        history.push(Routes.Home);
      })
      .catch(() =>
        dispatch(setErrorToast("myProfile.notifications.errorSave"))
      );
  };

  const deleteData = () => {
    if (confirmationText === "DELETEMYDATA") {
      UserManagementService.removeProfile()
        .then(() => {
          dispatch(setLogout());
          appStorage.removeItem(StorageKey.Login);
          setTimeout(() => history.push("/home"));
        })
        .catch(() =>
          dispatch(setErrorToast("myProfile.notifications.errorSave"))
        );
    }
  };

  const inputIsValid = () => {
    return firstName && lastName && nickname && phoneNumber;
  };

  const confirmNumber = () => {
    if (!phoneNumber) {
      return;
    }

    setSendingConfirmationCode(true);
    setResendTime(INITIAL_RESEND_TIMEOUT);
    setShowValidate(true);

    UserManagementService.sendConfirmationCode(phoneNumber, recaptchaToken)
      .then(({ data }) => {
        if (data.status === "nok_ip_sent_too_many_requests") {
          dispatch(
            setWarnToast(
              "phoneNumberValidation.confirmationCodeCanNotBeRequested"
            )
          );
          setSendingConfirmationCode(false);
        } else if (data.status === "nok_phone_number_invalid") {
          dispatch(setWarnToast("phoneNumberValidation.invalidNumber"));
          setSendingConfirmationCode(false);
        } else {
          dispatch(setInfoToast("myProfile.notifications.successCodeSent"));
          setCodeSent(true);
        }
      })
      .catch(() =>
        dispatch(setErrorToast("myProfile.notifications.errorSave"))
      );
  };

  const submitValidationCode = () => {
    if (!phoneNumber) {
      return;
    }

    UserManagementService.confirmCode(phoneNumber, validationCode)
      .then(({ data }) => {
        if (data.status === "ok") {
          setCodeSent(false);
          setShowValidate(false);
          dispatch(setInfoToast(t("phoneNumberValidation.numberValidated")));

          dispatch(setLogin({ ...profile, hasConfirmedPhoneNumber: true }));
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
        } else {
          switch (data.message) {
            case "nok_not_valid_code":
              dispatch(setErrorToast("phoneNumberValidation.invalidCode"));
              break;
            case "nok_code_expired":
              dispatch(setErrorToast("phoneNumberValidation.codeExpired"));
              break;
          }
        }
      })
      .catch(() => dispatch(setErrorToast("myProfile.notifications.errorSave")))
      .finally(() => setSendingConfirmationCode(false));
  };

  const validatePhoneNumber = () => {
    if (phoneNumber) {
      UserManagementService.validatePhoneNumber(phoneNumber).then(
        ({ data }) => {
          setValidPhoneNumber(data.status === "ok");
        }
      );
    }
  };

  return (
    <Layout className="center lg">
      <IonCard color={BACKGROUND_COLOR} className="my-profile-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <IonCardHeader>
          <IonCardTitle>{t("myProfile.header")}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="6" sizeXl="6">
                <form noValidate onSubmit={onSubmit}>
                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="floating">
                      {t("myProfile.fieldLabel.firstName")}
                    </IonLabel>
                    <IonInput
                      type="text"
                      name="firstName"
                      autocomplete="off"
                      placeholder={t("myProfile.fieldLabel.enterFirstName")}
                      required
                      value={firstName}
                      onIonChange={({ detail: { value } }) =>
                        setFirstName(value ? value.trim() : "")
                      }
                    />
                  </IonItem>
                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="floating">
                      {t("myProfile.fieldLabel.lastName")}
                    </IonLabel>
                    <IonInput
                      type="text"
                      name="lastName"
                      autocomplete="off"
                      placeholder={t("myProfile.fieldLabel.enterLastName")}
                      required
                      value={lastName}
                      onIonChange={({ detail: { value } }) =>
                        setLastName(value ? value.trim() : "")
                      }
                    />
                  </IonItem>

                  <SelectLanguage
                    language={preferredLanguage}
                    onSelect={setPreferredLanguage}
                    showInput
                    inputLabel="myProfile.fieldLabel.preferredLanguage"
                    inputColor={BACKGROUND_COLOR}
                  />

                  <SelectGenre
                    genre={preferredGenre}
                    onSelect={setPreferredGenre}
                    showInput
                    inputLabel="myProfile.fieldLabel.preferredGenre"
                    inputColor={BACKGROUND_COLOR}
                  />

                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="floating">
                      {t("myProfile.fieldLabel.phoneNumber")}
                    </IonLabel>
                    <IonInput
                      type="text"
                      name="phoneNumber"
                      autocomplete="off"
                      placeholder={t("signup.enterPhoneNumber")}
                      required
                      value={phoneNumber}
                      onIonChange={({ detail: { value } }) =>
                        setPhoneNumber(value ? value.trim() : "")
                      }
                      onIonBlur={validatePhoneNumber}
                    />
                  </IonItem>

                  {!profile.hasConfirmedPhoneNumber &&
                    validPhoneNumber === false && (
                      <IonText color="danger" className="invalid-message">
                        {t("signup.enterValidPhoneNumber")}
                      </IonText>
                    )}

                  {profile.hasConfirmedPhoneNumber ? (
                    <IonText className="phone-number-confirmed">
                      {t("phoneNumberValidation.phoneNumberConfirmed")}
                    </IonText>
                  ) : validPhoneNumber === false ? null : (
                    <IonItem color={BACKGROUND_COLOR} lines="none">
                      <IonButton
                        onClick={confirmNumber}
                        disabled={sendingConfirmationCode}
                        color={codeSent ? "dark" : "primary"}
                      >
                        {codeSent
                          ? `${t("myProfile.button.resend_code")} ${
                              resendTime ? resendTime : ""
                            }`
                          : t("myProfile.button.confirm_number")}
                      </IonButton>
                    </IonItem>
                  )}

                  <div hidden={!showValidate}>
                    <IonItem color={BACKGROUND_COLOR}>
                      <IonLabel position="floating">
                        {t("myProfile.fieldLabel.validationCode")}
                      </IonLabel>
                      <IonInput
                        type="text"
                        name="validationCode"
                        autocomplete="off"
                        placeholder={t(
                          "myProfile.fieldLabel.enterValidationCode"
                        )}
                        required
                        value={validationCode}
                        onIonChange={({ detail: { value } }) =>
                          setValidationCode(value ? value.trim() : "")
                        }
                      />
                    </IonItem>
                    <IonItem color={BACKGROUND_COLOR} lines="none">
                      <IonButton onClick={submitValidationCode}>
                        {t("myProfile.button.submit_code")}
                      </IonButton>
                    </IonItem>
                  </div>

                  <IonItem color={BACKGROUND_COLOR}>
                    <IonLabel position="floating">
                      {t("myProfile.fieldLabel.nickname")}
                    </IonLabel>
                    <IonInput
                      type="text"
                      name="nickname"
                      autocomplete="off"
                      placeholder={t("signup.enterNickname")}
                      required
                      value={nickname}
                      onIonChange={({ detail: { value } }) =>
                        setNickname(value ? value.trim() : "")
                      }
                    />
                  </IonItem>

                  <IonItem color={BACKGROUND_COLOR} lines="none">
                    <IonCheckbox
                      ref={isOverEighteenRef}
                      color="tertiary"
                      slot="start"
                      checked={profile.isOverEighteen}
                    />
                    <IonLabel>{t("signup.confirmOver18")}</IonLabel>
                  </IonItem>

                  <IonButton
                    type="submit"
                    className="save-button"
                    disabled={!inputIsValid()}
                  >
                    {t("myProfile.button.save")}
                  </IonButton>
                  <IonButton
                    type="button"
                    color="dark"
                    onClick={() => history.push("/home")}
                  >
                    {t("common.cancel")}
                  </IonButton>
                </form>
              </IonCol>
              <IonCol
                sizeXs="12"
                sizeSm="12"
                sizeMd="12"
                sizeLg="6"
                sizeXl="6"
                className="delete-data-col"
              >
                <IonText className="delete-text-box">
                  {t("myProfile.deleteData")}
                </IonText>
                <IonItem color={BACKGROUND_COLOR}>
                  <IonLabel position="floating">
                    {t("myProfile.typeDeleteMyData")} "DELETEMYDATA"
                  </IonLabel>
                  <IonInput
                    type="text"
                    name="confirmationText"
                    autocomplete="off"
                    required
                    value={confirmationText}
                    onIonChange={({ detail: { value } }) =>
                      setConfirmationText(value ? value.trim() : "")
                    }
                  />
                </IonItem>
                <IonButton
                  className="delete-data-button"
                  disabled={confirmationText !== "DELETEMYDATA"}
                  onClick={deleteData}
                >
                  {t("myProfile.button.delete")}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default MyProfile;
