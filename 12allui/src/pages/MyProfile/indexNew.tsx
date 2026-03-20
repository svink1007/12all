import React, {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./styles.scss";
import Layout from "../../components/Layout";
import { useTranslation } from "react-i18next";
import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonDatetime,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPopover,
  IonRadio,
  IonRadioGroup,
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
} from "../../redux/actions/toastActions";
import { Routes } from "../../shared/routes";
import SelectLanguage from "../../components/SelectLanguage";
import SelectGenre from "../../components/SelectGenre";
import cameraIcon from "../../images/icons/camera.svg";
import crossIcon from "../../images/icons/cross.svg";
import SelectCountry from "../../components/SelectCountry";
import { caretDown, personCircleOutline } from "ionicons/icons";
import { toISOFormat } from "../WatchParty/Start/DatetimePicker";
import ImageCaptureUpload from "./ImageCaptureUpload";
import {
  setBillingAvatarReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../redux/actions/billingRewardActions";
import BillingPopup from "../../components/Billing/BillingCommonPopup";
import AccountUpdateEmail from "./AccountUpdateEmail";
import { updateStarsBalance } from "../../shared/helpers";
import ConfirmPhoneNumber from "./ConfirmPhoneNumber";

type GenderOption = {
  [key: string]: string;
};

const BACKGROUND_COLOR = "secondary-new";
const INITIAL_RESEND_TIMEOUT = 30;
const genderOptions: GenderOption[] = [
  { M: "male" },
  { F: "female" },
  { O: "other" },
];

const MyProfile: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const billingRewards = useSelector(
    ({ billingRewards }: ReduxSelectors) => billingRewards
  );

  const resendCodeInterval = useRef<NodeJS.Timeout>();
  const isOverEighteenRef = useRef<HTMLIonCheckboxElement>(null);
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const maxDate = useRef(toISOFormat());
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
  const [sendingConfirmationCode, setSendingConfirmationCode] =
    useState<boolean>(false);
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [validPhoneNumber, setValidPhoneNumber] = useState<boolean | null>(
    null
  );
  const [email, setEmail] = useState<string>(profile?.email ?? null);
  const [countryOfResidence, setCountryOfResidence] = useState<string | null>();
  const [birthday, setBirthday] = useState<string>();
  const [location, setLocation] = useState<string | null>();
  const [gender, setGender] = useState<string>();
  const [isGenderModalOpen, setIsGenderModalOpen] = useState<boolean>(false);
  const [about_me, setAbout_Me] = useState<string | null>();
  const [is_private, setIs_private] = useState<boolean>();
  const [isShowAvatar, setIsShowAvatar] = useState<boolean>(false);
  const [getAvatarList, setGetAvatarList] = useState<[]>();
  const [avatar, setAvatar] = useState<string | null>();
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);
  const [showUpdateEmailPopup, setShowUpdateEmailPopup] =
    useState<boolean>(false);
  const [showConfirmPhoneNumberPopup, setShowConfirmPhoneNumberPopup] =
    useState<boolean>(false);

  useIonViewWillEnter(() => {
    UserManagementService.getUserData().then(({ data: { result } }) => {
      const profileData: Partial<Profile> = {
        firstName: result.first_name,
        lastName: result.last_name,
        nickname: result.nickname || result.username,
        phoneNumber: result.phone_number,
        isOverEighteen: result.has_confirmed_is_over_eighteen,
        hasConfirmedPhoneNumber: result.has_confirmed_phone_number,
        countryOfResidence: result.country_of_residence,
        birthday: result.birthday,
        location: result.location,
        gender: result.gender,
        about_me: result.about_me,
        is_private: result.is_private,
        isAnonymous: profile?.isAnonymous || false,
        avatar: result?.avatar ? result.avatar : profile?.avatar,
      };

      // if(!result?.avatar) {
      //   avatarInputRef = null
      // }
      dispatch(setLogin({ ...profileData }));
    });

    if (!getAvatarList) {
      UserManagementService.getAvatarList().then(
        ({ data }: any) => data?.length > 0 && setGetAvatarList(data)
      );
    }
  }, [dispatch]);

  useEffect(() => {
    setFirstName(profile?.firstName);
    setLastName(profile?.lastName);
    setNickname(profile?.nickname);
    setPhoneNumber(profile?.phoneNumber);
    setPreferredLanguage(profile?.preferredLanguage);
    setPreferredGenre(profile?.preferredGenre);
    setCountryOfResidence(profile?.countryOfResidence);
    setBirthday(profile?.birthday);
    setLocation(profile?.location);
    setGender(profile?.gender);
    setAbout_Me(profile?.about_me);
    setIs_private(profile?.is_private);
    setAvatar(profile?.avatar);
  }, [profile]);

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
    console.log("call save button");
    setIsShowAvatar(false);
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
      // email: profile?.email || "",
      countryOfResidence,
      birthday,
      location,
      gender,
      about_me,
      is_private,
      avatar,
    };

    UserManagementService.editProfile(profileData)
      .then(() => {
        dispatch(setLogin(profileData));
        dispatch(setInfoToast(t("myProfile.notifications.successSave")));

        if (profile.avatar === null && profileData.avatar) {
          const eventType = "entry.update";
          const hasUploadedAvatar = true;
          BillingServices.billingAvatarReward(
            profile.id,
            eventType,
            hasUploadedAvatar
          ).then(async ({ data: { result } }) => {
            console.log("avatar uploaded reward", result);
            if (Number(result.billingReward.creditedStars) > 0) {
              const starsBalance = await updateStarsBalance(profile.id);
              dispatch(setTotalStarBalance(starsBalance));
              dispatch(setBillingAvatarReward(result));
              dispatch(setEnableRewardPopup({ isFirstAvatarUploaded: true }));
            }
          });
        } else if (profile.avatar) {
          history.push(Routes.Home);
        }
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
    if (!nickname && !phoneNumber) {
      setErrorToast("Please update your nickname or phone number first.");
      return nickname && phoneNumber;
    } else {
      return nickname && phoneNumber;
    }
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

  const handleOnSelect = (gender: GenderOption) => {
    const value = gender?.M ?? gender?.F ?? gender?.O;
    setGender(value);
    setIsGenderModalOpen(false);
  };

  useEffect(() => {
    if (isRecaptchaVerified && phoneNumber && phoneNumber?.length >= 7) {
      setIsResendButtonDisabled(false);
    } else {
      setIsResendButtonDisabled(true);
    }

    if (codeSent) {
      if (resendTime === 0) {
        setIsResendButtonDisabled(false);
      } else {
        setIsResendButtonDisabled(true);
      }
    }
  }, [isRecaptchaVerified, phoneNumber, resendTime, codeSent]);

  // billing:
  const closeRewardModal = useCallback(() => {
    if (billingRewards.enablePopup.isFirstAvatarUploaded) {
      dispatch(setEnableRewardPopup({ isFirstAvatarUploaded: false }));
      setTimeout(() => {
        setShowRewardPopup(false);
        history.push(Routes.Home);
      }, 2000);
    }
  }, [billingRewards, dispatch, history]);

  useEffect(() => {
    if (billingRewards.enablePopup.isFirstAvatarUploaded) {
      setShowRewardPopup(true);
    }
  }, [billingRewards]);

  // const handleDidPresent = () => {
  //   if (language) {
  //     const streamRow = document.getElementById('language-' + language);
  //     if (streamRow) {
  //       // need setTimeout for smooth scroll
  //       setTimeout(() => streamRow.scrollIntoView({ behavior: 'smooth' }));
  //     }
  //   }
  // }

  const handleCloseUpdateEmailPopup = useCallback(() => {
    setShowUpdateEmailPopup(false);
  }, []);

  const handleDismissConfirmPhoneNumber = () => {
    setShowConfirmPhoneNumberPopup(false);
  };

  const handleEnterPhoneNumberClick = () => {
    setShowConfirmPhoneNumberPopup(true);
  };

  return (
    <>
      {showRewardPopup && <BillingPopup closeRewardModal={closeRewardModal} />}
      {
        <AccountUpdateEmail
          jwt={profile.jwt}
          phoneNumber={phoneNumber}
          handleCloseUpdateEmailPopup={handleCloseUpdateEmailPopup}
          showUpdateEmailPopup={showUpdateEmailPopup}
        />
      }
      {
        <ConfirmPhoneNumber
          isShow={showConfirmPhoneNumberPopup}
          handleDismiss={handleDismissConfirmPhoneNumber}
          notConfirmedPhoneNumber={phoneNumber}
        />
      }
      <Layout className="center lg">
        <IonCard color={BACKGROUND_COLOR} className="my-profile-container">
          <IonButton
            color="transparent"
            className="ion-transparent-button"
            onClick={() => {
              setIsShowAvatar(false);
              history.goBack();
            }}
          >
            <IonIcon slot="icon-only" color="white" icon={crossIcon} />
          </IonButton>
          <IonCardHeader>
            <IonCardTitle>
              {isShowAvatar
                ? t("myProfile.imageCapture.headerAvatar")
                : t("myProfile.header")}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="profile-avatar-div">
              <IonAvatar class="profile-avatar">
                <div
                  className="avatar-backgound"
                  onClick={() => setIsShowAvatar(true)}
                >
                  {avatar ? (
                    <img className="avatar" src={`${avatar}`} alt="avatar" />
                  ) : (
                    <IonIcon icon={personCircleOutline} color="dark" />
                  )}
                </div>
              </IonAvatar>
              {!isShowAvatar && (
                <IonIcon
                  className="camera-icon"
                  name="camera"
                  src={cameraIcon}
                  onClick={() => setIsShowAvatar(true)}
                ></IonIcon>
              )}
            </div>

            {isShowAvatar ? (
              <ImageCaptureUpload
                getAvatarList={getAvatarList}
                avatarInputRef={avatarInputRef}
                setAvatar={setAvatar}
              />
            ) : (
              <IonGrid>
                <form noValidate onSubmit={onSubmit}>
                  <IonRow className="input-item-row-0">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.firstName")}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="firstName"
                          autocomplete="off"
                          placeholder={t("myProfile.fieldLabel.enterFirstName")}
                          // required
                          value={firstName}
                          onIonChange={({ detail: { value } }) =>
                            setFirstName(value ? value.trim() : "")
                          }
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.lastName")}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="lastName"
                          autocomplete="off"
                          placeholder={t("myProfile.fieldLabel.enterLastName")}
                          // required
                          value={lastName}
                          onIonChange={({ detail: { value } }) =>
                            setLastName(value ? value.trim() : "")
                          }
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow className="input-item-row-1">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        {profile.phoneNumber &&
                        profile.hasConfirmedPhoneNumber ? (
                          <>
                            <IonLabel position="floating">
                              {t("myProfile.fieldLabel.phoneRequired")}
                            </IonLabel>
                            <IonInput
                              type="text"
                              name="phoneNumber"
                              autocomplete="off"
                              placeholder={t("signup.enterPhoneNumber")}
                              required
                              // value={phoneNumber}
                              // onIonChange={({ detail: { value } }) =>
                              //   setPhoneNumber(value ? value.trim() : "")
                              // }
                              value={profile.phoneNumber}
                              onIonBlur={validatePhoneNumber}
                              disabled={true}
                            />
                          </>
                        ) : profile.phoneNumber &&
                          !profile.hasConfirmedPhoneNumber ? (
                          <>
                            <IonLabel position="floating">
                              {t("myProfile.fieldLabel.phoneRequired")}
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
                          </>
                        ) : (
                          <IonButton onClick={handleEnterPhoneNumberClick}>
                            {" "}
                            Enter a phone number
                          </IonButton>
                        )}
                      </IonItem>

                      {/* {!profile.hasConfirmedPhoneNumber && (
                        <IonItem
                          color={BACKGROUND_COLOR}
                          lines="none"
                          style={{ marginTop: "20px", width: "340px" }}
                        >
                          <GoogleRecaptchaV3
                            setIsRecaptchaVerified={setIsRecaptchaVerified}
                            setRecaptchaToken={setRecaptchaToken}
                          />
                        </IonItem>
                      )} */}

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
                      ) : validPhoneNumber === false ||
                        !profile.phoneNumber ? null : (
                        <IonText className="phone-number-unconfirmed">
                          {t("phoneNumberValidation.phoneNumberUnconfirmed")}
                          <IonButton onClick={handleEnterPhoneNumberClick}>
                            Confirm
                          </IonButton>
                        </IonText>
                      )}
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      {/* <div hidden={!showValidate}>
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
                      </div> */}

                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.nicknameRequired")}
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
                    </IonCol>
                  </IonRow>

                  <IonRow className="input-item-row-2">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <SelectLanguage
                        language={preferredLanguage}
                        onSelect={setPreferredLanguage}
                        showInput
                        inputLabel="myProfile.fieldLabel.preferredLanguage"
                        inputColor={BACKGROUND_COLOR}
                      />
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                      style={{ marginTop: "-9px" }}
                    >
                      {(!!email && email.includes("@12all.anon")) || email === "" ? (
                        <IonItem>
                          <IonButton
                            className="email-update-button"
                            onClick={() => setShowUpdateEmailPopup(true)}
                          >
                            {t("myProfile.button.updateEmail")}
                          </IonButton>
                        </IonItem>
                      ) : (
                        <IonItem color={BACKGROUND_COLOR}>
                          <IonLabel position="floating">
                            {t("myProfile.fieldLabel.email")}
                          </IonLabel>
                          <IonInput
                            type="text"
                            name="email"
                            autocomplete="off"
                            placeholder={t("signup.enterEmail")}
                            required
                            value={email}
                            onIonChange={({ detail: { value } }) =>
                              setEmail(value ? value.trim() : "")
                            }
                            disabled
                          />
                        </IonItem>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonRow className="input-item-row-3">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <SelectGenre
                        genre={preferredGenre}
                        onSelect={setPreferredGenre}
                        showInput
                        inputLabel="myProfile.fieldLabel.preferredGenre"
                        inputColor={BACKGROUND_COLOR}
                      />
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                      style={{ marginTop: "7px" }}
                    >
                      <SelectCountry
                        country={countryOfResidence}
                        onSelect={setCountryOfResidence}
                        showInput
                        inputLabel="myProfile.fieldLabel.nationality"
                        // inputColor={BACKGROUND_COLOR}
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow className="input-item-row-4">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.birthday")}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="birthday"
                          autocomplete="off"
                          placeholder={t("myProfile.fieldLabel.enterBirthday")}
                          required
                          value={birthday}
                          onClick={() => popoverRef.current?.present()}
                        ></IonInput>
                        <IonPopover ref={popoverRef} keepContentsMounted>
                          <IonDatetime
                            max={maxDate?.current}
                            presentation="date"
                            value={birthday}
                            hourCycle="h23"
                            firstDayOfWeek={1}
                            color="primary"
                            onIonChange={(e) => {
                              const value = Array.isArray(e.detail.value)
                                ? e.detail.value[0]
                                : e.detail.value;
                              setBirthday(value || undefined);
                            }}
                          />
                          <IonButton
                            onClick={() => popoverRef.current?.dismiss()}
                          >
                            {t("common.done")}
                          </IonButton>
                        </IonPopover>
                      </IonItem>
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.location")}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="nickname"
                          autocomplete="off"
                          placeholder={t("myProfile.fieldLabel.enterLocation")}
                          required
                          value={location}
                          onIonChange={({ detail: { value } }) =>
                            setLocation(value ? value.trim() : "")
                          }
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow className="input-item-row-5">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                      style={{ marginTop: "7px" }}
                    >
                      {
                        <IonItem
                          button
                          onClick={() => setIsGenderModalOpen(true)}
                          lines="none"
                          className="language-item"
                          // color={inputColor}
                          detail={false}
                          style={{ borderBottomColor: "#E0007A" }}
                        >
                          <IonLabel
                            position={gender ? "stacked" : "fixed"}
                            color="dark"
                          >
                            {t("myProfile.fieldLabel.gender")}
                          </IonLabel>
                          <IonInput value={gender} readonly />
                          <IonIcon
                            icon={caretDown}
                            slot="end"
                            className="caret-icon"
                          />
                        </IonItem>
                      }

                      <IonModal
                        isOpen={isGenderModalOpen}
                        className="searchable-language-modal"
                        onWillDismiss={() => setIsGenderModalOpen(false)}
                        // onDidPresent={handleDidPresent}
                        keepContentsMounted
                      >
                        <IonRadioGroup
                          // value={gender}
                          onIonChange={(e) => handleOnSelect(e.detail.value)}
                          className="languages-wrapper"
                        >
                          {genderOptions.map((option, index) => (
                            <IonItem
                              key={index}
                              color="light"
                              lines="none"
                              id={`language-${index}`}
                            >
                              <IonRadio slot="start" value={option} />
                              <IonLabel>{Object.values(option)[0]}</IonLabel>
                            </IonItem>
                          ))}
                        </IonRadioGroup>
                      </IonModal>
                    </IonCol>

                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                      style={{ marginTop: "-8px" }}
                    >
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t("myProfile.fieldLabel.noticeAboutMe")}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="noticeAboutMe"
                          autocomplete="off"
                          placeholder={t(
                            "myProfile.fieldLabel.enterNoticeAboutMe"
                          )}
                          value={about_me}
                          onIonChange={({ detail: { value } }) =>
                            setAbout_Me(value ? value.trim() : "")
                          }
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {/* <IonRow className="input-item-row-6">
                <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="5" sizeXl="5">
                  <SelectLanguage
                    // language={preferredLanguage}
                    onSelect={setPreferredLanguage}
                    showInput
                    inputLabel="myProfile.fieldLabel.socialMediaProfile"
                    inputColor={BACKGROUND_COLOR}
                    disabled={true}
                    isMediaProfile={true}
                  />
                </IonCol>
              </IonRow> */}

                  <IonRow className="input-item-row-6">
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
                    >
                      {/* <div hidden={!showValidate}>
                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel position="floating">
                          {t('myProfile.fieldLabel.validationCode')}
                        </IonLabel>
                        <IonInput
                          type="text"
                          name="validationCode"
                          autocomplete="off"
                          placeholder={t('myProfile.fieldLabel.enterValidationCode')}
                          required
                          value={validationCode}
                          onIonChange={({ detail: { value } }) =>
                            setValidationCode(value ? value.trim() : '')
                          }
                        />
                      </IonItem>
                      <IonItem color={BACKGROUND_COLOR} lines="none">
                        <IonButton onClick={submitValidationCode}>
                          {t('myProfile.button.submit_code')}
                        </IonButton>
                      </IonItem>
                    </div> */}

                      <IonItem color={BACKGROUND_COLOR}>
                        <IonLabel>{t("myProfile.fieldLabel.account")}</IonLabel>
                      </IonItem>

                      <IonRadioGroup
                        value={is_private ? "private" : "public"}
                        onIonChange={(e) => {
                          const value =
                            e.detail.value === "private" ? true : false;
                          setIs_private(value);
                        }}
                        className="ion-radio-button"
                      >
                        <IonItem className="radio-public">
                          <IonRadio value="public" slot="start" />
                          <IonLabel>
                            {t("myProfile.fieldLabel.public")}
                          </IonLabel>
                        </IonItem>

                        <IonItem className="radio-private">
                          <IonRadio value="private" slot="start" />
                          <IonLabel>
                            {t("myProfile.fieldLabel.private")}
                          </IonLabel>
                        </IonItem>
                        <IonItem className="approved-user">
                          <IonLabel>
                            {t("myProfile.fieldLabel.approvedUser")}
                          </IonLabel>
                        </IonItem>
                      </IonRadioGroup>

                      <IonItem color={BACKGROUND_COLOR} lines="none">
                        <IonCheckbox
                          ref={isOverEighteenRef}
                          color="tertiary"
                          slot="start"
                          checked={profile.isOverEighteen}
                        />
                        <IonLabel>{t("signup.confirmOver18")}</IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol
                      sizeXs="12"
                      sizeSm="12"
                      sizeMd="12"
                      sizeLg="5"
                      sizeXl="5"
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
                </form>
              </IonGrid>
            )}
            <div className="div-save-button">
              <IonButton
                type="submit"
                className="save-button"
                disabled={!inputIsValid()}
                onClick={onSubmit}
              >
                {t("myProfile.button.save")}
              </IonButton>
              <IonButton
                type="button"
                color="dark"
                onClick={() => {
                  setIsShowAvatar(false);
                  history.push(Routes.Home);
                }}
              >
                {t("common.cancel")}
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </Layout>
    </>
  );
};

export default MyProfile;
