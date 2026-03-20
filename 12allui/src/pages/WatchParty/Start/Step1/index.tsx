import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  // IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  // IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { addCircleOutline, ban, copyOutline, people } from "ionicons/icons";
import Layout from "../../../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { Routes } from "../../../../shared/routes";
import { RouteComponentProps } from "react-router";
import SelectLanguage from "../../../../components/SelectLanguage";
import SelectTemplate from "../SelectTemplate";
import { ReduxSelectors } from "../../../../redux/shared/types";
import {
  setErrorToast,
  setInfoToast,
} from "../../../../redux/actions/toastActions";
import setLivingRoom from "../../../../redux/actions/livingRoomActions";
import { Room, Vlr, VlrBlockedIp } from "../../../../shared/types";
import { BillingServices, VlrService } from "../../../../services";
import SelectLogo from "../../../../components/SelectLogo";
import SelectGenre from "../../../../components/SelectGenre";
import TipsModal from "../../../../components/TipsModal";
import TipButton from "../TipButton";
import ManageBlockedUsers from "../ManageBlockedUsers";
import {
  patchSelectedVlrTemplate,
  resetSelectedVlrTemplate,
} from "../../../../redux/actions/vlrTemplateActions";
import { LivingRoomMode } from "../../enums";
import ScheduledRooms from "../ScheduledRooms";
import { generateWatchPartyInvitationUrl } from "../../../../shared/constants";
import starIcon from "../../../../images/icons/star-sharp.svg";

const filterAvailableRooms = (vlrCollection: Vlr[]) =>
  vlrCollection.filter(
    (vlr) =>
      vlr.room_id !== null && (!vlr.active_connections_count || !vlr.stream)
  );

export const mapRooms = (vlrCollection: Vlr[]) =>
  filterAvailableRooms(vlrCollection).map((vlr) => ({
    id: vlr.id,
    publicId: vlr.public_id,
    roomId: vlr.room_id,
    upSpeedUrl: vlr.up_speed_url,
  }));

const WatchPartyStart1: FC<RouteComponentProps> = ({ history }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedTemplate = useSelector(
    ({ vlrTemplate }: ReduxSelectors) => vlrTemplate.selected
  );
  const { invitationUrl, scheduledRooms } = useSelector(
    ({ livingRoom }: ReduxSelectors) => livingRoom
  );
  const { nickname } = useSelector(({ profile }: ReduxSelectors) => profile);

  const [roomIds, setRoomIds] = useState<Room[]>([]);
  // const [currency, setCurrency] = useState<number | null>(null);
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
  const [openTipModal, setOpenTipModal] = useState<boolean>(false);
  const [tipContent, setTipContent] = useState<Array<string>>([]);
  // billing:
  const [paidInput, setPaidInput] = useState<string | null | undefined>("");
  // eslint-disable-next-line
  const [payInput, setPayInput] = useState<string>("");
  const [isPaidInputChecked, setIsInputChecked] = useState<boolean>(false);
  const [currentPublicId, setCurrentPublicId] = useState<string>("");


  const livingRoom = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

  useEffect(() => {
    if (roomIds.length && selectedTemplate.room.publicId) {
      const roomId = roomIds.find(
        (r) => r.publicId === selectedTemplate.room.publicId
      );
      if (roomId) {
        dispatch(
          setLivingRoom({
            invitationUrl: generateWatchPartyInvitationUrl(roomId.publicId),
          })
        );
      }

      VlrService.getBlockedIps(selectedTemplate.room.publicId).then(
        ({ data }) => setBlockedIps(data.blocked_ips)
      );
    } else {
      dispatch(setLivingRoom({ invitationUrl: "" }));
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
      if (vlr_collection.length === 1) {
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

  const showTip = (tipId: string, required: boolean = false) => {
    if (required) {
      setTipContent([
        t(`vlrTips.${tipId}.title`) + ` (${t("vlrTips.mandatory")})`,
        t(`vlrTips.${tipId}.tip`),
      ]);
    } else {
      setTipContent([t(`vlrTips.${tipId}.title`), t(`vlrTips.${tipId}.tip`)]);
    }
    setOpenTipModal(true);
  };

  const handleChannelNameChange = (channelName: string) => {
    dispatch(patchSelectedVlrTemplate({ channelName }));
  };

  const handleChannelGenreChange = (genre: string | null) => {
    dispatch(patchSelectedVlrTemplate({ genre }));
  };

  const handleChannelDescriptionChange = (description: string) => {
    dispatch(patchSelectedVlrTemplate({ description }));
  };

  const handleLanguageChange = (language: string | null) => {
    dispatch(patchSelectedVlrTemplate({ language }));
  };

  const handleLogoSelected = (logoFile: File | null) => {
    dispatch(patchSelectedVlrTemplate({ logoFile, logo: null }));
  };

  const handleModeChange = (mode: LivingRoomMode) => {
    dispatch(patchSelectedVlrTemplate({ mode }));
  };

  const onRoomChange = (e: any) => {
    const room = roomIds.find((r) => r.publicId === e.detail.value);
    if (room) {
      // billing:
      setCurrentPublicId(room?.publicId);
      BillingServices.getRoomPrice(room?.publicId).then(
        ({ data: { result } }) => {
          if (result && result.stars > 0) {
            setPaidInput(result.stars.toString());
          }
        }
      );
      dispatch(patchSelectedVlrTemplate({ room }));
    }
  };

  const handleCopyInvitationUrl = () => {
    if (invitationUrl) {
      navigator.clipboard
        .writeText(invitationUrl)
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
    const proceedStep2 = () => {
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

      history.push(Routes.WatchPartyStart2);
    };
    if (paidInput && isPaidInputChecked) {
      BillingServices.addRoomPrice(
        selectedTemplate.room.publicId,
        parseInt(paidInput)
      ).then(({ data: { status } }) => {
        if (status === "ok") {
          proceedStep2();
        }
      });
    }

    if (!isPaidInputChecked) {
      BillingServices.addRoomPrice(selectedTemplate.room.publicId, 0).then(
        ({ data: { status } }) => {
          if (status === "ok") {
            proceedStep2();
          }
        }
      );
    }
  };

  const handleModalDismiss = () => {
    setOpenTipModal(false);
  };

  // billing:
  useEffect(() => {
    if (!isPaidInputChecked) {
      setPaidInput("0");
    }
    // else {
    //   BillingServices.getRoomPrice(currentPublicId).then(({data: {result}}) => {
    //     setPaidInput(result.stars.toString())
    //   })
    // }
  }, [isPaidInputChecked, currentPublicId, paidInput]);

  return (
    <Layout>
      <TipsModal
        show={openTipModal}
        content={tipContent}
        onDismiss={handleModalDismiss}
      />
      <IonCard className="wp-start-1">
        <IonCardHeader>
          <IonCardTitle>{t("watchPartyStart.header")} </IonCardTitle>
        </IonCardHeader>

        <IonCardContent
          className={`${scheduledRooms.length ? "has-scheduled-rooms border" : ""}`}
        >
          <section className="scheduled-rooms-section">
            <ScheduledRooms />
          </section>
          <section className="create-room-section pb-16">
            <IonToolbar color="light" className="wp-toolbar">
              <IonText color="dark" slot="start">
                <h2>{t("watchPartyStart.createLivingRoom")}</h2>
              </IonText>

              <SelectTemplate />
            </IonToolbar>

            <hr className="divider" />

            <IonGrid>
              <IonRow>
                <IonCol
                  sizeXs="12"
                  sizeSm="12"
                  sizeMd="12"
                  sizeLg="12"
                  sizeXl="6"
                >
                  <IonItem className="input-item room-id-item">
                    <IonLabel position="stacked">
                      {t("watchPartyStart.roomId") + " *"}
                    </IonLabel>
                    <IonSelect
                      interface="popover"
                      interfaceOptions={{ cssClass: "vlr-select-room-id" }}
                      placeholder={t("watchPartyStart.selectRoomId")}
                      value={selectedTemplate.room.publicId}
                      onIonChange={onRoomChange}
                      disabled={loadingRooms || creatingRoom || !roomIds.length}
                      className="select-room"
                    >
                      {roomIds.map(({ publicId }) => (
                        <IonSelectOption key={publicId} value={publicId}>
                          {publicId}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                    <IonButtons slot="end">
                      <IonButton
                        onClick={() => setOpenBlockedUsersModal(true)}
                        title={t("watchPartyStart.manageBlockedUsers")}
                        disabled={!blockedIps.length}
                      >
                        <IonIcon
                          icon={people}
                          slot="icon-only"
                          className="users-icon"
                        />
                        <IonIcon
                          icon={ban}
                          slot="icon-only"
                          className="block-users-icon"
                        />
                      </IonButton>
                      {loadingRooms || creatingRoom ? (
                        <div className="create-vlr-spinner-container">
                          <IonSpinner name="lines-small" />
                        </div>
                      ) : (
                        <IonButton
                          onClick={createNewRoom}
                          title={t("watchPartyStart.createNewRoom")}
                        >
                          <IonIcon icon={addCircleOutline} slot="icon-only" />
                        </IonButton>
                      )}
                    </IonButtons>

                    <TipButton onClick={() => showTip("roomId", true)} />
                  </IonItem>

                  <IonItem className="input-item" lines="none">
                    <IonLabel position="stacked" color="dark">
                      {t("watchPartyStart.invitation")}
                    </IonLabel>
                    <IonInput value={invitationUrl} readonly />
                    <IonButtons slot="end">
                      <IonButton
                        onClick={handleCopyInvitationUrl}
                        title={t("watchPartyStart.copyInvitation")}
                        disabled={!invitationUrl}
                      >
                        <IonIcon icon={copyOutline} slot="icon-only" />
                      </IonButton>
                    </IonButtons>

                    <TipButton onClick={() => showTip("invitationLink")} />
                  </IonItem>

                  <IonItem className="input-item">
                    <IonLabel position="stacked">
                      {t("watchPartyStart.roomName") + " *"}
                    </IonLabel>
                    <IonInput
                      placeholder={t("watchPartyStart.enterRoomName")}
                      value={selectedTemplate.channelName}
                      onIonChange={(e) =>
                        handleChannelNameChange(e.detail.value || "")
                      }
                    />
                    <TipButton onClick={() => showTip("roomName", true)} />
                  </IonItem>

                  <IonItem className="select-item" lines="none">
                    <SelectLanguage
                      language={selectedTemplate?.language || null}
                      onSelect={handleLanguageChange}
                      showInput
                      inputLabel="watchPartyStart.roomLanguage"
                    />

                    <TipButton onClick={() => showTip("roomLanguage")} />
                  </IonItem>

                  <IonItem className="select-item" lines="none">
                    <SelectGenre
                      genre={selectedTemplate?.genre || null}
                      onSelect={handleChannelGenreChange}
                      showInput
                      inputLabel="watchPartyStart.roomGenre"
                    />

                    <TipButton onClick={() => showTip("roomGenre")} />
                  </IonItem>

                  <IonItem className="select-item" lines="none">
                    <SelectLogo
                      logo={selectedTemplate.logoUrl}
                      logoText="watchPartyStart.roomLogo"
                      selectLogoText="watchPartyStart.selectRoomLogo"
                      onLogoSelected={handleLogoSelected}
                    />

                    <TipButton onClick={() => showTip("roomLogo")} />
                  </IonItem>
                </IonCol>
                <IonCol
                  sizeXs="12"
                  sizeSm="12"
                  sizeMd="12"
                  sizeLg="12"
                  sizeXl="6"
                >
                  <IonItem className="input-item">
                    <IonLabel position="stacked">
                      {t("watchPartyStart.roomDescription")}
                    </IonLabel>
                    <IonTextarea
                      placeholder={t("watchPartyStart.enterRoomDescription")}
                      value={selectedTemplate?.description || null}
                      onIonChange={(e) =>
                        handleChannelDescriptionChange(e.detail.value!)
                      }
                    />

                    <TipButton onClick={() => showTip("roomDescription")} />
                  </IonItem>
                  <IonItem className="sharing-item" lines="none">
                    <IonItem className="sharing-item-label" lines="none">
                      <IonLabel
                        slot="start"
                        color="dark"
                        className="sharing-mode"
                      >
                        {t("watchPartyStart.sharingMode")}
                      </IonLabel>

                      <TipButton onClick={() => showTip("roomSharingMode")} />
                    </IonItem>

                    <IonRadioGroup value={selectedTemplate?.mode || null}>
                      <IonItem
                        onClick={() => handleModeChange(LivingRoomMode.Public)}
                      >
                        <IonRadio value="public" slot="start" />
                        <IonLabel>{t("watchPartyStart.public")}</IonLabel>
                      </IonItem>

                      <IonItem
                        onClick={() => handleModeChange(LivingRoomMode.Private)}
                      >
                        <IonRadio value="private" slot="start" />
                        <IonLabel>{t("watchPartyStart.private")}</IonLabel>
                      </IonItem>

                      {/* <IonRow> */}
                      {/* billing: */}
                      <IonCol sizeXl="6" className="paid-room-share-col">
                        <IonItem
                          // color={BACKGROUND_COLOR}
                          className="paid-room-share-checkbox"
                          lines="none"
                        >
                          <IonCheckbox
                            color="primary"
                            name="paidCheckbox"
                            // checked={rememberMe}
                            onIonChange={() =>
                              setIsInputChecked(!isPaidInputChecked)
                            }
                          />
                          <div className="paid-room-share">
                            <IonLabel>{t("watchPartyStart.paid")}</IonLabel>
                            <IonImg src={starIcon} />
                            <IonLabel>
                              {t("watchPartyStart.paidRoom1")}
                            </IonLabel>
                            <IonInput
                              className="paid-room-input"
                              value={paidInput}
                              onIonChange={(e) => setPaidInput(e.detail.value)}
                              disabled={!isPaidInputChecked}
                            />
                            <IonLabel>
                              {t("watchPartyStart.paidRoom2")}
                            </IonLabel>
                          </div>
                        </IonItem>
                      </IonCol>
                      {/* </IonRow> */}

                      {/* <IonRow> */}
                      {/* billing: */}
                      <IonCol sizeXl="6" className="pay-room-share-col">
                        <IonItem
                          // color={BACKGROUND_COLOR}
                          className="pay-room-share-checkbox"
                          lines="none"
                        >
                          <IonCheckbox
                            color="primary"
                            name="payCheckbox"
                            // checked={rememberMe}
                            onIonChange={(e) => console.log("payinput", e)}
                          />
                          <div className="pay-room-share">
                            <IonLabel>{t("watchPartyStart.pay")}</IonLabel>
                            <IonImg src={starIcon} />
                            <IonLabel>{`${payInput} ${t(
                              "watchPartyStart.payRoom"
                            )}`}</IonLabel>
                          </div>
                        </IonItem>
                      </IonCol>
                      {/* </IonRow> */}

                      {/* <IonGrid className="ion-no-padding">
                        <IonRow>
                          <IonCol>
                            <IonItem
                              onClick={() => handleModeChange(LivingRoomMode.Paid)}
                              className="paid-item"
                              disabled
                            >
                              <IonRadio value="paid" slot="start"/>
                              <IonLabel>{t('watchPartyStart.paid')}</IonLabel>
                            </IonItem>
                          </IonCol>
                          <IonCol className="currency-col">
                            <IonItem disabled>
                              <IonLabel>{t('watchPartyStart.currency')}</IonLabel>
                              <IonInput
                                value={currency}
                                type="number"
                                min="1"
                                disabled={selectedTemplate?.mode !== 'paid'}
                                onIonChange={(e) =>
                                  setCurrency(parseFloat(e.detail.value || ''))
                                }
                              />
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </IonGrid> */}
                    </IonRadioGroup>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonToolbar color="light" className="start-footer">
              <IonButton
                onClick={handleMoveToStep2}
                disabled={
                  !selectedTemplate.channelName ||
                  !selectedTemplate.room.publicId ||
                  !roomIds.length
                }
                slot="start"
              >
                {t("watchPartyStart.next")}
              </IonButton>
            </IonToolbar>
          </section>
        </IonCardContent>
          

        <ManageBlockedUsers
          publicRoomId={selectedTemplate.room.publicId || ""}
          ips={blockedIps}
          open={openBlockedUsersModal}
          onClose={(ips) => {
            ips && setBlockedIps(ips);
            setOpenBlockedUsersModal(false);
          }}
        />
      </IonCard>
    </Layout>
  );
};

export default WatchPartyStart1;
