import {useRef, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonIcon,
  IonItem,
  IonLabel,
  IonLoading, IonRouterLink,
} from "@ionic/react";

import "./styles.scss";

import SelectCountryCode from "../../Login_v2/SelectInputCountry";
import type { SelectCountryCodeRef } from "../../Login_v2/SelectInputCountry";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import ConfirmPhoneNumberFormNew from "../../SignUp/ConfirmPhoneNumberFormNew";
import { EMAIL_REGEX } from "../../../shared/constants";
import { useDispatch } from "react-redux";
import {
  AuthService,
  BillingServices,
  SkipLogin,
  UserManagementService,
} from "../../../services";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { useHistory, useLocation } from "react-router";
import { Routes } from "../../../shared/routes";
import LocationState from "../../../models/LocationState";

import leftArrowIcon from "../../../images/icons/leftArrow.svg";
import Layout from "../../../components/Layout";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../../../shared/types";
import { Profile } from "../../../redux/shared/types";
import { setLogin } from "../../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../../shared/appStorage";

type Email = {
  value?: string | "";
  valid: boolean;
  touched: boolean;
};

const EMAIL_INITIAL = {
  value: "",
  valid: false,
  touched: false,
};

const SignUp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { state } = location;

  // console.log(state);

  const [countryCode, setCountryCode] = useState("");
  const [userData, setUserData] = useState({
    phoneNumber: "",
    email: EMAIL_INITIAL,
    nickname: "",
    password: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [is18Confirmed, setIs18Confirmed] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const onChange = (e: any) => {
    if (e.target.name === "email") {
      const valid = EMAIL_REGEX.test(e.target.value);
      setUserData({
        ...userData,
        [e.target.name]: {
          value: e.target.value,
          valid,
          touched: true,
        },
      });
    } else {
      setUserData({ ...userData, [e.target.name]: e.target.value });
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggle18Confirmed = () => {
    setIs18Confirmed((prev) => !prev);
  };

  const onSubmit = async () => {
    if (!countryCode || !userData.phoneNumber || !userData.nickname || !userData.password) {
      dispatch(setErrorToast("Please check your inputs"));
      return;
    }

    // if (!is18Confirmed) {
    //   dispatch(
    //     setErrorToast("You must confirm that you are over 18 years old.")
    //   );
    //   return;
    // }

    try {
      let isPhoneNumberExist = await AuthService.findUser(countryCode + userData.phoneNumber);
      if (isPhoneNumberExist.data.existing === true) {
        dispatch(setErrorToast("Phone Number is already existed. Please use different one."))
      } else {
        let isNicknameExist = await AuthService.findUser(userData.nickname);
        if (isNicknameExist.data.existing === true) {
          dispatch(setErrorToast("This nickname is already existed. Please use different one."));
        } else {
          setShowStep2(true);
          await sendConfirmationCode(
            countryCode + userData.phoneNumber,
            recaptchaToken
          );
        }
      }

    } catch (err) {
      dispatch(setErrorToast("Error occurred while sending the SMS code"));
    }
  };

  const sendConfirmationCode = (
    phoneNumber: string,
    recaptchaToken: string
  ) => {
    UserManagementService.sendConfirmationCode(phoneNumber, recaptchaToken, false, true)
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
        // setLoading(false)
        // setIsLoginDisabled(true)
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
        // console.log("send confirm code via call", data);
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
        // setLoading(false)
        // setIsLoginDisabled(true)
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

  const saveProfile = ({ data }: any) => {
    const loginData: Profile = {
      jwt: data.response.jwt,
      id: data.response.user.id,
      email: data.response.user.email,
      nickname: data.response.user.nickname || data.response.user.username,
      firstName: data.response.user.first_name,
      lastName: data.response.user.last_name,
      phoneNumber: data.response.user.phone_number,
      preferredLanguage: data.response.user.preferred_language,
      preferredGenre: data.response.user.preferred_genre,
      isOverEighteen: data.response.user.has_confirmed_is_over_eighteen,
      hasConfirmedPhoneNumber: data.response.user.has_confirmed_phone_number,
      showDebugInfo: data.response.user.show_debug_info || false,
      isAnonymous: data.response.user.isAnonymous || false,
      avatar: data.response.user.avatar,
    };

    dispatch(setLogin(loginData));
    appStorage.setObject(StorageKey.Login, { jwt: data.response.jwt });
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

  const [loading, setLoading] = useState<boolean>(false);

  const handleSkip = async () => {
    const state = location.state as LocationState | undefined;
    setLoading(true);
    try {
      const response = await SkipLogin.getLogin();
      if (response.data.status === "ok") {
        saveProfile(response);
      }
      else{
        if(response.data.message === "provide_nickname"){
          history.replace(Routes.Skip + "?next=" + (state?.redirectTo ? state.redirectTo: Routes.Home));
        }
        else{
          dispatch(setErrorToast(response.data.message));
        }
      }
    } catch (err) {
      dispatch(setErrorToast("login.invalid"));
    }
    finally {
      setLoading(false);
    }
  };

  const countryCodeRef = useRef<SelectCountryCodeRef | null>(null);

  const openSelectCode = () => {
    if (countryCodeRef.current) {
      countryCodeRef.current.focus();
    }
  };

  return (
    <>
      {!showStep2 ? (
        <div className="w-full bg-[#662C4B] border px-10 py-8 rounded-lg signup-container overflow-y-scroll">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm">Phone number*</p>
            <div className="flex gap-2">
              <SelectCountryCode
                ref={countryCodeRef}
                onSelect={(value) => {
                  openSelectCode()
                  setCountryCode(value.countryCode)
                }}
                inputPlaceholder={t("login.countryCode")}
                disabled={false}
                className="h-10 bg-white border text-[#a5a5a5] w-20 rounded"
              />
              <input
                className="flex-1 h-10 bg-white border text-[#a5a5a5] rounded pl-2"
                name="phoneNumber" type={"number"}
                value={userData.phoneNumber}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="flex flex-col mt-3 gap-1.5">
            <p className="text-sm">Backup Email</p>
            <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              name="email"
              value={userData.email.value}
              onChange={onChange}
            />
          </div>
          <div className="flex flex-col mt-3 gap-1.5">
            <p className="text-sm">Nickname*</p>
            <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              name="nickname"
              value={userData.nickname}
              onChange={onChange}
            />
          </div>
          <div className="flex flex-col mt-3 gap-1.5">
            <p className="text-sm">Password*</p>
            <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              name="password"
              value={userData.password}
              onChange={onChange}
              type={isPasswordVisible ? "text" : "password"}
            />
          </div>

          <IonItem>
            <IonCheckbox
              slot="start"
              checked={isPasswordVisible}
              onIonChange={togglePasswordVisibility}
            ></IonCheckbox>
            <IonLabel>Show password</IonLabel>
          </IonItem>
          {/*<IonItem>*/}
          {/*  <IonCheckbox*/}
          {/*    slot="start"*/}
          {/*    checked={is18Confirmed}*/}
          {/*    onIonChange={toggle18Confirmed}*/}
          {/*  ></IonCheckbox>*/}
          {/*  <IonLabel>I confirm that I am over 18 years old</IonLabel>*/}
          {/*</IonItem>*/}

          <IonLoading isOpen={loading}/>

          <div className="flex justify-center mt-6">
            {/*<GoogleRecaptchaV3*/}
            {/*  setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
            {/*  setRecaptchaToken={setRecaptchaToken}*/}
            {/*/>*/}
          </div>

          <div className="flex w-full mt-6">
            <p className={"!text-[0.85rem]"}>
              By signing up, you agree to our Terms of Use and to receive
              12all.tv emails and updates, and acknowledge that you read our
              Privacy Policy. You also acknowledge that 12all.tv uses cookies to
              give the best user experience. <br/>
              Learn more from our <IonRouterLink routerLink={Routes.TermsAndConditions}>Terms of use</IonRouterLink>{' '}
              and <IonRouterLink routerLink={Routes.PrivacyPolicy}>Privacy policy</IonRouterLink>
            </p>
          </div>

          <div className="flex justify-center mt-10 gap-4">
            <div
              className="text-lg uppercase text-white py-2 px-8 bg-gradient-to-r from-[#AE00B3] to-[#D50087] bg-transparent rounded-xl hover:cursor-pointer"
              onClick={onSubmit}
            >
              SUBMIT
            </div>
            <div className="text-lg uppercase text-white py-2 px-8 bg-transparent border border-[#D4D4D4] rounded-xl hover:cursor-pointer" onClick={handleSkip}>
              SKIP
            </div>
          </div>
        </div>
      ) : (
        <Layout className="center md">
          <IonCard color="secondary" className="signup-card">
            <IonCardHeader className="signup-otp-back-button">
              {showStep2 && (
                <IonIcon
                  src={leftArrowIcon}
                  className="back-button"
                  onClick={() => {
                    window.location.reload();
                  }}
                />
              )}
              <IonCardTitle>
                {t(!showStep2 ? "signup.header" : "signup.headerStep2")}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <ConfirmPhoneNumberFormNew
                combinedPhoneNumber={countryCode + userData.phoneNumber}
                recaptchaToken={recaptchaToken}
                openModal={openModal}
                email={userData.email}
                nickname={userData.nickname}
                username={userData.nickname}
                password={userData.password}
                isOverEighteen={is18Confirmed}
                onResendConfirmationCode={sendConfirmationCode}
                sendConfirmationCodeViaCall={sendConfirmationCodeViaCall}
                handleLocationState={handleLocationState}
                setRecaptchaToken={setRecaptchaToken}
                setShowStep2={setShowStep2}
                setIsRecaptchaVerified={setIsRecaptchaVerified}
                setOpenModal={setOpenModal}
              />
            </IonCardContent>
          </IonCard>
        </Layout>
      )}
    </>
  );
};

export default SignUp;
