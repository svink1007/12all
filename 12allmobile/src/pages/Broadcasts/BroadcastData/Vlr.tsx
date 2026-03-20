import React, { FC, useEffect, useState } from "react";
import { SharedStreamVlrs, Vlr as VlrType } from "../../../shared/types";
import { IonItem } from "@ionic/react";
import validateVlr from "../../../shared/validateVlr";
import VlrToolbar from "./Toolbar/VlrToolbar";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/types";
import PopulateChannel from "./PopulateChannel";
import { Routes } from "../../../shared/routes";
import { APP_URL } from "../../../shared/constants";
import {
  setErrorToast,
  setSuccessToast,
} from "../../../redux/actions/toastActions";
import { BillingServices } from "../../../services/BillingServices";
import BaseService from "../../../services/BaseService";

type Props = {
  vlr: VlrType;
  snapShots: { [id: number]: string | undefined };
  onCollapseClick?: any;
};

const PaidRoomModal = ({ isOpen, onClose, onConfirm, starsAmount }: any) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // Close modal when backdrop is clicked
    >
      <div
        className="bg-[#662c4b] rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-xl font-semibold text-center">PAID STREAM</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 absolute right-2 top-2"
          >
            &times;
          </button>
        </div>
        <h3 className="text-xl text-center mb-4">{starsAmount} STARS</h3>
        <p className="mb-6">Are you sure you want to proceed?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="transform bg-gradient-to-t from-[#AE00B3] to-[#D50087] rounded-[12px] px-6 py-2"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="bg-transparent rounded-[12px] px-6 py-2 border border-gray-50 border-solid"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

const Vlr: FC<Props> = ({ vlr, snapShots, onCollapseClick }: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);

  const [isPaidRoomModalOpen, setIsPaidRoomModalOpen] = useState(false);
  const [roomPrice, setRoomPrice] = useState(0);

  useEffect(() => {
    (async function () {
      const data = await BillingServices.getRoomPrice(
        String(vlr.channel.channel_deep_link)
      );
      const starsAmount = data.data.result === "" ? 0 : data.data.result.stars;
      setRoomPrice(starsAmount);
    })();
  }, []);

  const onChannelClick = async () => {
    const isLoggedIn =
      profile.jwtToken && !BaseService.isExpired(profile.jwtToken);

    const data = await BillingServices.getRoomPrice(
      String(vlr.channel.channel_deep_link)
    );
    const starsAmount = data.data.result === "" ? 0 : data.data.result.stars;
    setRoomPrice(starsAmount);

    // Use consistent isPaid logic
    const isPaid = starsAmount > 0;

    if (!isLoggedIn && isPaid) {
      history.push(Routes.Login);
    } else if (!isLoggedIn && !isPaid) {
      nickname
        ? validateVlr(String(vlr.channel.channel_deep_link), dispatch)
            .then(() =>
              history.push(
                `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
              )
            )
            .catch((err) => dispatch(setErrorToast(err.message)))
        : history.push(
            `${Routes.ProtectedWatchPartyJoin}/${vlr.channel.channel_deep_link}`
          );
    } else if (isLoggedIn && !isPaid) {
      nickname
        ? validateVlr(String(vlr.channel.channel_deep_link), dispatch)
            .then(() =>
              history.push(
                `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
              )
            )
            .catch((err) => dispatch(setErrorToast(err.message)))
        : history.push(
            `${Routes.ProtectedWatchPartyJoin}/${vlr.channel.channel_deep_link}`
          );
    } else if (isLoggedIn && isPaid) {
      const data = await BillingServices.isRoomPaid(
        profile.id,
        String(vlr.channel.channel_deep_link)
      );
      if (data.data.status === "nok") {
        dispatch(setErrorToast("An internal server Error"));
      } else if (data.data.status === "ok") {
        if (data.data.result.paid === false) {
          setIsPaidRoomModalOpen(true);
        } else {
          setIsPaidRoomModalOpen(false);
          nickname
            ? validateVlr(String(vlr.channel.channel_deep_link), dispatch)
                .then(() =>
                  history.push(
                    `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
                  )
                )
                .catch((err) => dispatch(setErrorToast(err.message)))
            : history.push(
                `${Routes.ProtectedWatchPartyJoin}/${vlr.channel.channel_deep_link}`
              );
        }
      }
    }
  };

  const onPaidRoomModalConfirm = async () => {
    const data = await BillingServices.payRoomPrice(
      profile.id,
      vlr.channel.channel_deep_link
    );
    if (data.data.status === "ok" && data.data.result.status === "SUCCESS") {
      setSuccessToast("You have successfully paid for this room");
      setIsPaidRoomModalOpen(false);
      nickname
        ? validateVlr(vlr.channel.channel_deep_link, dispatch)
            .then(() =>
              history.push(
                `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
              )
            )
            .catch((err) => dispatch(setErrorToast(err.message)))
        : history.push(
            `${Routes.ProtectedWatchPartyJoin}/${vlr.channel.channel_deep_link}`
          );
    } else {
      if (
        data.data.status === "nok" &&
        data.data.result.status === "INSUFFICIENT_BALANCE"
      ) {
        dispatch(setErrorToast("Insufficient balance in your account"));
      } else {
        dispatch(setErrorToast("An error occured when handling the payment"));
      }
      setIsPaidRoomModalOpen(false);
    }
  };

  const onPaidRoomModalClose = () => {
    setIsPaidRoomModalOpen(false);
  };

  return (
    <>
      <div className="channel-wrapper">
        <div className="channel-wrapper-inner">
          <div className="channel" onClick={onChannelClick} color="light">
            <PopulateChannel
              vlr={vlr}
              snapShots={snapShots}
              onCollapseClick={onCollapseClick}
              roomPrice={roomPrice}
            />
          </div>

          {/* <VlrToolbar channel={vlr.channel} shareLink={`${APP_URL}${Routes.WatchParty}/${vlr.channel.channel_deep_link}`}/> */}
        </div>
      </div>
      {vlr && (
        <PaidRoomModal
          isOpen={isPaidRoomModalOpen}
          onConfirm={onPaidRoomModalConfirm}
          onClose={onPaidRoomModalClose}
          starsAmount={roomPrice && roomPrice > 0 ? roomPrice : 0}
        />
      )}
    </>
  );
};

export default Vlr;
