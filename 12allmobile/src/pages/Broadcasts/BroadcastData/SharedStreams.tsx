import { IonImg, useIonViewWillLeave } from "@ionic/react";
import { FC, useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import cx from "classnames";
import { RouteComponentProps, useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import logo12all from "../../../images/12all-logo-128.svg";
import star from "../../../images/create-room/star.svg";
import { updateStreamVlrPreview } from "../../../redux/actions/broadcastActions";
import { API_URL } from "../../../shared/constants";
import { SharedStreamVlrs } from "../../../shared/types";
import { Routes } from "../../../shared/routes";
import { StreamSnapshotService } from "../../../services";
import { ReduxSelectors } from "../../../redux/types";
import ControlChannel from "./ControlChannel";
import dots from "../../../images/icons/dots.svg";
import BaseService from "../../../services/BaseService";
import { BillingServices } from "../../../services/BillingServices";
import {
  setErrorToast,
  setSuccessToast,
} from "../../../redux/actions/toastActions";
import setPrevRoute from "../../../redux/actions/routeActions";

interface Props extends RouteComponentProps {
  streams: SharedStreamVlrs[];
  didPresent: boolean;
}

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

const SharedStreams: FC<Props> = ({ streams, didPresent, history }: Props) => {
  const dispatch = useDispatch();
  const { updateStreamSnapshotsInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const snapshotsRef = useRef<{ [id: number]: string }>({});
  const requestSnapshotsInterval = useRef<NodeJS.Timeout | null>(null);
  const [componentStreams, setComponentStreams] = useState<SharedStreamVlrs[]>(
    []
  );
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [id: number]: boolean;
  }>({});

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedModalStream, setSelectedModalStream] = useState<any>();
  const [timestamp, setTimestamp] = useState(Date.now());
  const [snapshots, setSnapshots] = useState<{
    [id: number]: string | undefined;
  }>({});
  const [isPaidRoomModalOpen, setIsPaidRoomModalOpen] = useState(false);

  const handleImageError = (id: number) => {
    setImageLoadErrors((prevErrors) => ({
      ...prevErrors,
      [id]: true,
    }));
  };

  const handleImageLoad = (id: number) => {
    setImageLoadErrors((prevErrors) => ({
      ...prevErrors,
      [id]: false,
    }));
  };

  useIonViewWillLeave(() => {
    requestSnapshotsInterval.current &&
      clearInterval(requestSnapshotsInterval.current);
  }, []);

  useEffect(() => {
    // Prevent multiple intervals from being created
    if (didPresent) {
      if (requestSnapshotsInterval.current) {
        clearInterval(requestSnapshotsInterval.current);
      }

      // Set the interval to update timestamp every `updateStreamSnapshotsInterval` minutes
      requestSnapshotsInterval.current = setInterval(() => {
        setTimestamp(Date.now());
      }, updateStreamSnapshotsInterval * 100000);
    }

    return () => {
      if (requestSnapshotsInterval.current) {
        clearInterval(requestSnapshotsInterval.current);
      }
    };
  }, [didPresent, updateStreamSnapshotsInterval]);

  // useEffect(() => {
  //   if (didPresent) {
  //     requestSnapshotsInterval.current = setInterval(() => {
  //       StreamSnapshotService.getSnapshots(
  //         Object.keys(snapshotsRef.current)
  //       ).then(({ data }) => {
  //         data.forEach(
  //           ({ id, snapshot }) => (snapshotsRef.current[id] = snapshot)
  //         );
  //         setSnapshots({ ...snapshotsRef.current });
  //       });
  //     }, updateStreamSnapshotsInterval * 100000); // 1min = 60000ms
  //   }
  //   return () => {
  //     requestSnapshotsInterval.current &&
  //       clearInterval(requestSnapshotsInterval.current);
  //   };
  // }, [didPresent, updateStreamSnapshotsInterval]);

  useEffect(() => {
    const mappedStreams = streams.map((stream) => {
      const vlr = stream.vlr
        ?.filter((vlr) => vlr.channel?.https_preview_high)
        .slice(0, 20)
        .map((vlr) => {
          vlr.channel.https_preview_high = `${
            vlr.channel.https_preview_high
          }?hash=${Date.now()}`;
          return vlr;
        });
      return { ...stream, vlr, isSelected: false };
    });

    setComponentStreams(mappedStreams);

    // const streamsWithoutSnapshot = streams.filter(
    //   ({ id }) => snapshotsRef.current[id] === undefined
    // );
    // if (streamsWithoutSnapshot.length) {
    //   streamsWithoutSnapshot.forEach(
    //     ({ id }) => (snapshotsRef.current[id] = "")
    //   );
    //   StreamSnapshotService.getSnapshots(
    //     streamsWithoutSnapshot.map(({ id }) => id)
    //   ).then(({ data }) => {
    //     data.forEach(
    //       ({ id, snapshot }) => (snapshotsRef.current[id] = snapshot)
    //     );
    //     setSnapshots({ ...snapshotsRef.current });
    //   });
    // }
  }, [streams]);

  const onCollapseClick = (key: SharedStreamVlrs, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedModalStream(key);
    setIsOpen(true);
  };

  const onModalClose = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  const onChannelClick = async (stream: SharedStreamVlrs) => {
    console.log(
      "PROFILE:JWTTOKEN:",
      profile.jwtToken,
      !BaseService.isExpired(profile.jwtToken),
      stream
    );
    // if (
    //   (profile.jwtToken && !BaseService.isExpired(profile.jwtToken))) {
    //     if (stream.starsAmount && parseInt(stream.starsAmount) > 0 ) {
    //       BillingServices.isRoomPaid(profile.id, stream.id.toString()).then(
    //         (result) => {
    //           if (result.data.result.paid === false) {
    //             setIsPaidRoomModalOpen(true);
    //           } else {
    //             setIsPaidRoomModalOpen(false);
    //           }
    //         }
    //       );
    //     }
    //     return;
    //   }

    const isLoggedIn =
      profile.jwtToken &&
      !BaseService.isExpired(profile.jwtToken) &&
      !profile.isAnonymous;

    // Treat '0' (string or number) as a free stream
    const isPaid = !!stream.starsAmount && parseInt(stream.starsAmount) > 0;

    if (!isLoggedIn && isPaid) {
      // Not logged in, paid stream
      dispatch(setPrevRoute(""));
      history.push(Routes.Login);
    } else if (!isLoggedIn && !isPaid) {
      // Not logged in, free stream (including '0')
      console.log("IS NOT LOGGED IN AND REDIRECTION");
      dispatch(setPrevRoute(`${Routes.ProtectedStream}/${stream.id}`));
      history.push(Routes.Login);
    } else if (isLoggedIn && !isPaid) {
      // Logged in, free stream (including '0')
      console.log("IS LOGGED IN AND REDIRECTION");
      history.push(`${Routes.ProtectedStream}/${stream.id}`);
    } else if (isLoggedIn && isPaid) {
      const data = await BillingServices.isRoomPaid(
        profile.id,
        stream.id.toString()
      );

      if (data.data.status === "nok") {
        dispatch(setErrorToast("An internal server Error"));
      } else if (data.data.status === "ok") {
        if (data.data.result.paid === false) {
          setSelectedModalStream(stream);
          setIsPaidRoomModalOpen(true);
        } else {
          setIsPaidRoomModalOpen(false);
          history.push(`${Routes.ProtectedStream}/${stream.id}`);
        }
      }
    }
  };

  const onPaidRoomModalConfirm = async () => {
    const data = await BillingServices.payRoomPrice(
      profile.id,
      selectedModalStream.id.toString()
    );
    if (data.data.status === "ok" && data.data.result.status === "SUCCESS") {
      setSuccessToast("You have successfully paid for this room");
      setIsPaidRoomModalOpen(false);
      history.push(`${Routes.ProtectedStream}/${selectedModalStream.id}`);
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
      {isOpen && (
        <ControlChannel
          stream={selectedModalStream}
          onModalClose={onModalClose}
          snapshots={snapshots}
        />
      )}
      {componentStreams.map((stream: SharedStreamVlrs, index: number) => (
        <div
          className={cx("channel-wrapper", stream.isSelected ? "selected" : "")}
          key={`stream-id-${stream.id}`}
        >
          <div className="channel-wrapper-inner">
            <div
              className="channel"
              color="light"
              onClick={() => onChannelClick(stream)}
            >
              <div className="default-channel-logo-wrapper">
                <div
                  className="custom-collapse"
                  onClick={(event) => onCollapseClick(stream, event)}
                >
                  <IonImg src={dots} />
                </div>
                {stream.vlr && stream.vlr.length > 0 ? (
                  <div
                    className={`stream-preview-holder stream-previews-${stream.vlr.length}`}
                  >
                    {stream.vlr.map((vlr) => (
                      <IonImg
                        key={vlr.id}
                        src={vlr.channel.https_preview_high as string}
                        onIonError={() =>
                          dispatch(updateStreamVlrPreview(vlr.id))
                        }
                      />
                    ))}
                  </div>
                ) : !imageLoadErrors[stream.id] ? (
                  <IonImg
                    // src={snapshots[stream.id]}
                    src={`https://wp84.12all.tv/img/${stream.id}.jpg?t=${timestamp}`}
                    className="stream-snapshot stream-snapshot-radius"
                    onError={() => handleImageError(stream.id)} // Handle error
                    onLoad={() => handleImageLoad(stream.id)} // Handle successful load
                  />
                ) : null}

                <img
                  src={
                    stream.logo_image
                      ? `${API_URL}${
                          stream.logo_image.formats?.thumbnail?.url ||
                          stream.logo_image.url
                        }`
                      : stream.logo || logo12all
                  }
                  className="channel-logo"
                  alt="channel-logo"
                />
                <div className="flex justify-between items-center">
                  {stream.starsAmount && <IonImg src={star} className="w-4" />}
                  <span className="channel-name">{stream.name}</span>
                  {stream.starsAmount && <IonImg src={star} className="w-4" />}
                </div>
              </div>
            </div>

            {/* <StreamToolbar
              stream={stream}
              shareLink={`${STREAM_URL}/${stream.id}`}
            /> */}
          </div>
        </div>
      ))}

      {selectedModalStream && (
        <PaidRoomModal
          isOpen={isPaidRoomModalOpen}
          onConfirm={onPaidRoomModalConfirm}
          onClose={onPaidRoomModalClose}
          starsAmount={
            selectedModalStream.starsAmount &&
            selectedModalStream.starsAmount > 0
              ? selectedModalStream.starsAmount
              : 0
          }
        />
      )}
    </>
  );
};

export default withRouter(SharedStreams);
