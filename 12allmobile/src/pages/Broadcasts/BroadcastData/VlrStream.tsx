import React, { FC, useEffect, useState } from "react";
import { Vlr } from "../../../shared/types";
import { IonItem } from "@ionic/react";
import VlrToolbar from "./Toolbar/VlrToolbar";
import PopulateChannel from "./PopulateChannel";
import { STREAM_URL } from "../../../shared/constants";
import { Routes } from "../../../shared/routes";
import PopulateStreamCameraChannel from "./PopulateStreamCameraChannel";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/types";
import BaseService from "../../../services/BaseService";
import { BillingServices } from "../../../services/BillingServices";
import {
  setErrorToast,
  setSuccessToast,
} from "../../../redux/actions/toastActions";
import setPrevRoute from "../../../redux/actions/routeActions";

type Props = {
  vlr: Vlr;
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

const VlrStream: FC<Props> = ({ vlr, snapShots, onCollapseClick }: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

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
      profile.jwtToken &&
      !BaseService.isExpired(profile.jwtToken) &&
      !profile.isAnonymous;

    console.log("[DEBUG] onChannelClick");
    const data = await BillingServices.getRoomPrice(
      String(vlr.channel.channel_deep_link)
    );
    const starsAmount = data.data.result === "" ? 0 : data.data.result.stars;
    setRoomPrice(starsAmount);

    // Use consistent isPaid logic
    const isPaid = starsAmount > 0;

    console.log("[DEBUG] isLoggedIn:", isLoggedIn, "isPaid:", isPaid);
    console.log("[DEBUG] vlr:", vlr);
    if (!isLoggedIn && isPaid) {
      dispatch(setPrevRoute(""));
      history.push(Routes.Login);
    } else if (!isLoggedIn && !isPaid) {
      const pRoute = vlr.channel.stream_camera
        ? `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
        : `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`;
      dispatch(setPrevRoute(pRoute));
      history.push(Routes.Login);
    } else if (isLoggedIn && !isPaid) {
      const pRoute = vlr.channel.stream_camera
        ? `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
        : `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`;
      console.log("[DEBUG] pRoute:", pRoute);
      history.push(pRoute);
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
          const pRoute = vlr.channel.stream_camera
            ? `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
            : `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`;
          history.push(pRoute);
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
      vlr.channel.stream_camera
        ? history.push(
            `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
          )
        : history.push(
            `${Routes.ProtectedWatchPartyRoom}/${vlr.channel.channel_deep_link}`
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
            {vlr.channel.stream_camera ? (
              <PopulateStreamCameraChannel channel={vlr.channel} />
            ) : (
              <PopulateChannel
                vlr={vlr}
                snapShots={snapShots}
                onCollapseClick={onCollapseClick}
                roomPrice={roomPrice}
              />
            )}
          </div>
          {/* 
          <VlrToolbar
            channel={vlr.channel}
            shareLink={`${STREAM_URL}/${vlr.channel.stream_camera ? 'camera' : vlr.channel.stream_id}/${vlr.channel.channel_deep_link}`}
          /> */}
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

export default VlrStream;
