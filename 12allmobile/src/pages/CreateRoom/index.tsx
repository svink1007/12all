import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonPage,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Redirect,
  RouteComponentProps,
  useHistory,
  useLocation,
} from "react-router";

import "./styles.scss";

import Search from "../../images/channel_page/search.svg";
import Close from "../../images/channel_page/close.svg";
import Camera from "../../images/create-room/camera.svg";
import Channels from "../../images/create-room/channels.svg";
import SocialMedia from "../../images/create-room/social_media.svg";
import Invite from "../../images/create-room/invite.svg";
import Share from "../../images/create-room/share.svg";
import Schedule from "../../images/create-room/schedule.svg";
import Settings from "../../images/create-room/settings.svg";
import Star from "../../images/create-room/star.svg";
import Link from "../../images/create-room/link.svg";
import Clipboard from "../../images/create-room/clipboard.svg";
import EndRoom from "../../images/create-room/exit.svg";
import CreateRoomBtn from "../../images/create-room/create_room_btn.svg";
import CloseBig from "../../images/create-room/close.svg";

import SharedSites from "../Broadcasts/BroadcastData/SharedSites";
import SharedStreams from "../Broadcasts/BroadcastData/SharedStreams";
import { BROADCASTS_PER_SCROLL } from "../../shared/constants";
import { BroadcastOptions } from "../../redux/reducers/broadcastReducers";
import {
  StreamService,
  UserManagementService,
  VlrService,
} from "../../services";
import { ReduxSelectors } from "../../redux/types";
import {
  addStreams,
  updateFavorites,
  updateStreams,
  updateVlrs,
} from "../../redux/actions/broadcastActions";
import DragAndDrop from "../../components/DragAndDrop";
import { LivingRoomMode, Room, Vlr, VlrBlockedIp } from "../../shared/types";
import { Routes } from "../../shared/routes";
import {
  patchSelectedVlrTemplate,
  resetSelectedVlrTemplate,
} from "../../redux/actions/vlrTemplateActions";
import { setErrorToast, setInfoToast } from "../../redux/actions/toastActions";
import setLivingRoom from "../../redux/actions/livingRoomActions";
import { setChannelsSearch } from "../../redux/actions/channelsSearchActions";
import SafeAreaView from "../../components/SafeAreaView";
import setPrevRoute from "../../redux/actions/routeActions";

const filterAvailableRooms = (vlrCollection: Vlr[]) =>
  vlrCollection.filter(
    (vlr) =>
      vlr.room_id !== null && (!vlr.active_connections_count || !vlr.stream)
  );

const mapRooms = (vlrCollection: Vlr[]) =>
  filterAvailableRooms(vlrCollection).map((vlr) => ({
    id: vlr.id,
    publicId: vlr.public_id,
    roomId: vlr.room_id,
    upSpeedUrl: vlr.up_speed_url,
  }));

const CreateRoom: React.FC<RouteComponentProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { history, location } = props;

  const { selectedOption, vlrs, streams } = useSelector(
    ({ broadcast }: ReduxSelectors) => broadcast
  );
  const { isAuthenticated } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const { searchText } = useSelector(
    ({ channelsSearch }: ReduxSelectors) => channelsSearch
  );
  const selectedTemplate = useSelector(
    ({ vlrTemplate }: ReduxSelectors) => vlrTemplate.selected
  );
  const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);

  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [roomIds, setRoomIds] = useState<Room[]>([]);
  const [moderator, setModerator] = useState({
    username: "",
    password: "",
    fsUrl: "",
    upSpeedUrl: "",
  });
  const [creatingRoom, setCreatingRoom] = useState<boolean>(false);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [openBlockedUsersModal, setOpenBlockedUsersModal] =
    useState<boolean>(false);
  const [blockedIps, setBlockedIps] = useState<VlrBlockedIp[]>([]);

  const [filterTypes, setFilterType] = React.useState([]);
  const [categoryType, setCategoryType] = React.useState("channels");
  const [roomType, setRoomType] = React.useState(t("createRoom.private"));
  const [isPaid, setIsPaid] = React.useState(false);
  const [paidAmount, setPaidAmount] = React.useState();

  const channelsScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const viewEntered = useRef<boolean>(false);
  const loadedBroadcasts = useRef<number>(BROADCASTS_PER_SCROLL);
  const urlFilterParams = useRef<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const setSelectedTabData = useCallback(
    (props?: { addToExisting?: boolean; loadAll?: boolean }) => {
      const filterParams = `${
        urlFilterParams.current ? `&${urlFilterParams.current}` : ""
      }`;

      switch (selectedOption) {
        case BroadcastOptions.Vlr:
          VlrService.getLiveAndUpcoming(
            `limit=${loadedBroadcasts.current}&start=0${filterParams}`
          ).then(({ data: { live } }) => dispatch(updateVlrs(live)));
          break;
        case BroadcastOptions.SharedStreams:
          let streamParams = `limit=${BROADCASTS_PER_SCROLL}&start=${
            loadedBroadcasts.current - BROADCASTS_PER_SCROLL
          }${filterParams}&load_snapshots=0`;
          if (props?.loadAll) {
            streamParams = `limit=${loadedBroadcasts.current}&start=0${filterParams}&load_snapshots=0`;
          }
          StreamService.getStreams(streamParams)
            .then(({ data: { data } }) => {
              if (props?.addToExisting) {
                dispatch(addStreams(data));
              } else {
                dispatch(updateStreams(data));
              }
            })
            .finally(() => channelsScrollRef.current?.complete());
          break;
        case BroadcastOptions.Favorites:
          UserManagementService.getFavorites(
            `limit=${loadedBroadcasts.current}&start=0${filterParams}&load_snapshots=0`
          ).then(({ data }) => dispatch(updateFavorites(data)));
          break;
      }
    },
    [dispatch, selectedOption]
  );

  useEffect(() => {
    viewEntered.current = true;

    if (!isAuthenticated) {
      dispatch(setPrevRoute(location.pathname));
      history.push(Routes.Login, { prevPath: location.pathname });
    }
  }, []);

  useEffect(() => {
    if (roomIds.length && selectedTemplate.room.publicId) {
      const roomId = roomIds.find(
        (r) => r.publicId === selectedTemplate.room.publicId
      );
      if (roomId) {
        setInvitationLink(
          `${window.location.origin}${Routes.WatchParty}/${roomId.publicId}`
        );
      }

      // VlrService.getBlockedIps(selectedTemplate.room.publicId).then(
      //   ({ data }) => setBlockedIps(data.blocked_ips)
      // );
    } else {
      setInvitationLink("");
    }
  }, [dispatch, selectedTemplate.room.publicId, roomIds]);

  useEffect(() => {
    const getRooms = async () => {
      setLoadingRooms(true);

      const vlrs = await VlrService.getFreeVlrList();
      const {
        moderator_username,
        moderator_password,
        fs_url,
        up_speed_url,
        vlr_collection,
      } = vlrs.data;
      const ids = mapRooms(vlr_collection);
      setRoomIds(ids);
      if (vlr_collection.length >= 1) {
        dispatch(
          patchSelectedVlrTemplate({
            room: {
              id: vlr_collection[0].id,
              publicId: vlr_collection[0].public_id,
              roomId: vlr_collection[0].room_id,
            },
          })
        );
      }
      setModerator({
        username: moderator_username,
        password: moderator_password,
        fsUrl: fs_url,
        upSpeedUrl: up_speed_url,
      });
    };

    getRooms()
      .catch((err) => console.error(err))
      .finally(() => setLoadingRooms(false));

    return () => {
      dispatch(resetSelectedVlrTemplate());
    };
  }, [dispatch]);

  useEffect(() => {
    if (viewEntered.current) {
      loadedBroadcasts.current = BROADCASTS_PER_SCROLL;
      const params: string[] = [];
      searchText && params.push(`search_query=${searchText}`);
      urlFilterParams.current = params.join("&");
      setSelectedTabData();
    }
  }, [setSelectedTabData, searchText]);

  const loadMoreChannels = () => {
    if (
      (selectedOption === BroadcastOptions.Vlr &&
        loadedBroadcasts.current === vlrs.length) ||
      (selectedOption === BroadcastOptions.SharedStreams &&
        loadedBroadcasts.current === streams.length)
    ) {
      loadedBroadcasts.current += BROADCASTS_PER_SCROLL;
      setSelectedTabData({ loadAll: false, addToExisting: true });
    } else {
      channelsScrollRef.current?.complete();
    }
  };

  const handleSearchInputChange = (value: string) => {
    setInputValue(value);
  };

  const onRemoveFilterTagClick = (tagToRemove: string) => {
    setFilterType(filterTypes.filter((tag) => tag !== tagToRemove));
  };

  const onCategoryBtnClick = (value: string) => {
    setCategoryType(value);
  };

  const onRoomTypeChange = (ev: any) => {
    dispatch(patchSelectedVlrTemplate({ mode: ev.detail.value }));
    setRoomType(ev.detail.value);
  };

  const onRoomTypeCompareWith = (o1: string, o2: string) => {
    return o1 === o2;
  };

  const onPaidCheckBoxChange = (ev: any) => {
    setIsPaid(ev.detail.checked);
  };

  const onPaidAmountChange = (ev: any) => {
    setPaidAmount(ev.detail.value);
  };

  const onEndRoomClick = () => {};

  const onCreateRoomClick = () => {
    history.push(Routes.ProtectedStreamCamera);
  };

  const handleChannelNameChange = (channelName: string) => {
    dispatch(patchSelectedVlrTemplate({ channelName }));
  };

  const handleChannelDescriptionChange = (description: string) => {
    dispatch(patchSelectedVlrTemplate({ description }));
  };

  const handleLogoSelected = (logoFile: File | null) => {
    dispatch(patchSelectedVlrTemplate({ logoFile, logo: null }));
  };

  const handleModeChange = (mode: LivingRoomMode) => {
    dispatch(patchSelectedVlrTemplate({ mode }));
  };

  const handleCopyInvitationUrl = () => {
    if (invitationLink) {
      navigator.clipboard
        .writeText(invitationLink)
        .then(() => dispatch(setInfoToast("invite.copied")));
    }
  };

  const createNewRoom = () => {
    setCreatingRoom(true);

    VlrService.createVlr()
      .then(({ data }) => {
        const ids = mapRooms(data.vlrCollection);
        setRoomIds(ids);

        dispatch(setInfoToast("watchPartyStart.roomCreated"));
        setCreatingRoom(false);
      })
      .catch(() => {
        dispatch(setErrorToast("watchPartyStart.couldNotCreateRoom"));
        setCreatingRoom(false);
      });
  };

  const handleMoveToStep2 = () => {
    dispatch(
      setLivingRoom({
        roomId: selectedTemplate.room.roomId,
        publicRoomId: selectedTemplate.room.publicId,
        moderatorUsername: moderator.username,
        moderatorPassword: moderator.password,
        fsUrl: moderator.fsUrl,
        upSpeedUrl: moderator.upSpeedUrl,
        nickname,
      })
    );

    // history.push(Routes.WatchPartyStart2);
  };
  const onSearch = () => {
    dispatch(setChannelsSearch(inputValue));
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="room-container">
            <div className="close-btn" onClick={handleGoBack}>
              <IonImg src={CloseBig} />
            </div>
            <div className="title-container">
              <p className="title">{t("createRoom.createARoom")}</p>
            </div>
            <div className="input-area">
              <div className="input-container">
                {filterTypes.length > 0 &&
                  filterTypes.map((tag, index) => (
                    <>
                      <div className="tag" key={"tag" + index}>
                        <span>{tag}</span>
                        <button
                          className="close-btn"
                          onClick={() => onRemoveFilterTagClick(tag)}
                        >
                          <IonImg src={Close} />
                        </button>
                      </div>
                    </>
                  ))}
                <input
                  type="text"
                  value={inputValue}
                  placeholder="search channel, user, language, country ..."
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                />
                <div className="search-icon" onClick={onSearch}>
                  <IonImg src={Search} />
                </div>
              </div>
            </div>
            <div className="category-btns">
              <div
                className={`category-btn ${
                  categoryType === "camera" ? "active" : ""
                }`}
                onClick={() => onCategoryBtnClick("camera")}
              >
                <IonImg src={Camera} />
              </div>
              {/* <div
                className={`category-btn ${
                  categoryType === "channels" ? "active" : ""
                }`}
                onClick={() => onCategoryBtnClick("channels")}
              >
                <IonImg src={Channels} />
                <p>{t("createRoom.channels")}</p>
              </div>
              <div
                className={`category-btn ${
                  categoryType === "otherMedia" ? "active" : ""
                }`}
                onClick={() => onCategoryBtnClick("otherMedia")}
              >
                <IonImg src={SocialMedia} />
                <p>{t("createRoom.otherMedia")}</p>
              </div> */}
            </div>
            <div className="category-content">
              {categoryType !== "camera" && (
                <IonInfiniteScroll
                  ref={channelsScrollRef}
                  className="list"
                  onIonInfinite={loadMoreChannels}
                >
                  <IonInfiniteScrollContent className="channel-list-content">
                    {categoryType === "otherMedia" && <SharedSites />}
                    {categoryType === "channels" && (
                      <SharedStreams streams={streams} didPresent={true} />
                    )}
                  </IonInfiniteScrollContent>
                </IonInfiniteScroll>
              )}
              {categoryType === "camera" && (
                <>
                  <div className="camera">
                    <DragAndDrop onLogoSelected={handleLogoSelected} />

                    <div className="camera-title">
                      <IonInput
                        className="room-name-input"
                        value={selectedTemplate.channelName}
                        onIonChange={(e) =>
                          handleChannelNameChange(e.detail.value || "")
                        }
                      />
                    </div>

                    <IonInput
                      className="camera-desc"
                      aria-label={t("createRoom.addDescription")}
                      color="primary"
                      placeholder={t("createRoom.addDescription")}
                      value={selectedTemplate?.description || null}
                      onIonChange={(e) =>
                        handleChannelDescriptionChange(e.detail.value!)
                      }
                    />

                    <div className="camera-status">
                      <p>{t("createRoom.roomActiveStatus")}</p>
                    </div>

                    <div className="camera-btns">
                      <div className="btn">
                        <IonImg src={Invite} />
                        <p>{t("createRoom.invite")}</p>
                      </div>
                      <div className="btn">
                        <IonImg src={Share} />
                        <p>{t("createRoom.share")}</p>
                      </div>
                      <div className="btn">
                        <IonImg src={Schedule} />
                        <p>{t("createRoom.schedule")}</p>
                      </div>
                      <div className="btn">
                        <IonImg src={Settings} />
                        <p>{t("createRoom.settings")}</p>
                      </div>
                    </div>

                    <div className="camera-line"></div>

                    <div className="camera-type">
                      <IonRadioGroup
                        className="radio-group"
                        onIonChange={onRoomTypeChange}
                        compareWith={onRoomTypeCompareWith}
                      >
                        <IonRadio
                          value={t("createRoom.public")}
                          labelPlacement="end"
                        >
                          {t("createRoom.public")}
                        </IonRadio>
                        <IonRadio
                          value={t("createRoom.private")}
                          labelPlacement="end"
                        >
                          {t("createRoom.private")}
                        </IonRadio>
                      </IonRadioGroup>
                    </div>

                    <div className="camera-paid">
                      <IonCheckbox
                        labelPlacement="end"
                        onIonChange={onPaidCheckBoxChange}
                        checked={isPaid}
                      >
                        {t("createRoom.paid")}
                      </IonCheckbox>
                      <IonImg src={Star} />
                      <div className="amount-container">
                        <IonInput
                          size={1}
                          className="input"
                          type="number"
                          inputmode="numeric"
                          aria-label="paid-amount"
                          value={paidAmount}
                          onIonChange={onPaidAmountChange}
                          fill="outline"
                        ></IonInput>
                        <p className="amount-desc">
                          {t("createRoom.paidAmountDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="camera-link">
                      <div className="link">
                        <IonImg src={Link} className="link-img" />
                        <div className="link-container">
                          <p className="link-text">{invitationLink}</p>
                          <p className="link-description">
                            {t("createRoom.linkDescription")}
                          </p>
                        </div>
                      </div>
                      <IonImg
                        src={Clipboard}
                        className="clipboard-img"
                        onClick={handleCopyInvitationUrl}
                      />
                    </div>

                    <div className="camera-room-description">
                      {t("createRoom.roomDescription")}
                    </div>
                  </div>
                  <div className="camera-footer">
                    <div className="end-room-btn" onClick={onEndRoomClick}>
                      <IonImg src={EndRoom} />
                      <p className="end-room-label">
                        {t("createRoom.endRoom")}
                      </p>
                    </div>

                    <div
                      className="create-room-btn"
                      onClick={onCreateRoomClick}
                    >
                      <IonImg src={CreateRoomBtn} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default CreateRoom;
