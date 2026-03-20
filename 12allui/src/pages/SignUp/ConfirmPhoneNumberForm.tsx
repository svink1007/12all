import React, { FC, FormEvent, useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  useIonViewWillLeave,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { BillingServices, UserManagementService } from "../../services";
import { ReduxSelectors } from "../../redux/shared/types";
import { setLogin } from "../../redux/actions/profileActions";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import { useDispatch, useSelector } from "react-redux";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";
import {
  setDailyVisitReward,
  setEnableRewardPopup,
  setTotalStarBalance,
} from "../../redux/actions/billingRewardActions";
import { useHistory } from "react-router";
import { updateStarsBalance } from "../../shared/helpers";
import { Routes } from "../../shared/routes";

const INITIAL_RESEND_TIMEOUT = 30;

type Props = {
  onResendConfirmationCode: (
    phoneNumber: string,
    recaptchaToken: string
  ) => void;
  recaptchaToken: string | "";
  setRecaptchaToken: Function;
  setIsRecaptchaVerified: Function;
  isRecaptchaVerified: boolean;
};

const ConfirmPhoneNumberForm: FC<Props> = ({
  onResendConfirmationCode,
  recaptchaToken,
  setRecaptchaToken,
  setIsRecaptchaVerified,
  isRecaptchaVerified,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const resendCodeInterval = useRef<NodeJS.Timeout>();
  const { phoneNumber } = useSelector(({ signUp }: ReduxSelectors) => signUp);

  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState<boolean>(true);
  const [submittingConfirmationCode, setSubmittingConfirmationCode] =
    useState<boolean>(false);
  const [resendTime, setResendTime] = useState<number>(INITIAL_RESEND_TIMEOUT);
  const [isShowRecaptcha, setIsShowRecaptcha] = useState<boolean>(false);
  const [isResendButtonDisabled, setIsResendButtonDisabled] =
    useState<boolean>(true);

  useIonViewWillLeave(() => {
    if (resendCodeInterval.current) {
      clearInterval(resendCodeInterval.current);
    }
  }, []);

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

  useEffect(() => {
    if (resendTime === 0) {
      setIsShowRecaptcha(true);
      setSendingCode(false);
    }
  }, [resendTime]);

  const resendConfirmationCode = () => {
    setIsRecaptchaVerified(false);
    setIsShowRecaptcha(false);
    setRecaptchaToken("");
    setResendTime(INITIAL_RESEND_TIMEOUT);
    setSendingCode(true);
    setIsResendButtonDisabled(true);
    onResendConfirmationCode(phoneNumber, recaptchaToken);
  };

  const submitValidationCode = (e: FormEvent) => {
    e.preventDefault();

    if (!validationCode) {
      return;
    }

    setSubmittingConfirmationCode(true);

    // billing:
    const currClientDate = new Date().toJSON();
    const eventType = "entry.create";

    UserManagementService.confirmCode(phoneNumber, validationCode)
      .then(({ data }) => {
        if (data.status === "ok") {
          dispatch(setInfoToast("phoneNumberValidation.phoneNumberConfirmed"));
          dispatch(setLogin({ hasConfirmedPhoneNumber: true }));

          BillingServices.billingEvent(
            currClientDate,
            data.user.id,
            eventType
          ).then(async ({ data: { result } }) => {
            dispatch(setDailyVisitReward(result));
            if (result.billingReward.creditedStars === 100) {
              const starsBalance = await updateStarsBalance(data.user.id);
              dispatch(setTotalStarBalance(starsBalance));
              dispatch(setEnableRewardPopup({ signupReward: true }));
              history.push(Routes.Home);
            } else {
              dispatch(setEnableRewardPopup({ signupReward: false }));
              history.push(Routes.Home);
            }
          });

          BillingServices.billingEvent(
            currClientDate,
            data.user.id,
            "entry.create"
          ).then(({ data: { result } }) => {
            console.log("result event update", result);
            // dispatch(setDailyVisitReward(result))
            // if (result.billingReward.creditedStars === 100) {
            //   const starsBalance = await updateStarsBalance(data.user.id)
            //   dispatch(setTotalStarBalance(starsBalance))
            //   dispatch(setEnableRewardPopup({ signupReward: true }))
            //   history.push(Routes.Home);
            // } else {
            //   dispatch(setEnableRewardPopup({ signupReward: false }))
            //   history.push(Routes.Home);
            // }
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
      .catch(() =>
        dispatch(setErrorToast("signup.unknownErrorOnConfirmPhoneNumber"))
      )
      .finally(() => setSubmittingConfirmationCode(false));
  };

  return (
    <form noValidate onSubmit={submitValidationCode}>
      <IonItem color="secondary">
        <IonLabel position="floating">
          {t("myProfile.fieldLabel.validationCode")}
        </IonLabel>
        <IonInput
          type="text"
          name="validationCode"
          autocomplete="off"
          placeholder={t("myProfile.fieldLabel.enterValidationCode")}
          required
          value={validationCode}
          onIonChange={({ detail: { value } }) =>
            setValidationCode(value ? value.trim() : "")
          }
        />
      </IonItem>

      {isShowRecaptcha && (
        <IonItem color="secondary" lines="none" style={{ marginTop: "20px" }}>
          <GoogleRecaptchaV3
            setIsResendButtonDisabled={setIsResendButtonDisabled}
            setIsRecaptchaVerified={setIsRecaptchaVerified}
            setRecaptchaToken={setRecaptchaToken}
          />
        </IonItem>
      )}

      <div className="actions-row">
        <IonButton
          type="submit"
          disabled={!validationCode || submittingConfirmationCode}
        >
          {t("signup.submit")}
        </IonButton>
        <IonButton
          color="dark"
          onClick={resendConfirmationCode}
          disabled={isResendButtonDisabled}
        >
          {t("myProfile.button.resend_code")} {resendTime ? resendTime : ""}
        </IonButton>
      </div>
    </form>
  );
};

export default ConfirmPhoneNumberForm;
