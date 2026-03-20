import React, { useEffect, useState } from "react";
import {
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "./styles.scss";

import Close from "../../images/settings/close.svg";
import Star from "../../images/profile-settings/star.svg";
import { BillingServices } from "../../services/BillingServices";
import { ReduxSelectors } from "../../redux/types";
import SelectCountry from "../../components/SelectCountry";
import { useHistory } from "react-router";

interface IBillInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  postCode: string;
  type: string;
  userId: number;
  address1: string;
  address2: string;
  city: string;
  country: string;
  email: string | null;
  vatNumber: string;
}

const BillingInfo = () => {
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { t } = useTranslation();
  const history = useHistory();

  const [balance, setBalance] = useState(0);
  const [accountType, setAccountType] = useState("public");
  const [country, setCountry] = useState("");
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(true);

  const [billingInfoData, setBillingInfoData] = useState<IBillInfoData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    postCode: "",
    type: "public",
    address1: "",
    address2: "",
    city: "",
    country: "",
    email: "",
    vatNumber: "",
    userId: profile.id,
  });

  useEffect(() => {
    (async function () {
      const data = await BillingServices.billingStarBalance(profile.id);
      if (data.data.status === "ok" && data.data.starsBalance > 0) {
        setBalance(data.data.starsBalance);
      }

      const billingData = await BillingServices.getBillingInfo(profile.id);

      if (billingData.data.status === "ok") {
        setBillingInfoData({
          ...billingInfoData,
          ...billingData.data.result,
          email: billingData.data.result.email ?? profile.email,
          phoneNumber:
            billingData.data.result.phoneNumber ?? profile.phoneNumber,
          userId: profile.id,
        });
      }
    })();
  }, []);

  useEffect(() => {
    setBillingInfoData({ ...billingInfoData, country: country });
  }, [country]);

  const onCountryChange = (value: string) => {
    setCountry(value);
  };

  const onCountryInputClicked = () => {
    console.log("COUNTRY INPUT CLICKED:");
    setCountryModalOpen(true);
  };

  const onChange = (e: any) => {
    setBillingInfoData({ ...billingInfoData, [e.target.name]: e.target.value });
  };

  const onSave = () => {
    const billingInfo = {
      ...billingInfoData,
      email: billingInfoData.email as string,
    };

    if (isUpdate) {
      BillingServices.updateBillingInfo(billingInfo).then(() => {
        history.goBack();
      });
    } else {
      BillingServices.addBillingInfo(billingInfo).then((result) => {
        console.log("result add billing info", result);
        if (result.data.status === "ok" && result.status === 200) {
          console.log("inside add result");
          setIsUpdate(true);
          history.goBack();
        }
      });
    }
  };

  console.log("BILLINGINFO:", billingInfoData, profile);

  return (
    <IonPage>
      <div className="flex flex-col items-center px-4 pt-5 w-full h-full">
        <div className="flex justify-center relative w-full mt-8">
          <IonImg
            src={Close}
            className="absolute top-0 left-0"
            onClick={() => history.goBack()}
          />
          <p className="p-0 m-0">BILLING INFO / FIRM DETAILS</p>
        </div>
        <div className="stars-balance-container mt-5">
          <div className="stars-balance-body">
            <p className="balance-text">
              {t("starsTransactions.currentBalance")}
            </p>
            <img className="star-avatar" src={Star} />
            <div className="stars-balance">
              <p>
                {t("starsTransactions.total")}: {balance}{" "}
                {t("starsTransactions.stars")}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full mt-9 flex flex-col gap-5 flex-1 overflow-y-scroll">
          <IonRadioGroup
            value={billingInfoData.type}
            onIonChange={(e) =>
              setBillingInfoData({ ...billingInfoData, type: e.detail.value })
            }
            class="flex gap-4"
          >
            <IonItem color="light">
              <IonRadio value={"public"} slot="start" />
              <IonLabel>Public</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonRadio value={"corporate"} slot="start" />
              <IonLabel>Corporate</IonLabel>
            </IonItem>
          </IonRadioGroup>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">First Name</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              name="firstName"
              onChange={onChange}
              value={billingInfoData.firstName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Last Name</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              name="lastName"
              onChange={onChange}
              value={billingInfoData.lastName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">E-mail</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2 disabled:bg-[#646464]"
              name="email"
              onChange={onChange}
              value={billingInfoData.email as string}
              disabled={profile.email ? true : false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Phone Number*</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2 disabled:bg-[#646464]"
              name="phoneNumber"
              onChange={onChange}
              value={billingInfoData.phoneNumber}
              disabled
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Country</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              value={country}
              onClick={onCountryInputClicked}
              readOnly
            />
            <SelectCountry
              country={country}
              onSelect={onCountryChange}
              open={countryModalOpen}
              onClose={() => setCountryModalOpen(false)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">VAT number</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              name="vatNumber"
              onChange={onChange}
              value={billingInfoData.vatNumber}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Address 1</p>
            <textarea
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] text-[#000000] px-2"
              name="address1"
              onChange={onChange}
              value={billingInfoData.address1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Address 2</p>
            <textarea
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] text-[#000000] px-2"
              name="address2"
              onChange={onChange}
              value={billingInfoData.address2}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">Postal Code</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              name="postCode"
              onChange={onChange}
              value={billingInfoData.postCode}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 pl-1 text-sm text-[#A5A5A5]">City</p>
            <input
              className="border-1 border-[#707070] border-solid rounded-sm bg-[#949494] h-9 text-[#000000] px-2"
              name="city"
              onChange={onChange}
              value={billingInfoData.city}
            />
          </div>

          <div className="flex w-full justify-center">
            <button
              className="flex justify-center mb-12 rounded-xl transform bg-gradient-to-b from-[#AE00B3] to-[#D50087] px-10 py-3 w-fit"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default BillingInfo;
