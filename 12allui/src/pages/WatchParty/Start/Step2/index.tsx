import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonToolbar,
  isPlatform,
  useIonViewWillEnter
} from '@ionic/react';
import {arrowBackOutline, cogOutline} from 'ionicons/icons';

import UserMediaModal from '../../../../components/UserMediaModal';
import MyStream from '../../components/MyStream';
import FileShare from '../../components/FileShare';
import Layout from '../../../../components/Layout';

import {ShareStreamOption} from '../../enums';
import {FileStreamSource, MyStreamSource} from '../../types';

import {useDispatch, useSelector} from 'react-redux';
import setLivingRoom from '../../../../redux/actions/livingRoomActions';
import {LivingRoomState, ReduxSelectors} from '../../../../redux/shared/types';
import SaveTemplate from '../SaveTemplate';
import ShareOptions from '../ShareOptions';
import {Routes} from '../../../../shared/routes';
import {RouteComponentProps} from 'react-router';
import HlsJs from '../../components/HlsJs';
import { UpdateMetadata, VlrService} from '../../../../services';
import SelectFsResolution from '../SelectFsResolution';
import {patchSelectedVlrTemplate, patchSelectedVlrTemplateSchedule} from '../../../../redux/actions/vlrTemplateActions';
import {RoomLayout, SelectedVlrTemplate, SharedStream} from '../../../../shared/types';
import {API_URL} from '../../../../shared/constants';
import VlrSchedule from './VlrSchedule';
import ScheduledRooms from '../ScheduledRooms';
import { setErrorToast } from '../../../../redux/actions/toastActions';
import AddRecordedVod from 'src/pages/VoD/AddRecordedRoom';
type RedirectToLivingRoom = {
  share?: ShareStreamOption | null;
  isOnlyMicCam?: boolean;
  publicId?: string;
  roomId?: string;
  joinRoomWithCoHost?: boolean;
  vlrId?: number;
  roomLayout?: RoomLayout;
};

export const addVlrLogo = async (logoFile: File) => {
  const form = new FormData();
  form.append('files.logo', logoFile, logoFile.name);
  const {data: {logo}} = await VlrService.addLogo(form);
  return logo ? `${API_URL}${logo.url}` : null;
};

const WatchPartyStart2: FC<RouteComponentProps> = ({history}: RouteComponentProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {cam, mic} = useSelector(({userMedia}: ReduxSelectors) => userMedia);
  const {
    channelName,
    language,
    description,
    genre,
    logoUrl,
    share,
    customStreamUrl,
    useMedia,
    mode,
    room,
    streamId,
    showCustomStream,
    roomResolution,
    logoFile,
    schedule
  } = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate.selected);
  const {scheduledRooms} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
  const profile = useSelector(({profile}: ReduxSelectors) => profile);

  const validateStreamRef = useRef<boolean>(false);
  const starting = useRef<boolean>(false);
  const streamRef = useRef<SharedStream | null>(null);
  const freeVlrRef = useRef<{ room_id: string, public_id: string, room_layout?: RoomLayout }>();

  const [{myStream, files}, setSrc] = useState<{
    myStream: MyStreamSource | MyStreamSource[] | null;
    files: FileStreamSource[] | null;
  }>({
    myStream: null,
    files: null
  });
  const [srcIsValid, setSrcIsValid] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [openHlsModal, setOpenHlsModal] = useState<boolean>(false);
  const [validateStream, setValidateStream] = useState<boolean>(false);
  const [hideJoinCamMic, setHideJoinCamMic] = useState<boolean>(false);
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [rtmpServer, setRtmpServer] = useState<string | null>(null);
  const [openRoomBusyAlert, setRoomBusyAlert] = useState<boolean>(false);

  const redirectToLivingRoom = useCallback(async (params?: RedirectToLivingRoom) => {
    params = {
      share: share,
      isOnlyMicCam: useMedia,
      publicId: room.publicId,
      roomId: room.roomId,
      joinRoomWithCoHost: false,
      vlrId: room.id,
      ...params
    };

    const data: UpdateMetadata = {
      channelLogo: logoUrl,
      channelName,
      roomId: params.publicId!,
      channelGenre: genre,
      channelDescription: description,
      channelLanguage: language,
      isPrivate: mode === 'private',
      streamCamera: false,
      streamId: share === ShareStreamOption.Stream ? streamId : null,
      streamUrl: share === ShareStreamOption.Stream ? customStreamUrl : null,
      isVlr: true,
      isHost: true,
      userId: profile.id
    };

    if (logoFile) {
      data.channelLogo = await addVlrLogo(logoFile);
    }


    VlrService.updateMetadata(data).catch((error) => console.error(error));

    const livingRoomData: Partial<LivingRoomState> = {
      share: params.share,
      myStream,
      files,
      joinCamMic: params.isOnlyMicCam,
      cam,
      mic,
      channel: {
        logo: data.channelLogo,
        name: channelName
      },
      streamName: null,
      epgId: null,
      isHost: true,
      singleConnection: !params.isOnlyMicCam,
      roomId: params.roomId,
      publicRoomId: params.publicId,
      joinRoomWithCoHost: params.joinRoomWithCoHost,
      roomResolution,
      vlrId: params.vlrId,
      mode,
      joinedFromJoinScreen: false,
      roomLayout: params.roomLayout
    };

    if (params.share === ShareStreamOption.Stream) {
      livingRoomData.streamName = streamRef.current?.name;
      livingRoomData.epgId = streamRef.current?.epg_channel?.id;
    }

    dispatch(setLivingRoom(livingRoomData));

    history.push(Routes.WatchPartyStartRoom);
  }, [useMedia, room, logoUrl, logoFile, channelName, genre, description, language, mode, share, streamId, customStreamUrl, dispatch, myStream, files, cam, mic, history, roomResolution, profile.id]);


  const checkIfRoomIsFree = useCallback(() => {
    VlrService.checkIfVlrIsFree(room.roomId).then(({data: {status}}) => {


      if (status === 'free') {
        redirectToLivingRoom().catch();
      } else {
        freeVlrRef.current = status;
        setRoomBusyAlert(true);
      }
    });
  }, [redirectToLivingRoom, room.roomId]);

  const onMyStreamSrc = useCallback((source: MyStreamSource | MyStreamSource[] | null, isValid?: boolean, stream?: SharedStream) => {
    setSrc({myStream: source, files: null});
    if (isValid !== undefined) {
      setSrcIsValid(isValid);
    }
    streamRef.current = stream || null;
    stream && dispatch(patchSelectedVlrTemplate({streamId: stream.id, streamUrl: stream.url, useMedia: true}));
  }, [dispatch]);

  const onFilesSrc = useCallback((files: FileStreamSource[]) => {
    setSrc({myStream: null, files});
  }, []);

  const onStreamSrcValid = useCallback((isValid: boolean) => {
    setSrcIsValid(isValid);
    setValidateStream(false);

    if (isValid && validateStreamRef.current) {
      checkIfRoomIsFree();
    }

    validateStreamRef.current = false;
  }, [checkIfRoomIsFree]);

  const onFileSrcValid = useCallback((isValid: boolean) => {
    setSrcIsValid(isValid);
  }, []);

  useIonViewWillEnter(() => {
    starting.current = false;

    if (isPlatform('ios')) {
      setSrc({myStream: null, files: null});
      setSrcIsValid(true);
      dispatch(patchSelectedVlrTemplate({useMedia: true, customStreamUrl: null, share: ShareStreamOption.Camera}));
    }

    if (share !== ShareStreamOption.Stream || showCustomStream) {
      setSrcIsValid(false);
    }
  }, [dispatch, share, showCustomStream]);

  useEffect(() => {
    switch (share) {
      case ShareStreamOption.Stream:
        setHideJoinCamMic(!showCustomStream);
        break;
      case ShareStreamOption.Camera:
        setHideJoinCamMic(true);
        break;
      default:
        setHideJoinCamMic(false);
        break;
    }
  }, [share, showCustomStream]);

  const handleStreamUrlChange = (url: string | null) => {
    dispatch(patchSelectedVlrTemplate({customStreamUrl: url}));
  };

  const generateStreamKey = () =>{
    console.log('here is the st');
  }

  const onShareSelected = (value: ShareStreamOption) => {
    setSrcIsValid(false);

    const dispatchValue: Partial<SelectedVlrTemplate> = {share: value};

    switch (value) {
      case ShareStreamOption.Stream:
      case ShareStreamOption.Hls:
        break;
      case ShareStreamOption.File:
        dispatchValue.customStreamUrl = null;
        break;
      case ShareStreamOption.Camera:
      case ShareStreamOption.Screen:
        dispatchValue.customStreamUrl = null;
        setSrc({myStream: null, files: null});
        setSrcIsValid(true);
        dispatchValue.useMedia = true;
        break;
    }

    dispatch(patchSelectedVlrTemplate(dispatchValue));
  };

  const handleOnStart = () => {
    // to pay room price before opering stream at VLR
    // if(share === ShareStreamOption.Stream) {
    //   BillingServices.payRoomPrice(profile.id, room.publicId).then(({data: {result}}) => {
    //     console.log("pay room price", result)
    //   })
    // }

    // uncomment below code snippet before code deploy
    if ((share === ShareStreamOption.Stream && !myStream && !files) || starting.current) {
      return;
    }
    starting.current = true;
    // Make sure that the user gave mic permission. Otherwise, webrtc will not work.
    navigator.mediaDevices.getUserMedia({audio: true, video: false})
      .then(() => {
        if (share === ShareStreamOption.Stream && !srcIsValid) {
          setValidateStream(true);
          validateStreamRef.current = true;
          starting.current = false;
        } else {
          checkIfRoomIsFree();
        }
      })
      .catch(() => {
        starting.current = false;
        dispatch(setErrorToast('watchPartyStart.userMediaNotAllowed'));
      });
  };

  return (
    <Layout>
      <IonCard className="wp-start-2">
        <IonCardHeader>
          <IonCardTitle>{t('watchPartyStart.header')}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent className={`${scheduledRooms.length ? 'has-scheduled-rooms' : ''}`}>
          <IonButtons className="go-to-step1">
            <IonButton routerLink={Routes.WatchPartyStart1} routerDirection="back" color="dark">
              <IonIcon icon={arrowBackOutline}/>
              <IonText>{t('watchPartyStart.back')}</IonText>
            </IonButton>
          </IonButtons>

          <section className="scheduled-rooms-2-section">
            <ScheduledRooms/>
          </section>
          <section className="what-are-you-sharing-section">
            <IonToolbar color="light" className="wp-toolbar">
              <IonText color="dark" slot="start">
                <h2>{t('watchPartyStart.whatAreYourShare')}</h2>
              </IonText>
            </IonToolbar>

            <hr className="divider"/>

            <main>
              <ShareOptions selected={share} onSelect={onShareSelected}/>

            {(() => {
              switch (share) {
                case ShareStreamOption.Stream:
                  return (
                    <MyStream
                      showIcon
                      showCustomStream={showCustomStream}
                      onSrc={onMyStreamSrc}
                      onValid={onStreamSrcValid}
                      validate={validateStream}
                      onCustomUrlValidationStart={url => dispatch(patchSelectedVlrTemplate({streamId: null, customStreamUrl: url}))}
                      onShowCustomUrlChange={value => dispatch(patchSelectedVlrTemplate({showCustomStream: value, useMedia: true}))}
                    />
                  );
                case ShareStreamOption.File:
                  return (
                    <FileShare onSrc={onFilesSrc} onValid={onFileSrcValid}/>
                  );
                case ShareStreamOption.Hls:
                  return (
                    <HlsJs
                      streamUrl={customStreamUrl}
                      setStreamUrl={handleStreamUrlChange}
                      open={openHlsModal}
                      onClose={() => setOpenHlsModal(false)}
                    />
                  );
                default:
                  return null;
              }
            })()}

              <SelectFsResolution
                initialValue={roomResolution}
                shareType={share}
              />

              <div hidden={share === ShareStreamOption.Hls || share === ShareStreamOption.Obs}>
                <IonItem hidden={hideJoinCamMic} detail={false}>
                  <IonLabel>{t('watchPartyStart.joinWithCamMic')}</IonLabel>
                  <IonCheckbox
                    slot="start"
                    checked={useMedia}
                    onIonChange={e => dispatch(patchSelectedVlrTemplate({useMedia: e.detail.checked}))}
                  />
                </IonItem>

                <IonItem
                  button
                  onClick={() => setShowSettingsModal(true)}
                  hidden={!useMedia}
                  detail={false}
                  lines="none"
                >
                  <IonIcon icon={cogOutline} color="dark" slot="start"/>
                  <IonLabel>{t('watchPartyStart.camMicSettings')}</IonLabel>
                </IonItem>
              </div>

              <div hidden={share !== ShareStreamOption.Obs}>
                <IonItem
                  detail={false}
                  lines="none"
                  className='obs-input-item'
                >
                  <IonLabel color="dark" position="stacked" >{t('watchPartyStart.streamkey')}</IonLabel>
                  <div >
                    <IonInput className='ion-padding'  value={streamKey} onIonChange={e => setStreamKey(e.detail.value!)} placeholder={t('watchPartyStart.streamkeyPlaceholder')}></IonInput>
                    <IonButton onClick={() => generateStreamKey()}>{t('watchPartyStart.generate')}</IonButton>
                  </div>
                </IonItem> 

                <IonItem
                  detail={false}
                  lines="none"
                  className='obs-input-item'
                >
                  <IonLabel color="dark" position="stacked">{t('watchPartyStart.rmtpServer')}</IonLabel>
                  <div>
                    <IonInput value={rtmpServer} onIonChange={e => setRtmpServer(e.detail.value!)} placeholder={t('watchPartyStart.rmtpServerPlaceholder')}></IonInput>
                  </div>
                </IonItem>
              </div>

              <UserMediaModal
                show={showSettingsModal}
                setShow={setShowSettingsModal}
              />

              <IonItem lines="none">
                <IonLabel>{t('watchPartyStart.schedule')}</IonLabel>
                <IonCheckbox
                  slot="start"
                  checked={schedule.show}
                  onIonChange={e => dispatch(patchSelectedVlrTemplateSchedule({show: e.detail.checked}))}
                />
              </IonItem>
            </main>

            {
              schedule.show ?
                <VlrSchedule/>
                :
                <IonToolbar color="light" className="start-footer mb-16">
                  <IonButton
                    onClick={handleOnStart}
                    disabled={
                      (share === ShareStreamOption.File && !srcIsValid) ||
                      share === null
                    }
                    slot="start"
                    hidden={share === ShareStreamOption.Hls}
                  >
                    {t('watchPartyStart.start')}
                  </IonButton>

                  <IonButton
                    hidden={share !== ShareStreamOption.Hls}
                    onClick={() => setOpenHlsModal(true)}
                  >
                    Open
                  </IonButton>

                  <SaveTemplate/>
                </IonToolbar>
            }
          </section>
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={openRoomBusyAlert}
        cssClass="room-is-busy-alert"
        onWillDismiss={() => setRoomBusyAlert(false)}
        message={t('watchPartyStart.roomIsBusy')}
        buttons={[
          {
            text: t('watchPartyStart.joinTheRoom'),
            handler: () => {
              redirectToLivingRoom({
                joinRoomWithCoHost: true,
                isOnlyMicCam: true,
                share: ShareStreamOption.Camera,
                roomLayout: freeVlrRef.current?.room_layout
              }).catch();
            }
          },
          {
            text: t('watchPartyStart.openNewRoom'),
            handler: () => {
              freeVlrRef.current &&
              redirectToLivingRoom({
                roomId: freeVlrRef.current.room_id,
                publicId: freeVlrRef.current.public_id
              });
            }
          },
          {
            text: t('common.cancel'),
            role: 'cancel',
            handler: () => {
              starting.current = false;
            }
          }
        ]}
      />
      <AddRecordedVod/>
    </Layout>
  );
};

export default WatchPartyStart2;
