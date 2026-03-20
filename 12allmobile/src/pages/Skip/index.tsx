import { FC, useState, useEffect } from "react";
import { IonContent, IonImg, IonPage } from "@ionic/react";
import { RouteComponentProps, useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { Routes } from "../../shared/routes";
import { SkipLogin } from "../../services";
import BaseService from "../../services/BaseService";
import SafeAreaView from "../../components/SafeAreaView";

import Close from "../../images/settings/close.svg";
import { setProfile } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";
import setPrevRoute from "../../redux/actions/routeActions";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import { setErrorToast } from "../../redux/actions/toastActions";
import { getStoredSkipLoginData, storeSkipLoginData } from "../../utils/skipLoginUtils";

const Skip: FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const { history, location } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { prevUrl } = useSelector(({ route }: ReduxSelectors) => route);

  const [nickname, setNickname] = useState("");

  // Load existing nickname from storage if available
  useEffect(() => {
    const loadStoredNickname = async () => {
      try {
        const storedData = await getStoredSkipLoginData();
        if (storedData?.nickname) {
          setNickname(storedData.nickname);
        }
      } catch (error) {
        console.error('Error loading stored nickname:', error);
      }
    };
    
    loadStoredNickname();
  }, []);

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  const onChange = (e: any) => {
    setNickname(e.target.value);
  };

  const onConfirm = async () => {
    try {
      // Get the stored skip login data to get the uniqueToken
      const storedData = await getStoredSkipLoginData();
      
      if (!storedData?.uniqueToken) {
        dispatch(setErrorToast(t("skipLogin.noTokenFound")));
        return;
      }

      // Call the API with both uniqueToken and nickname
      const { data } = await SkipLogin.getLogin(storedData.uniqueToken, nickname);
      
      if (data.status === "ok") {
        // Successfully logged in
        BaseService.setAuth({
          token: data.response.jwt,
          phoneNumber: data.response.user.phone_number,
          jwtToken: data.response.jwt,
        });

        dispatch(
          setProfile({
            ...data.response.user,
            jwtToken: data.response.jwt,
            nickname: data.response.user.nickname
              ? data.response.user.nickname
              : data.response.user.username
                ? data.response.user.username
                : "",
            isAnonymous: !data.response.user.email
              ? false
              : data.response.user.email.includes("@skiplogin.com")
                ? true
                : false,
          })
        );

        // Store the nickname with the uniqueToken for future use
        await storeSkipLoginData({
          uniqueToken: storedData.uniqueToken,
          nickname: nickname
        });

        appStorage.setItem(
          StorageKey.Login,
          JSON.stringify({
            token: data.response.jwt,
            phoneNumber: data.response.user.phone_number,
            jwtToken: data.response.jwt,
          })
        );
        
        history.replace(prevUrl ? `${prevUrl}` : Routes.Broadcasts);
      } else if (data.status === "nok") {
        if (data.message === "User with this nickname already exists!") {
          dispatch(setErrorToast(t("skipLogin.nicknameTaken")));
        } else if (data.message === "provide_nickname") {
          dispatch(setPrevRoute(location.pathname));
          history.replace(Routes.SKIP, {
            state: { prevPath: location.pathname },
          });
        } else {
          dispatch(setErrorToast(data.message));
        }
      }
    } catch (error) {
      console.error('Skip login error:', error);
      dispatch(setErrorToast(t("skipLogin.errorOccurred")));
    }
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="relative px-4 pt-4 h-full">
            <div className="relative">
              <IonImg
                src={Close}
                className="absolute w-4.5 h-4.5 cursor-pointer"
                onClick={onCloseClick}
              />
              <div className="flex flex-col gap-4 text-center text-base">
                <p>{t("skipLogin.title")}</p>
                <p className="text-xs text-blue-600"></p>
              </div>
            </div>
            <div className="relative mt-48">
              <div className="flex flex-col gap-4 text-center text-base">
                <p>{t("skipLogin.enterANickname")}</p>
                <input
                  className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2 w-full "
                  name="nickname"
                  value={nickname}
                  onChange={onChange}
                />
              </div>
              <div className="flex justify-center pt-10 gap-4">
                <button
                  className="text-sm tracking-[-0.36px] text-white uppercase px-6 py-2 bg-gradient-to-b from-[#ae00b3] to-[#d50087] rounded-xl"
                  onClick={onConfirm}
                >
                  Confirm
                </button>
                <button
                  className="text-sm tracking-[-0.36px] text-white uppercase px-6 py-2 bg-gradient-to-b from-[#ae00b3] to-[#d50087] rounded-xl"
                  onClick={onCloseClick}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default Skip;
