import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {IonItem, IonLabel, IonLoading, IonRadio, IonRadioGroup} from "@ionic/react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";

import "./styles.scss";
import GoogleRecaptchaV3 from "../../../components/RecaptchaV3";
import { AuthService, BillingServices, SkipLogin } from "../../../services";
import LocationState from "../../../models/LocationState";
import { setLogin } from "../../../redux/actions/profileActions";
import { Profile } from "../../../redux/shared/types";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { updateStarsBalance } from "../../../shared/helpers";
import appStorage, { StorageKey } from "../../../shared/appStorage";
import { Routes } from "../../../shared/routes";
import {navigate} from "ionicons/icons";


const LoginWithNickname = ({
                             setIsLoginorSignUp
                           }: {
  setIsLoginorSignUp: (isLoginOrSignUp: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { state } = location;

  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [inputData, setInputData] = useState({
    identifier: "",
    password: "",
  });
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
    useState<boolean>(false);
  const [isForgotPasswordClicked, setIsForgotPasswordClicked] =
    useState<boolean>(false);

  const onChange = (e: any) => {
    if (e.target.name === "nickname" || e.target.name === "phoneNumber") {
      setInputData({ ...inputData, identifier: e.target.value });
    } else {
      setInputData({ ...inputData, [e.target.name]: e.target.value });
    }
    setError(false)
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

  const handleLoginSubmit = async () => {
    try {
      if (!inputData.identifier || !inputData.password) {
        dispatch(setErrorToast("Please check your inputs"));
        return;
      }

      // if (!isRecaptchaVerified || !recaptchaToken) {
      //   dispatch(setErrorToast("Please check the recaptcha"));
      //   return;
      // }

      const data = await AuthService.login({
        identifier: inputData.identifier,
        password: inputData.password,
      });
      console.log("DAAAA:", data);
      await saveProfile(data);
    } catch (err) {
      setError(true)
      dispatch(setErrorToast("login.invalid"));
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  return (
      <div
          className="w-full bg-[#662C4B] border border-t-0 px-10 py-8 rounded-b-lg login-with-phone-container overflow-y-scroll">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm">Nickname</p>
          <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              onChange={onChange}
              name="nickname"
              value={inputData.identifier}
          />
        </div>
        <div className="flex flex-col mt-3 gap-1.5">
          <p className="text-sm">Password</p>
          <input
              className="w-full h-10 bg-white border text-[#a5a5a5] rounded pl-2"
              type="password"
              onChange={onChange}
              name="password"
              value={inputData.password}
          />
        </div>
        <IonLoading isOpen={loading}/>
        {/* <div
        className="flex justify-center mt-4"
        onClick={() => setIsForgotPasswordClicked(!isForgotPasswordClicked)}
      >
        <p className="text-sm cursor-pointer">Forgot Password?</p>
      </div> */}
        {/* {isForgotPasswordClicked && (
        <div className="flex flex-col gap-3 mt-6">
          <p className="text-sm">Receive One Time Password (OTP) via:</p>
          <IonRadioGroup value="sms" className="flex gap-10 text-white">
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
      )} */}
        <div className="flex justify-center mt-6">
          {/*<GoogleRecaptchaV3*/}
          {/*    setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
          {/*    setRecaptchaToken={setRecaptchaToken}*/}
          {/*/>*/}
        </div>

        <div className={"mt-5 pt-3 w-100 " + (error ? "visible" : "hidden") } style={{ transition: "all 0.5s ease"}}>
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
              className="text-lg uppercase text-white py-2 px-8 bg-transparent border border-[#D4D4D4] rounded-xl hover:cursor-pointer"
              onClick={handleSkip}
          >
            SKIP
          </div>
        </div>
      </div>
  );
};

export default LoginWithNickname;
