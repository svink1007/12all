import React, { useCallback, useState } from "react";
import "./styles.scss";
import { IonButton, IonButtons, IonInput } from "@ionic/react";
import { Routes } from "../../shared/routes";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/shared/types";
import { setEnableRewardPopup } from "../../redux/actions/billingRewardActions";
import { BillingServices } from "../../services";
import BillingPopup from "../Billing/BillingCommonPopup";

interface PopoverProps {
  showPopover: boolean;
  targetRef: React.RefObject<HTMLDivElement>;
  loadPartyChannels: Function;
}

// all comments are related to billing:

export default function PopoverComponent({
  showPopover,
  targetRef,
  loadPartyChannels,
}: PopoverProps) {
  const dispatch = useDispatch();

  const { jwt } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [roomId, setRoomId] = useState<string | null | undefined>("");
  const { enablePopup } = useSelector(
    ({ billingRewards }: ReduxSelectors) => billingRewards
  );
  const [openCostChanneAlert, setOpenCostChannelAlert] =
    useState<boolean>(false);

  const handlePaidChannel = () => {
    if (roomId) {
      BillingServices.getRoomPrice(roomId).then(({ data: { result } }) => {
        if (result && result?.stars > 0) {
          setOpenCostChannelAlert(true);
        } else {
          setOpenCostChannelAlert(false);
        }
      });
    }
    loadPartyChannels();
  };

  // billing:
  const closeRewardModal = useCallback(() => {
    if (enablePopup.openPaidStreamGuest) {
      dispatch(setEnableRewardPopup({ openPaidStreamGuest: false }));
      setTimeout(() => {
        // setShowRewardPopup(false)
        // history.push(Routes.Home);
      }, 2000);
    }
  }, [enablePopup, dispatch]);

  return (
    <>
      {/* billing: */}
      {openCostChanneAlert && (
        <BillingPopup closeRewardModal={closeRewardModal} />
      )}
      <div
        //className={`popover ${showPopover ? (jwt ? "popover-active" : "popover-div-no-login") : "popover-inactive"}`}
        className={`popover ${showPopover ? "popover-active" : "popover-inactive"}`}
        ref={targetRef}
      >
        <div className="rectangular-space-div">
          <span className="hollow-circle"></span>
        </div>
        <p className="popover-title">Enter ROOM number</p>
        <div color="secondary" className="ion-input-div">
          <IonInput
            type="text"
            name="roomNumber"
            placeholder="ROOM number"
            className="custom-input"
            onIonChange={({ detail }) => setRoomId(detail.value)}
          />
        </div>
        <IonButtons className="button-div">
          <IonButton
            className="ion-join-button"
            onClick={() => handlePaidChannel()}
            routerLink={`${Routes.WatchParty}/${roomId}`}
          >
            JOIN
          </IonButton>
        </IonButtons>
      </div>
    </>
  );
}
