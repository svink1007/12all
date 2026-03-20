import React, { useCallback, useState } from "react";
import { IonImg, IonPage } from "@ionic/react";

import Close from "../../images/settings/close.svg";
import AddFriend from "../../images/invite-win/add_friend.svg";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";
import SelectCountryCode from "../../components/SelectCountryCode";
import SelectCountry from "../../components/SelectCountry";

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

const InviteAndWin = () => {
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [referralList, setReferralList] = useState<ReferralItem[]>([
    {
      phoneNumber: "",
      userId: profile.id,
      claimed: false,
      status: "NOT_ACCEPTED",
      countryCode: "",
      remindCount: 0,
      referralId: 0,
      showOnUI: false,
    },
  ]);

  const handleSelectCountryCodeChange = useCallback(
    (index: number, code: number) => {
      setReferralList((currentList) =>
        currentList.map((item, idx) =>
          idx === index ? { ...item, countryCode: code.toString() } : item
        )
      );
    },
    [referralList]
  );

  const onAddClick = () => {
    setReferralList((prev) => [
      ...prev,
      {
        phoneNumber: "",
        userId: profile.id,
        claimed: false,
        status: "NOT_ACCEPTED",
        countryCode: "",
        remindCount: 0,
        referralId: 0,
        showOnUI: false,
      },
    ]);
  };

  return (
    <IonPage>
      <div className="flex flex-col items-center justify-between px-4 pt-5 w-full h-full">
        <div className="flex justify-center relative w-full">
          <IonImg src={Close} className="absolute top-0 left-0" />
          <p className="p-0 m-0">INVITE AND WIN</p>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="text-base leading-[19px] tracking-[0px] text-white text-center pt-16">
            Refer One2All.tv to a friend. After he/she registers/confirms the
            phone number, you will be rewarded with 100 STARs!
          </div>
          <div className="mt-7 text-base text-[#A5A5A5] text-center">
            Friend Phone Number
          </div>
          <div className="flex flex-col flex-1">
            {referralList.map((item, index) => (
              <SelectCountryCode
                key={index}
                onSelect={({ code }) => {
                  handleSelectCountryCodeChange(index, code);
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex pb-6 items-center w-full flex-col gap-12">
          <div
            className="flex gap-2 w-full justify-center items-center"
            onClick={onAddClick}
          >
            <IonImg src={AddFriend} />
            <p className="p-0 m-0">Add more friends</p>
          </div>
          <button className="rounded-xl transform bg-gradient-to-b from-[#AE00B3] to-[#D50087] px-10 py-3">
            INVITE
          </button>
        </div>
      </div>
    </IonPage>
  );
};

export default InviteAndWin;
