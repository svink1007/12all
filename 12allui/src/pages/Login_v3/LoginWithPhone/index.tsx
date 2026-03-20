import React, {useEffect, useRef, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {IonItem, IonLabel, IonLoading, IonRadio, IonRadioGroup} from "@ionic/react";

import "./styles.scss";
import SelectCountryCode, { SelectCountryCodeRef } from "../../Login_v2/SelectInputCountry";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import { AuthService, BillingServices, SkipLogin, UserManagementService } from "../../../services";
import {
  setErrorToast,
  setInfoToast,
} from "../../../redux/actions/toastActions";
import { Routes } from "../../../shared/routes";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { updateStarsBalance } from "../../../shared/helpers";
import { setLogin } from "../../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../../shared/appStorage";
import LocationState from "../../../models/LocationState";
import {
  Profile,
  ReduxSelectors,
  SignupDataUsingPhone,
} from "../../../redux/shared/types";
import ConfirmPhoneNumber from "../../MyProfile/ConfirmPhoneNumber";

const LoginWithPhone = ({
                          setIsLoginorSignUp
                        }: {
  setIsLoginorSignUp: (isLoginOrSignUp: boolean) => void;
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [countryCode, setCountryCode] = useState("");
  const [inputData, setInputData] = useState({
    identifier: "",
    password: "",
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [isForgotPasswordClicked, setIsForgotPasswordClicked] =
    useState<boolean>(false);
  const [showSecondStep, setShowSecondStep] = useState<boolean>(false);
  const [showConfirmPhoneNumberPopup, setShowConfirmPhoneNumberPopup] =
    useState(false);

  const onChange = (e: any) => {
    if (e.target.name === "phoneNumber") {
      setInputData({ ...inputData, identifier: e.target.value });
    } else {
      setInputData({ ...inputData, [e.target.name]: e.target.value });
    }
    setError(false);
  };

  const saveProfile = ({ data }: any) => {
    const loginData: Profile = {
      jwt: data.response.jwt,
      id: data.response.user.id,
      email: data.response.user.email,
      username: data.response.user.username,
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

  const saveProfile_confirm = (jwtToken: string, user: any) => {
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
    appStorage.setObject(StorageKey.Login, { jwt: jwtToken });

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

    handleLocationState();
  };

  const handleLocationState = () => {
    const state = location.state as LocationState | undefined;
    if (state?.redirectTo) {
      history.replace(state.redirectTo);
    } else {
      history.replace(Routes.Home);
    }
  };

  const handleDismissConfirmPhoneNumber = () => {
    setShowConfirmPhoneNumberPopup(false);
  };

  const [otpMethod, setOtpMethod] = useState('sms');

  const handleLoginSubmit = async (e: any) => {
    try {
      if (!isForgotPasswordClicked && (!inputData.identifier || !inputData.password)) {
        dispatch(setErrorToast("Please check your inputs"));
        return;
      }

      if (isForgotPasswordClicked && inputData.identifier && !inputData.password) {
        setLoading(true);
        let status = otpMethod === 'sms' ? await UserManagementService.sendConfirmationCode(countryCode + inputData.identifier, recaptchaToken) : await UserManagementService.sendConfirmationCodeViaCall(countryCode + inputData.identifier, recaptchaToken);
        if (status.data.status === "ok") {
          setShowSecondStep(true)
          setShowConfirmPhoneNumberPopup(true);
        }
        else if (status.data.status === "nok") {
          setError(true)
          dispatch(setErrorToast(
              status.data.message
          ))
        }
        else if (status.data.status === "nok_ip_sent_too_many_requests") {
          dispatch(
            setErrorToast(
              "phoneNumberValidation.confirmationCodeCanNotBeRequested"
            )
          );
          setShowSecondStep(false);
        } else if (status.data.status === "nok_phone_number_invalid") {
          dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
          setShowSecondStep(false);
        }
        setLoading(false);
      }
      if (isForgotPasswordClicked && !inputData.identifier) {
        dispatch(setErrorToast("Please input the phone number"));
        return;
      } else if (inputData.identifier && inputData.password) {
  
        // if (!isRecaptchaVerified || !recaptchaToken) {
        //   dispatch(setErrorToast("Please check the recaptcha"));
        //   return;
        // }
  
        const data = await AuthService.login({
          identifier: countryCode + inputData.identifier,
          password: inputData.password,
        });
        await saveProfile(data);
      }
    } catch (err) {
      dispatch(setErrorToast("login.invalid"));
    }
  };

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

  const appLogin = async () => {
    const loginData: SignupDataUsingPhone = {
      nickname: "" as string,
      phoneNumber: (countryCode + inputData.identifier) as string,
      countryName: "",
      isCallFrom: "WEB_LOGIN",
    };

    let {data} = await AuthService.loginWithPhone(loginData);
    const { status } = data;
    const confirmed = data.confirmed;
    const user = confirmed?.user;

    if (status === "ok") {
      dispatch(
        setInfoToast("phoneNumberValidation.phoneNumberConfirmed")
      );

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
        isOverEighteen: user?.has_confirmed_is_over_eighteen as boolean,
        hasConfirmedPhoneNumber:
          user?.has_confirmed_phone_number as boolean,
        showDebugInfo: user?.show_debug_info || false,
        isAnonymous: user?.isAnonymous || false,
        avatar: user?.avatar,
      };

      dispatch(setLogin(loginData));

      saveProfile_confirm(confirmed?.jwtToken as string, user);

      dispatch(setLogin({ hasConfirmedPhoneNumber: true }));
        appStorage.setObject(StorageKey.Login, {
          jwt: confirmed?.jwtToken as string,
        });

      history.replace(Routes.Home);
      return;
    }
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const countryCodeRef = useRef<SelectCountryCodeRef | null>(null);

  const openSelectCode = () => {
    if (countryCodeRef.current) {
      countryCodeRef.current.focus();
    }
  };

  return (
      <div
          className="w-full bg-[#662C4B] border border-t-0 px-10 py-8 rounded-b-lg login-with-phone-container overflow-y-scroll">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm">Phone number</p>
          <div className="flex gap-2">
            <SelectCountryCode
                ref={countryCodeRef}
                onSelect={(value) => setCountryCode(value.countryCode)}
                inputPlaceholder={t("login.countryCode")}
                disabled={false}
                className="h-10 bg-white border text-[#a5a5a5] w-20 rounded"
            />
            <input
                className="flex-1 h-10 bg-white border text-[#a5a5a5] rounded pl-2"
                name="phoneNumber" type={"number"}
                onChange={onChange}
                value={inputData.identifier}
            />
          </div>
        </div>
        <div className="flex flex-col mt-3 gap-1.5">
          <p className="text-sm">Password</p>
          <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              type="password"
              name="password"
              value={inputData.password}
              onChange={onChange}
          />
        </div>
        <IonLoading isOpen={loading}/>
        <div
            className="flex justify-center mt-4"
            onClick={() => setIsForgotPasswordClicked(!isForgotPasswordClicked)}
        >
          <p className="text-sm cursor-pointer">Forgot Password?</p>
        </div>
        {isForgotPasswordClicked && (
            <div className="flex flex-col gap-3 mt-6">
              <p className="text-sm">Receive One Time Password (OTP) via:</p>
              <IonRadioGroup
                  value={otpMethod}
                  onIonChange={(e) => setOtpMethod(e.detail.value)}
                  className="flex gap-10 text-white"
              >
                <IonItem lines="none" className="bg-transparent">
                  <IonRadio value="sms" slot="start" />
                  <IonLabel>SMS</IonLabel>
                </IonItem>
                <IonItem lines="none" className="bg-transparent">
                  <IonRadio value="call" slot="start" />
                  <IonLabel>Call</IonLabel>
                </IonItem>
              </IonRadioGroup>
            </div>
        )}
        <div className="flex justify-center mt-6">
          {/*<GoogleRecaptchaV3*/}
          {/*    setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
          {/*    setRecaptchaToken={setRecaptchaToken}*/}
          {/*/>*/}
        </div>

        <div className={"mt-5 pt-3 w-100 " + (error ? "visible" : "hidden")} style={{transition: "all 0.5s ease"}}>
          <p className="text-sm text-center text-white">
            Don't have an account? <b className="font-bold text-[#E91E63] cursor-pointer" onClick={() => {
            setIsLoginorSignUp(false)
          }}>Sign up</b>
          </p>
        </div>

        <div className="flex justify-center mt-10 gap-4">
          <div
              className="text-lg uppercase text-white py-2 px-8 bg-gradient-to-r from-[#AE00B3] to-[#D50087] bg-transparent rounded-xl hover:cursor-pointer"
              onClick={handleLoginSubmit}
          >
            LOGIN
          </div>
          <div
              className="text-lg uppercase text-white py-2   px-8 bg-transparent border border-[#D4D4D4] rounded-xl hover:cursor-pointer"
              onClick={handleSkip}
          >
            SKIP
          </div>
        </div>
        <ConfirmPhoneNumber
            isShow={showConfirmPhoneNumberPopup}
            handleDismiss={handleDismissConfirmPhoneNumber}
            notConfirmedPhoneNumber={inputData.identifier}
            notConfirmedPhoneNumberCountryCode={countryCode}
            isForgotPassword={isForgotPasswordClicked && showSecondStep}
            afterConfirmFunction={appLogin}
        />
      </div>
  );
};

export default LoginWithPhone;
