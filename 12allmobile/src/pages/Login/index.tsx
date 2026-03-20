import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonText,
} from "@ionic/react";
import { Ad } from "capacitor-ad-plugin";
import "./styles.scss";
import logo from "../../images/12all-logo-168.svg";
import { RouteComponentProps } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { Routes } from "../../shared/routes";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../../redux/actions/profileActions";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import TermsModal from "./TermsModal";
import Loader from "../../components/Loader";
import { SkipLogin, UserManagementService } from "../../services";
import SelectCountryCode, {
  SelectedCountryOnSelect,
} from "../../components/SelectCountryCode";
import { ReceiveCodeVia, ReduxSelectors } from "../../redux/types";
import appStorage, { StorageKey } from "../../shared/appStorage";
import BaseService from "../../services/BaseService";
import addSmartlookShow from "../../shared/methods/addSmartlookShow";
import { API_URL, MOBILE_VIEW } from "../../shared/constants";
import arrowRightActive from "../../images/icons/arrow_right_active.png";
import arrowRightDisabled from "../../images/icons/arrow_right_disabled.png";
import { checkIfLoggedIn } from "../../utils/authUtils";
import SafeAreaView from "../../components/SafeAreaView";
import { getStoredSkipLoginData, generateUniqueToken, storeSkipLoginData } from "../../utils/skipLoginUtils";

const LoginPage: FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const { history } = props;

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { phoneNumbers } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { prevUrl } = useSelector(({ route }: ReduxSelectors) => route);

  const phoneRef = useRef<HTMLIonInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<number | null>(null);
  const [countryName, setCountryName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<number | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [validationTimeout, setValidationTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [agree, setAgree] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [validNumber, setValidNumber] = useState<boolean | null>(null);
  const [isNicknameInputVisible, setIsNicknameInputVisible] =
    useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [verifType, setVerifType] = useState<string>(ReceiveCodeVia.Sms);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    useState<boolean>(true);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    (async function () {
      const isLoggedIn = await checkIfLoggedIn();
      if (isLoggedIn && profile.isAuthenticated) {
        const path = history.location.pathname;
        if (path === "/broadcasts" || path === "/login") {
          history.push("/broadcasts");
        }
      } else {
        if (profile.phoneNumber && !isNavigating) {
          UserManagementService.getUsernameByPhoneNumber(
            profile.phoneNumber
          ).then((response) => {
            if (response.data.username) {
              setNickname(response.data.username);
              setIsNicknameInputVisible(false);
            } else {
              setNickname("");
              setIsNicknameInputVisible(true);
            }
          });
        }
      }
    })();
  }, [history.location.pathname, isNavigating]);

  useEffect(() => {
    phoneRef.current?.getInputElement().then(addSmartlookShow);

    // Check if user is already authenticated and redirect if needed
    // Skip login users are handled by App.tsx and won't have stored login data
    appStorage.getObject(StorageKey.Login).then((data) => {
      if (data?.jwtToken && !BaseService.isExpired(data?.jwtToken)) {
        history.push("/");
      }
    });
  }, []);

  useEffect(() => {
    if (
      validNumber &&
      countryCode &&
      phoneNumber &&
      agree &&
      nickname &&
      !loading
    ) {
      setIsSubmitButtonDisabled(false);
    } else {
      setIsSubmitButtonDisabled(true);
    }
  }, [validNumber, countryCode, phoneNumber, agree, nickname, loading]);

  useEffect(() => {
    // Clear existing validation timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (countryCode && phoneNumber) {
      // Set to null initially to show loading state
      setValidNumber(null);

      // Debounce the validation call
      const timeout = setTimeout(() => {
        validatePhoneNumber();
      }, 1800); // Same 1.8 second delay as username fetch

      setValidationTimeout(timeout);
    } else {
      setValidNumber(null);
    }

    // Cleanup function
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [phoneNumber, countryCode]);

  useEffect(() => {
    dispatch(setProfile({ ...profile, recaptchaToken: "" }));

    // Cleanup function to reset navigation state
    return () => {
      setIsNavigating(false);
      // Clear any pending timeouts
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, []);

  const validatePhoneNumber = () => {
    if (countryCode && phoneNumber) {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      let testPhoneNumber = !!phoneNumbers.find(
        (testPhoneNumber) => testPhoneNumber === fullPhoneNumber
      );
      if (fullPhoneNumber === "19999") {
        testPhoneNumber = true;
        setValidNumber(true);
        return;
      }

      if (!testPhoneNumber) {
        UserManagementService.validatePhoneNumber(fullPhoneNumber)
          .then(({ data }) => {
            setValidNumber(data.status === "ok");
          })
          .catch((error) => {
            console.error("Phone validation error:", error);
            setValidNumber(false);
          });
      } else {
        setValidNumber(true);
      }
    }
  };

  const handleCountryCodeChange = useCallback(
    ({ code, name, autoOpenPhoneNumber }: SelectedCountryOnSelect) => {
      setCountryCode(code);
      setCountryName(name as string);
      autoOpenPhoneNumber &&
        setTimeout(() => phoneRef.current?.setFocus(), 400);
    },
    []
  );

  const handlePhoneNumberChange = (e: any) => {
    const newPhoneNumber = e.detail.value || "";
    setPhoneNumber(parseInt(newPhoneNumber));

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Only fetch username if we have both country code and phone number
    if (countryCode && newPhoneNumber) {
      const timeout = setTimeout(async () => {
        try {
          const response = await UserManagementService.getUsernameByPhoneNumber(
            countryCode + newPhoneNumber
          );
          if (response.data.username) {
            setNickname(response.data.username);
            setIsNicknameInputVisible(false);
          } else {
            setNickname("");
            setIsNicknameInputVisible(true);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
          setNickname("");
          setIsNicknameInputVisible(true);
        }
      }, 1800); // Increased from 500ms to 1800ms (1.8 seconds)
      setDebounceTimeout(timeout);
    } else {
      // Reset nickname if we don't have complete phone number
      setNickname("");
      setIsNicknameInputVisible(true);
    }
  };

  const onConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!countryCode || !phoneNumber || !agree || loading || !nickname) {
      console.log("Login validation failed:", {
        countryCode,
        phoneNumber,
        agree,
        loading,
        nickname,
      });
      return;
    }

    console.log(
      "Starting login process for phone:",
      `${countryCode}${phoneNumber}`
    );
    setLoading(true);

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    if (fullPhoneNumber === "19999") {
      UserManagementService.appLogin(fullPhoneNumber, countryName, nickname)
        .then(async ({ data: { confirmed } }) => {
          if (confirmed?.token) {
            const {
              id,
              avatar,
              nickname,
              country_of_residence,
              preferred_language,
              preferred_genre,
              gender,
              premium_status,
              has_confirmed_is_over_eighteen,
              show_debug_info,
              username,
              email,
            } = confirmed.user;

            dispatch(
              setProfile({
                id,
                phoneNumber: fullPhoneNumber,
                // token: confirmed.user?.auth_tokens[0].token,
                nickname: nickname || username,
                avatar,
                countryOfResidence: country_of_residence,
                preferredLanguage: preferred_language,
                gender,
                preferredGenre: preferred_genre,
                premium: premium_status,
                isOverEighteen: has_confirmed_is_over_eighteen,
                showDebugInfo: show_debug_info || false,
                jwtToken: confirmed.token,
                email,
              })
            );

            const auth = {
              token: "",
              phoneNumber: fullPhoneNumber,
              jwtToken: confirmed.token,
            };
            appStorage.setObject(StorageKey.Login, auth).then();
            BaseService.setAuth(auth);
            if (MOBILE_VIEW) {
              Ad.getAdId().then(({ id }) =>
                UserManagementService.updateAdvertisingId(id)
              );
            }

            setLoading(false); // Stop loading spinner before navigation
            history.push(Routes.Broadcasts);
          } else {
            setLoading(false); // Stop loading if no confirmed token
          }
        })
        .catch((error) => {
          console.error("Login error for 19999:", error);
          setLoading(false);
        });
    } else {
      setIsNavigating(true);

      // Ensure profile is set before navigation
      dispatch(
        setProfile({
          phoneNumber: fullPhoneNumber,
          countryOfResidence: countryName,
          nickname,
        })
      );

      // Use a more reliable approach with Promise to ensure state is updated
      Promise.resolve()
        .then(() => {
          console.log("Navigating to code page with phone:", fullPhoneNumber);
          history.push(Routes.Code);
          setLoading(false);
          setIsNavigating(false);
        })
        .catch((error) => {
          console.error("Navigation error:", error);
          setLoading(false);
          setIsNavigating(false);
        });
    }
  };

  const handleSkip = async () => {
    try {
      // Check if we have stored skip login data
      const storedData = await getStoredSkipLoginData();
      
                  if (storedData?.uniqueToken && storedData?.nickname) {
              // We have existing token and nickname, try to use them
              // Send API request with only uniqueToken, not the nickname
              const { data } = await SkipLogin.getLogin(storedData.uniqueToken);
        
        if (data.status === "ok") {
          // Successfully logged in with stored credentials
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

          appStorage.setItem(
            StorageKey.Login,
            JSON.stringify({
              token: data.response.jwt,
              phoneNumber: data.response.user.phone_number,
              jwtToken: data.response.jwt,
            })
          );

          history.push(prevUrl ? `${prevUrl}` : Routes.Broadcasts);
          return;
        }
      }
      
      // No stored data or stored data failed, generate new token and go to nickname input
      const uniqueToken = generateUniqueToken();
      await storeSkipLoginData({ uniqueToken, nickname: "" });
      
      // Try the API with just the token to see if we need a nickname
      const { data } = await SkipLogin.getLogin(uniqueToken);
      
      if (data.status === "ok") {
        // Successfully logged in without needing nickname
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

        appStorage.setItem(
          StorageKey.Login,
          JSON.stringify({
            token: data.response.jwt,
            phoneNumber: data.response.user.phone_number,
            jwtToken: data.response.jwt,
          })
        );

        history.push(prevUrl ? `${prevUrl}` : Routes.Broadcasts);
      } else if (data.status === "nok" && data.message === "provide_nickname") {
        // Need to provide nickname
        history.push(Routes.SKIP);
      } else {
        // Other error
        console.error('Skip login error:', data);
      }
    } catch (error) {
      console.error('Skip login error:', error);
    }
  };

  return (
    // <Layout showGoBack goBackDefaultHref={Routes.Broadcasts} cssContent="login-page">
    <IonPage className="login-page">
      <IonContent>
        <SafeAreaView>
          <Loader show={loading} />

          <IonImg src={logo} className="logo" />
          <IonText className="header" color="medium">
            {t("login.header")}
          </IonText>

          <IonText className="phone-number-text" color="medium">
            {t("signup.phoneNumber")}
          </IonText>

          <form onSubmit={onConfirm} noValidate>
            <IonItem lines="none" className="phone-number-section">
              <SelectCountryCode onSelect={handleCountryCodeChange} />

              <IonItem
                lines="none"
                className="phone-number-item"
                detail={false}
              >
                <IonText className="label">{t("signup.phoneNumber")}</IonText>
                <IonInput
                  type="number"
                  inputmode="numeric"
                  name="phoneNumber"
                  value={phoneNumber}
                  required
                  ref={phoneRef}
                  onIonInput={handlePhoneNumberChange}
                  className="phone-number-input"
                  placeholder={t("signup.phoneNumberPlaceholder")}
                  debounce={300}
                />
              </IonItem>
            </IonItem>

            {validNumber === false && (
              <IonText color="danger" className="invalid-phone-message">
                {t("signup.enterValidPhoneNumber")}
              </IonText>
            )}

            <IonItem lines="none" className="verify-method-item">
              <IonText className="verify-method-text" color="medium">
                {t("login.receiveCodeVia")}
              </IonText>

              <IonRadioGroup
                value={verifType}
                className="verify-method-item-group"
                onIonChange={(e) => {
                  dispatch(setProfile({ codeProvider: e.detail.value }));
                  setVerifType(e.detail.value);
                }}
              >
                <IonItem className="flex" lines="none">
                  <IonRadio
                    aria-label="Get Verify Code via SMS"
                    labelPlacement="end"
                    value={ReceiveCodeVia.Sms}
                  >
                    {t("login.sms")}
                  </IonRadio>
                </IonItem>
                <IonItem className="flex" lines="none">
                  <IonRadio
                    aria-label="Get Verify Code via call"
                    labelPlacement="end"
                    value={ReceiveCodeVia.Call}
                  >
                    {t("login.call")}
                  </IonRadio>
                </IonItem>
              </IonRadioGroup>
            </IonItem>
            {isNicknameInputVisible && (
              <IonItem lines="none" className="nickname-item" detail={false}>
                <IonText className="phone-number-text" color="medium">
                  {t("signup.nickname")}
                </IonText>
                <IonText className="label">{t("signup.nickname*")}</IonText>
                <IonInput
                  placeholder={t("signup.nicknamePlaceholder")}
                  name="nickname"
                  value={nickname}
                  required
                  onIonChange={(e) => setNickname(e.detail.value || "")}
                  labelPlacement="floating"
                ></IonInput>
              </IonItem>
            )}

            <IonItem className="agree" color="light" lines="none">
              <IonItem lines="none">
                <IonCheckbox
                  checked={agree}
                  onIonChange={(e) => setAgree(e.detail.checked)}
                  slot="start"
                />
                <IonText className="description">
                  {
                    <Trans i18nKey="signup.agreement">
                      I agree with
                      <IonText
                        role="button"
                        color="primary"
                        onClick={() => setShowTerms(true)}
                      >
                        terms
                      </IonText>
                      and
                      <IonText
                        role="button"
                        color="primary"
                        onClick={() => setShowPrivacyPolicy(true)}
                      >
                        privacy
                      </IonText>
                    </Trans>
                  }
                </IonText>
              </IonItem>
            </IonItem>

            <IonItem lines="none" className="footer-btn">
              <div className="button-container">
                <IonButton
                  type="button"
                  color="medium"
                  fill="clear"
                  className="next-label"
                  onClick={handleSkip}
                >
                  {t("login.skip")}
                </IonButton>
                <IonItem lines="none">
                  <IonText className="next-label">{t("login.next")}</IonText>
                  <IonButton
                    fill="clear"
                    className="next-button"
                    type="submit"
                    disabled={isSubmitButtonDisabled || loading}
                  >
                    <IonImg
                      src={
                        isSubmitButtonDisabled || loading
                          ? arrowRightDisabled
                          : arrowRightActive
                      }
                      class="click-effect"
                    />
                  </IonButton>
                </IonItem>
              </div>
            </IonItem>
          </form>
        </SafeAreaView>

        <PrivacyPolicyModal
          isOpen={showPrivacyPolicy}
          onDismiss={() => setShowPrivacyPolicy(false)}
        />
        <TermsModal isOpen={showTerms} onDismiss={() => setShowTerms(false)} />
      </IonContent>
    </IonPage>
    // </Layout>
  );
};

export default LoginPage;
