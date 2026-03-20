import { FC, useEffect, useRef, useState } from "react";
import { IonAvatar, IonImg, IonSpinner, IonText } from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";
import { getCountryCode } from "countries-list";
import Flag from "react-world-flags";

import logo12all from "../../../images/12all-logo-128.svg";
import {
  EpgEntry,
  SharedStreamVlrs,
  Vlr,
  VlrParticipant,
} from "../../../shared/types";
import share from "../../../images/icons/channel-widget-share.png";
import favourite_empty from "../../../images/icons/channel-widget-favourite_empty.svg";
import favouriteFull from "../../../images/icons/favourite_full.svg";
import {
  updateFavoriteStreams,
  updateStreamVlrPreview,
} from "../../../redux/actions/broadcastActions";
import Invite from "../../../components/Invite";
import { API_URL, STREAM_URL } from "../../../shared/constants";
import { StreamService, UserManagementService } from "../../../services";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { ReduxSelectors } from "../../../redux/types";
import BaseService from "../../../services/BaseService";
import { useTranslation } from "react-i18next";

type Props = {
  vlr?: Vlr;
  stream?: SharedStreamVlrs;
  onModalClose: any;
  snapshots: {
    [id: number]: string | undefined;
  };
};

type ControlChannelStreamProps = {
  stream: SharedStreamVlrs;
  onModalClose: any;
  snapshots: {
    [id: number]: string | undefined;
  };
};

type ControlChannelVLRProps = {
  vlr: Vlr;
  onModalClose: any;
  snapshots: {
    [id: number]: string | undefined;
  };
};

interface Participant extends VlrParticipant {
  firstLetter: string;
}

const ControlChannelStream: FC<ControlChannelStreamProps> = ({
  stream,
  onModalClose,
  snapshots,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const requestSnapshotsInterval = useRef<NodeJS.Timeout | null>(null);
  const { favoriteStreams } = useSelector(
    ({ broadcast }: ReduxSelectors) => broadcast
  );
  const { jwtToken, isAnonymous } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [openChannelShare, setOpenChannelShare] = useState(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>();
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);
  const [currentEpg, setCurrentEpg] = useState<EpgEntry>();
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [id: number]: boolean;
  }>({});
  const { updateStreamSnapshotsInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );

  const [timestamp, setTimestamp] = useState(Date.now());

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

  useEffect(() => {
    let isExisted =
      favoriteStreams.filter((favStream) => favStream.id === stream.id).length >
      0
        ? true
        : false;
    setIsFavorite(isExisted);
  }, [favoriteStreams]);

  useEffect(() => {
    (async () => {
      try {
        if (stream?.epg_channel) {
          let epg = await StreamService.getEpgEntries(stream.epg_channel?.id);
          epg.data.forEach((item) => {
            if (
              new Date(item.start_date).getTime() <= new Date().getTime() &&
              new Date(item.stop_date).getTime() >= new Date().getTime()
            ) {
              setCurrentEpg(item);
            }
          });
          setEpgEntries(epg.data);
        }
      } catch (err) {
        console.error("Error fetching EPG data:", err);
        dispatch(setErrorToast("Error occur while fetching the EPG data"));
      }
    })();
  }, [stream?.epg_channel]);

  useEffect(() => {
    // Prevent multiple intervals from being created
    if (requestSnapshotsInterval.current) {
      clearInterval(requestSnapshotsInterval.current);
    }

    // Set the interval to update timestamp every `updateStreamSnapshotsInterval` minutes
    requestSnapshotsInterval.current = setInterval(() => {
      setTimestamp(Date.now());
    }, updateStreamSnapshotsInterval * 100000);

    return () => {
      if (requestSnapshotsInterval.current) {
        clearInterval(requestSnapshotsInterval.current);
      }
    };
  }, [updateStreamSnapshotsInterval]);

  const handleFavoriteClick = () => {
    setSaving(true);

    if (isFavorite) {
      UserManagementService.removeFavoriteStream(stream.id)
        .then(() => {
          dispatch(
            updateFavoriteStreams(
              favoriteStreams.filter((fs) => fs.id !== stream.id)
            )
          );
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotRemoveFavorite"))
        )
        .finally(() => setSaving(false));
    } else {
      UserManagementService.addFavoriteStream(stream.id)
        .then(() => {
          dispatch(updateFavoriteStreams([...favoriteStreams, stream]));
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotAddFavorite"))
        )
        .finally(() => setSaving(false));
    }
  };

  const isAuthenticated = () => {
    return jwtToken && !BaseService.isExpired(jwtToken) && !isAnonymous;
  };

  return (
    <div className="modalContainer" onClick={(event) => onModalClose(event)}>
      <div className="modalContent">
        <div className="channelHeader">
          <div className="channelTitle">{stream?.name || ""}</div>
          {/* <div className="iconLogo"></div> */}
        </div>
        <div className="channelLogo">
          {stream?.vlr && stream.vlr.length > 0 ? (
            <div
              className={`stream-preview-holder stream-previews-${stream.vlr.length}`}
            >
              {stream.vlr.map((vlr) => (
                <IonImg
                  key={vlr.id}
                  src={vlr.channel.https_preview_high as string}
                  onIonError={() => dispatch(updateStreamVlrPreview(vlr.id))}
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
        </div>
        <div className="channelBody">
          {stream?.epg_channel && (
            <div className="flex flex-col justify-center text-black py-3 pl-1 pr-3">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <img
                    src={
                      stream.logo_image
                        ? `${API_URL}${
                            stream.logo_image.formats?.thumbnail?.url ||
                            stream.logo_image.url
                          }`
                        : stream.logo || logo12all
                    }
                    alt="channel-logo"
                    className="w-7"
                  />
                  <div className="text-sm font-bold flex items-center justify-center max-w-44">
                    {currentEpg?.title}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm flex items-center">
                    {stream.genre}
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Flag code={getCountryCode(stream.country) as string} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start max-h-14 mb-4 overflow-y-scroll">
                {currentEpg && (
                  <div className="flex gap-1">
                    <div className="text-sm font-bold whitespace-nowrap">
                      {new Date(currentEpg?.start_date).getHours()}:
                      {new Date(currentEpg?.start_date).getMinutes()} -{" "}
                      {new Date(currentEpg?.stop_date).getHours()}:
                      {new Date(currentEpg?.stop_date).getMinutes()}{" "}
                    </div>
                    <div className="text-sm font-bold text-left">
                      {currentEpg.title}
                    </div>
                  </div>
                )}
                {epgEntries.map((entry) => {
                  if (
                    new Date(entry.start_date).getTime() > new Date().getTime()
                  ) {
                    return (
                      <div className="flex gap-1" key={`epgEntry ${entry.id}`}>
                        <div className="text-sm whitespace-nowrap">
                          {new Date(entry?.start_date).getHours()}:
                          {new Date(entry?.start_date).getMinutes()} -{" "}
                          {new Date(entry?.stop_date).getHours()}:
                          {new Date(entry?.stop_date).getMinutes()}{" "}
                        </div>
                        <div className="text-sm text-left">{entry.title}</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
          {/* {stream.starsAmount && (
            <div className="channelPrice">
              <div className="priceContent">
                <span>$</span>
                {stream.starsAmount} stars
              </div>
            </div>
          )} */}
          <div className="channelBottom">
            <div
              className={`shareBtn ${
                !isAuthenticated() ? "sharedBtn-full" : ""
              }`}
              onClick={() => setOpenChannelShare(true)}
            >
              <div className="content">
                <img src={share} alt="share" />
                <span>{t("controlChannel.share")}</span>
              </div>
            </div>
            {isAuthenticated() && (
              <div
                className={isFavorite ? "favouriteBtn-full" : "favouriteBtn"}
                onClick={handleFavoriteClick}
              >
                <div className="content">
                  {saving ? (
                    <IonSpinner color="secondary" />
                  ) : !isFavorite ? (
                    <img src={favourite_empty} alt="favourite_empty" />
                  ) : (
                    <img src={favouriteFull} alt="favourite_full" />
                  )}
                  <span>{t("controlChannel.favorite")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Invite
        show={openChannelShare}
        url={`${STREAM_URL}/${stream.id}`}
        onClose={() => setOpenChannelShare(false)}
      />
    </div>
  );
};

const ControlChannelVLR: FC<ControlChannelVLRProps> = ({
  vlr,
  onModalClose,
  snapshots,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const requestSnapshotsInterval = useRef<NodeJS.Timeout | null>(null);
  const { favoriteStreams } = useSelector(
    ({ broadcast }: ReduxSelectors) => broadcast
  );
  const { jwtToken } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { updateStreamSnapshotsInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );

  const [timestamp, setTimestamp] = useState(Date.now());
  const [openChannelShare, setOpenChannelShare] = useState(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>();
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);
  const [currentEpg, setCurrentEpg] = useState<EpgEntry>();
  const [previewImageLoadError, setPreviewImageLoadError] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hostFirstLetter, setHostFirstLetter] = useState<string>("");
  const [host, setHost] = useState<VlrParticipant>();
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [id: number]: boolean;
  }>({});

  useEffect(() => {
    if (!vlr?.stream) return;

    let isExisted =
      favoriteStreams.filter((favStream) => favStream.id === vlr.stream?.id)
        .length > 0
        ? true
        : false;
    setIsFavorite(isExisted);
  }, [favoriteStreams, vlr?.stream?.id]);

  useEffect(() => {
    (async () => {
      try {
        if (vlr?.stream?.epg_channel) {
          const epgChannel = vlr.stream?.epg_channel;
          let epg = await StreamService.getEpgEntries(
            typeof epgChannel === "number" ? epgChannel : epgChannel?.id
          );
          epg.data.forEach((item) => {
            if (
              new Date(item.start_date).getTime() <= new Date().getTime() &&
              new Date(item.stop_date).getTime() >= new Date().getTime()
            ) {
              setCurrentEpg(item);
            }
          });
          setEpgEntries(epg.data);
        }
      } catch (err) {
        console.error("Error fetching EPG data:", err);
        dispatch(setErrorToast("Error occur while fetching the EPG data"));
      }
    })();
  }, [vlr?.stream?.epg_channel]);

  useEffect(() => {
    const participants = vlr.participants
      .filter((p) => p.role !== "host")
      .slice(0, 5)
      .reverse()
      .map((participant) => ({
        ...participant,
        firstLetter: participant.nickname
          ? participant.nickname.charAt(0)
          : "U",
      }));

    setParticipants(participants);

    const host = vlr.participants.find(({ role }) => role === "host");
    setHost(host);
    host?.nickname && setHostFirstLetter(host.nickname.charAt(0));
  }, [vlr.participants]);

  useEffect(() => {
    // Prevent multiple intervals from being created
    if (requestSnapshotsInterval.current) {
      clearInterval(requestSnapshotsInterval.current);
    }

    // Set the interval to update timestamp every `updateStreamSnapshotsInterval` minutes
    requestSnapshotsInterval.current = setInterval(() => {
      setTimestamp(Date.now());
    }, updateStreamSnapshotsInterval * 100000);

    return () => {
      if (requestSnapshotsInterval.current) {
        clearInterval(requestSnapshotsInterval.current);
      }
    };
  }, [updateStreamSnapshotsInterval]);

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

  const handleFavoriteClick = () => {
    if (!vlr?.stream) return;

    setSaving(true);

    if (isFavorite) {
      UserManagementService.removeFavoriteStream(vlr.stream?.id)
        .then(() => {
          dispatch(
            updateFavoriteStreams(
              favoriteStreams.filter((fs) => fs.id !== vlr.stream?.id)
            )
          );
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotRemoveFavorite"))
        )
        .finally(() => setSaving(false));
    } else {
      UserManagementService.addFavoriteStream(vlr.stream?.id)
        .then(() => {
          dispatch(updateFavoriteStreams([...favoriteStreams, vlr.stream]));
        })
        .catch(() =>
          dispatch(setErrorToast("notifications.couldNotAddFavorite"))
        )
        .finally(() => setSaving(false));
    }
  };

  const isAuthenticated = () => {
    return jwtToken && !BaseService.isExpired(jwtToken);
  };

  return (
    <div className="modalContainer" onClick={(event) => onModalClose(event)}>
      <div className="modalContent">
        <div className="channelHeader">
          <div className="channelTitle">{vlr.stream?.name || ""}</div>
          {/* <div className="iconLogo"></div> */}
        </div>
        <div className="channelLogo">
          {vlr.channel.https_preview_high && !previewImageLoadError ? (
            <div className={`stream-preview-holder stream-previews-1`}>
              <IonImg
                key={vlr.id}
                src={vlr.channel.https_preview_high as string}
                onIonError={() => setPreviewImageLoadError(true)}
              />
            </div>
          ) : previewImageLoadError &&
            vlr?.stream &&
            !imageLoadErrors[vlr.stream?.id] ? (
            <IonImg
              // src={snapshots[stream.id]}
              src={`https://wp84.12all.tv/img/${vlr.stream?.id}.jpg?t=${timestamp}`}
              className="stream-snapshot stream-snapshot-radius"
              onError={() => handleImageError(vlr.stream?.id || 0)} // Handle error
              onLoad={() => handleImageLoad(vlr.stream?.id || 0)} // Handle successful load
            />
          ) : null}
        </div>
        <div className="channelBody">
          {vlr?.stream?.epg_channel && (
            <div className="flex flex-col justify-center text-black py-3 pl-1 pr-3">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <img
                    src={
                      vlr.stream?.logo_image
                        ? `${API_URL}${
                            vlr.stream?.logo_image.formats?.thumbnail?.url ||
                            vlr.stream?.logo_image.url
                          }`
                        : vlr.stream?.logo || logo12all
                    }
                    alt="channel-logo"
                    className="w-7"
                  />
                  <div className="text-sm font-bold flex items-center justify-center max-w-44">
                    {currentEpg?.title}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-sm flex items-center">
                    {vlr.stream?.genre}
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Flag
                      code={getCountryCode(vlr.stream?.country) as string}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start max-h-14 mb-4 overflow-y-scroll">
                {currentEpg && (
                  <div className="flex gap-1">
                    <div className="text-sm font-bold whitespace-nowrap">
                      {new Date(currentEpg?.start_date).getHours()}:
                      {new Date(currentEpg?.start_date).getMinutes()} -{" "}
                      {new Date(currentEpg?.stop_date).getHours()}:
                      {new Date(currentEpg?.stop_date).getMinutes()}{" "}
                    </div>
                    <div className="text-sm font-bold text-left">
                      {currentEpg.title}
                    </div>
                  </div>
                )}
                {epgEntries.map((entry) => {
                  if (
                    new Date(entry.start_date).getTime() > new Date().getTime()
                  ) {
                    return (
                      <div className="flex gap-1" key={`epgEntry ${entry.id}`}>
                        <div className="text-sm whitespace-nowrap">
                          {new Date(entry?.start_date).getHours()}:
                          {new Date(entry?.start_date).getMinutes()} -{" "}
                          {new Date(entry?.stop_date).getHours()}:
                          {new Date(entry?.stop_date).getMinutes()}{" "}
                        </div>
                        <div className="text-sm text-left">{entry.title}</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
          {/* {vlr.stream?.starsAmount && (
            <div className="channelPrice">
              <div className="priceContent">
                <span>$</span>
                {vlr.stream?.starsAmount} stars
              </div>
            </div>
          )} */}
          <div className="w-full flex justify-between pl-2 pb-4">
            {host?.avatar ? (
              <IonAvatar
                slot="start"
                title={host.nickname || ""}
                className="w-8 h-8"
              >
                <img src={`${API_URL}${host.avatar}`} alt="" />
              </IonAvatar>
            ) : hostFirstLetter ? (
              <IonText
                slot="start"
                title={host?.nickname || ""}
                className="text-black w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"
              >
                {hostFirstLetter}
              </IonText>
            ) : null}
            <div className="flex gap-1">
              {participants.slice(4).map((participant) => {
                return (
                  <>
                    {participant.avatar ? (
                      <IonAvatar
                        slot="start"
                        title={participant.nickname || ""}
                        className="w-8 h-8"
                      >
                        <img src={`${API_URL}${participant.avatar}`} alt="" />
                      </IonAvatar>
                    ) : (
                      <IonText
                        slot="start"
                        title={participant?.nickname || ""}
                        className="text-black w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"
                      >
                        {participant.nickname.charAt(0)}
                      </IonText>
                    )}
                  </>
                );
              })}
              {participants.length - 4 > 0 && (
                <IonText
                  slot="start"
                  className="text-black w-8 h-8 rounded-full bg-red-800 flex items-center justify-center"
                >
                  +{participants.length - 4}
                </IonText>
              )}
            </div>
          </div>

          <div className="channelBottom">
            <div
              className={`shareBtn ${
                !isAuthenticated() ? "sharedBtn-full" : ""
              }`}
              onClick={() => setOpenChannelShare(true)}
            >
              <div className="content">
                <img src={share} alt="share" />
                <span>{t("controlChannel.share")}</span>
              </div>
            </div>
            {isAuthenticated() && (
              <div
                className={isFavorite ? "favouriteBtn-full" : "favouriteBtn"}
                onClick={handleFavoriteClick}
              >
                <div className="content">
                  {saving ? (
                    <IonSpinner color="secondary" />
                  ) : !isFavorite ? (
                    <img src={favourite_empty} alt="favourite_empty" />
                  ) : (
                    <img src={favouriteFull} alt="favourite_full" />
                  )}
                  <span>{t("controlChannel.favorite")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Invite
        show={openChannelShare}
        url={`${STREAM_URL}/${vlr.stream?.id}`}
        onClose={() => setOpenChannelShare(false)}
      />
    </div>
  );
};

const ControlChannel: FC<Props> = ({
  vlr,
  stream,
  onModalClose,
  snapshots,
}: Props) => {
  return (
    <>
      {vlr ? (
        <ControlChannelVLR
          vlr={vlr}
          onModalClose={onModalClose}
          snapshots={snapshots}
        />
      ) : stream ? (
        <ControlChannelStream
          stream={stream}
          onModalClose={onModalClose}
          snapshots={snapshots}
        />
      ) : null}
    </>
  );
};

export default ControlChannel;
