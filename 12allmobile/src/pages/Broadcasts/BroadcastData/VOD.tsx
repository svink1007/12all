import React, { FC, useEffect, useState } from "react";
import { SharedStreamVlrs } from "../../../shared/types";
import { IonItem, IonImg } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/types";
import { Routes } from "../../../shared/routes";
import {
  setErrorToast,
  setSuccessToast,
} from "../../../redux/actions/toastActions";
import { BillingServices } from "../../../services/BillingServices";
import BaseService from "../../../services/BaseService";
import logo12all from "../../../images/12all-logo-128.svg";
import star from "../../../images/create-room/star.svg";
import dots from "../../../images/icons/dots.svg";
import cx from "classnames";

type Props = {
  vod: SharedStreamVlrs;
  onCollapseClick?: any;
};

const PaidRoomModal = ({ isOpen, onClose, onConfirm, starsAmount }: any) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#662c4b] rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-xl font-semibold text-center">PAID VOD</h2>
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

const VOD: FC<Props> = ({ vod, onCollapseClick }: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [isPaidRoomModalOpen, setIsPaidRoomModalOpen] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(false);

  const handleImageError = () => {
    setImageLoadErrors(true);
  };

  const handleImageLoad = () => {
    setImageLoadErrors(false);
  };

  const onChannelClick = async () => {
    const isLoggedIn =
      profile.jwtToken &&
      !BaseService.isExpired(profile.jwtToken) &&
      !profile.isAnonymous;

    // Treat '0' (string or number) as a free VOD
    const isPaid = !!vod.starsAmount && parseInt(vod.starsAmount) > 0;

    if (!isLoggedIn && isPaid) {
      // Not logged in, paid VOD
      history.push(Routes.Login);
    } else if (!isLoggedIn && !isPaid) {
      // Not logged in, free VOD (including '0')
      history.push(`/vod-channel/vod/${vod.id}`);
    } else if (isLoggedIn && !isPaid) {
      // Logged in, free VOD (including '0')
      history.push(`/vod-channel/vod/${vod.id}`);
    } else if (isLoggedIn && isPaid) {
      const data = await BillingServices.isRoomPaid(
        profile.id,
        vod.id.toString()
      );

      if (data.data.status === "nok") {
        dispatch(setErrorToast("An internal server Error"));
      } else if (data.data.status === "ok") {
        if (data.data.result.paid === false) {
          setIsPaidRoomModalOpen(true);
        } else {
          setIsPaidRoomModalOpen(false);
          history.push(`/vod-channel/vod/${vod.id}`);
        }
      }
    }
  };

  const onPaidRoomModalConfirm = async () => {
    const data = await BillingServices.payRoomPrice(
      profile.id,
      vod.id.toString()
    );
    if (data.data.status === "ok" && data.data.result.status === "SUCCESS") {
      dispatch(setSuccessToast("You have successfully paid for this VOD"));
      setIsPaidRoomModalOpen(false);
      history.push(`/vod-channel/vod/${vod.id}`);
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

  const handleCollapseClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onCollapseClick) {
      onCollapseClick(vod, event);
    }
  };

  return (
    <>
      <div className="channel-wrapper">
        <div className="channel-wrapper-inner">
          <div className="channel" onClick={onChannelClick} color="light">
            <div className="default-channel-logo-wrapper">
              <div className="custom-collapse" onClick={handleCollapseClick}>
                <IonImg src={dots} />
              </div>

              {/* VOD Preview using logo */}
              {vod.httpsPreviewHigh && !imageLoadErrors ? (
                <IonImg
                  src={vod.httpsPreviewHigh}
                  className="stream-snapshot stream-snapshot-radius"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : null}

              {/* VOD Logo */}
              <img
                src={
                  vod.logo_image
                    ? `${
                        vod.logo_image.formats?.thumbnail?.url ||
                        vod.logo_image.url
                      }`
                    : vod.logo || logo12all
                }
                className="channel-logo"
                alt="vod-logo"
              />

              {/* VOD Name and Stars */}
              <div className="flex justify-between items-center">
                {vod.starsAmount && parseInt(vod.starsAmount) > 0 && (
                  <IonImg src={star} className="w-4" />
                )}
                <span className="channel-name">{vod.name}</span>
                {vod.starsAmount && parseInt(vod.starsAmount) > 0 && (
                  <IonImg src={star} className="w-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {vod && (
        <PaidRoomModal
          isOpen={isPaidRoomModalOpen}
          onConfirm={onPaidRoomModalConfirm}
          onClose={onPaidRoomModalClose}
          starsAmount={
            vod.starsAmount && parseInt(vod.starsAmount) > 0
              ? vod.starsAmount
              : 0
          }
        />
      )}
    </>
  );
};

export default VOD;
