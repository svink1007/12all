import React, { useEffect, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonHeader,
  IonImg,
  IonInput,
  IonLabel,
  IonTitle,
} from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import SelectCountryCode from "../subComponent";
import { ReduxSelectors } from "../../../redux/shared/types";
import { BillingServices } from "../../../services";
import crossIcon from "../../../images/icons/cross.svg";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { updateStarsBalance } from "../../../shared/helpers";
import { setTotalStarBalance } from "../../../redux/actions/billingRewardActions";

interface ReferralItem {
  phoneNumber: string;
  userId: number;
  claimed: boolean;
  status: string;
  countryCode: string;
  remindCount: number;
  referralId: number;
  showOnUI: boolean;
}

const InviteAndWin: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // const id = useSelector(() => 1);
  const { id } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [getReferralList, setGetReferralList] = useState<ReferralItem[]>([]);
  const [referralId, setReferralId] = useState<number>(0);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [referralList, setReferralList] = useState<ReferralItem[]>([
    {
      phoneNumber: "",
      userId: id,
      claimed: false,
      status: "NOT_ACCEPTED",
      countryCode: "",
      remindCount: 0,
      referralId: 0,
      showOnUI: false,
    },
  ]);

  const phoneNumberRegex = /^\d{8,15}$/; // Adjust based on your needs
  const countryCodeRegex = /^\d{1,4}$/;

  const isValidPhoneNumber = (phoneNumber: string) =>
    phoneNumberRegex.test(phoneNumber);
  const isValidCountryCode = (countryCode: string) =>
    countryCodeRegex.test(countryCode);

  const addReferral = () => {
    setReferralList((currentList) => [
      ...currentList,
      {
        phoneNumber: "",
        userId: id,
        claimed: false,
        status: "NOT_ACCEPTED",
        countryCode: "",
        remindCount: 0,
        referralId: 0,
        showOnUI: false,
      },
    ]);
  };

  const updatePhoneNumber = (index: number, phoneNumber: string) => {
    // if (isValidPhoneNumber(phoneNumber)) {
    setReferralList((currentList) =>
      currentList.map((item, idx) =>
        idx === index ? { ...item, phoneNumber } : item
      )
    );
    // }
  };

  const handleCountryCodeChange = (index: number, countryCode: string) => {
    // const addPlus = "+" + countryCode
    // if (isValidCountryCode(countryCode)) {
    setReferralList((currentList) =>
      currentList.map((item, idx) =>
        idx === index ? { ...item, countryCode } : item
      )
    );
    // }
  };

  useEffect(() => {
    if (getReferralList.length === 0 && id) {
      BillingServices.getReferral(id).then(
        ({ data: { result, status, errorMessage } }) => {
          console.log("getReferral status", status, "result", result);
          // if(errorMessage === "GENERAL_ERROR") {
          //   dispatch(setErrorToast('billing.notification.generalError'))
          // }
          if (result.length > 0) {
            setGetReferralList(result);
          }
        }
      );

      updateStarsBalance(id).then((response) => {
        dispatch(setTotalStarBalance(response));
      });
    }
  }, [getReferralList, id, dispatch]);

  const inviteReferral = () => {
    const filterFilledReferral = referralList
      .filter((item) => {
        if (!isValidCountryCode(item.countryCode)) {
          dispatch(setErrorToast("billing.notification.countryCodeRequired"));
        } else if (!isValidPhoneNumber(item.phoneNumber)) {
          dispatch(setErrorToast("billing.notification.phoneNumberRequired"));
        }

        return (
          isValidPhoneNumber(item.phoneNumber) &&
          isValidCountryCode(item.countryCode)
        );
      })
      .map((item) => {
        const mergePhoneNumber = item.countryCode + item.phoneNumber;
        return { ...item, phoneNumber: mergePhoneNumber };
      });

    console.log("referal filter", filterFilledReferral);

    if (filterFilledReferral.length > 0) {
      setIsInviting(true);
      BillingServices.addReferral(filterFilledReferral).then(
        ({ data: { result, status, errorMessage } }) => {
          console.log("errorMessage", errorMessage);
          if (errorMessage === "CLIENT_DOES_NOT_EXIST") {
            dispatch(setErrorToast("billing.notification.clientDoesNotExist"));
            setIsInviting(false);
          } else if (errorMessage === "SERVER_ERROR") {
            dispatch(setErrorToast("billing.notification.serverError"));
            setIsInviting(false);
          } else if (
            errorMessage ===
            "This phone number already has invitation or is registered in 12all.tv"
          ) {
            dispatch(
              setErrorToast(
                "This phone number already has invitation or is registered in 12all.tv"
              )
            );
            setIsInviting(false);
          }
          if (status === "ok" && result && !errorMessage) {
            BillingServices.getReferral(id).then(
              ({ data: { result, status } }) => {
                console.log("getReferral status", status, "result", result);
                setGetReferralList(result);
                setReferralList([
                  {
                    phoneNumber: "",
                    userId: id,
                    claimed: false,
                    status: "NOT_ACCEPTED",
                    countryCode: "",
                    remindCount: 0,
                    referralId: 0,
                    showOnUI: false,
                  },
                ]);
              }
            );
            setIsInviting(false);
          }
        }
      );
    }
  };

  const remindReferral = (referal: ReferralItem) => {
    console.log("referral", referal);
    if (referal.referralId) {
      setReferralId(referal.referralId);
      BillingServices.remindReferral(referal.referralId).then(
        ({ data: { result } }) => {
          console.log("remind result", result);
          if (result.isReminded) {
            BillingServices.getReferral(id).then(({ data: { result } }) => {
              console.log("referral list", result);
              setGetReferralList(result);
              setReferralId(0);
            });
          }
        }
      );
    }
  };

  const handleUpdateReferral = (referralId: number) => {
    if (referralId) {
      BillingServices.updateReferral(referralId).then(
        ({ data: { result } }) => {
          console.log("result remove referral", result);
          if (result === false) {
            BillingServices.getReferral(id).then(
              ({ data: { result, status } }) => {
                if (result.length > 0) {
                  setGetReferralList(result);
                }
              }
            );
          }
        }
      );
    }
  };

  const parseStatus = (claimed: boolean) => {
    switch (claimed) {
      case true:
        return "Accepted";
      case false:
        return "NOT accepted";
      default:
        return "";
    }
  };
  console.log("getReferralList", getReferralList);

  return (
    <Layout className="invite-and-win-layout">
      <IonHeader>
        <IonTitle>{t("billing.inviteAndWin.header")}</IonTitle>
      </IonHeader>
      <hr className="horizontal-row" />

      <div className="invite-and-win-content">
        <IonLabel>{t("billing.inviteAndWin.inviteStatement1")}</IonLabel>
        <IonLabel>{t("billing.inviteAndWin.inviteStatement2")}</IonLabel>
        <IonLabel>{t("billing.inviteAndWin.inviteStatement3")}</IonLabel>
      </div>

      {getReferralList.length > 0 && (
        <div className="referral-list-container">
          <div className="referral-list-box">
            {getReferralList?.map((referral, index) => {
              // console.log("referral", referral)
              console.log("referral.remindCount", referral.remindCount);

              return (
                <div className="referral-phone-input" key={index}>
                  <div className="referral-country-code">
                    <SelectCountryCode
                      key={index}
                      onSelect={(value) => console.log()}
                      inputPlaceholder={`${referral.countryCode}`}
                      disabled
                    />
                  </div>

                  <div className={`referral-phone-number-${index}`}>
                    <IonInput
                      type="text"
                      name={`phone-number-${index}`}
                      // placeholder={t('billing.inviteAndWin.friendNumber')}
                      value={referral.phoneNumber}
                      onIonChange={(e) => console.log()}
                      // required
                      disabled
                      // className="phone-number-input"
                    />
                  </div>
                  <div className={`status-div-${index}`}>
                    <IonLabel
                      className={`status-label ${
                        referral.claimed ? "label-color" : ""
                      }`}
                    >
                      {parseStatus(referral.claimed)}
                    </IonLabel>
                  </div>

                  <div className={`remind-button-div-${index}`}>
                    {!referral.claimed && (
                      <IonButton
                        onClick={() => remindReferral(referral)}
                        className="remind-button"
                        disabled={referral.remindCount < 2 ? false : true}
                      >
                        {referralId === referral.referralId
                          ? "SENDING..."
                          : t("billing.inviteAndWin.remind")}
                      </IonButton>
                    )}
                  </div>

                  <div className={`cross-button-div-${index}`}>
                    {referral.claimed && referral.status === "ACCEPTED" && (
                      <IonImg
                        src={crossIcon}
                        onClick={() =>
                          handleUpdateReferral(referral.referralId)
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {referralList.map((referral, index) => (
        <div className="phone-input" key={index}>
          <div className="country-code">
            <SelectCountryCode
              key={index}
              onSelect={(value) => handleCountryCodeChange(index, value)}
              inputPlaceholder={t("billing.inviteAndWin.countryCode")}
              disabled={false}
            />
          </div>

          <div className={`phone-number-${index}`}>
            <IonInput
              type="text"
              name={`phone-number-${index}`}
              placeholder={t("billing.inviteAndWin.friendNumber")}
              value={referral.phoneNumber}
              onIonChange={(e) => updatePhoneNumber(index, e.detail.value!)}
              required
              // className="phone-number-input"
            />
          </div>
        </div>
      ))}

      <div className="bottom-buttons">
        <IonButton onClick={addReferral} className="left-button">
          {t("billing.inviteAndWin.addMoreFriends")}
        </IonButton>
        <IonButton onClick={inviteReferral} className="right-button">
          {isInviting ? "SENDING..." : t("billing.inviteAndWin.inviteBtn")}
        </IonButton>
      </div>
    </Layout>
  );
};

export default InviteAndWin;
