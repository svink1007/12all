import React, {FC, useRef, useState} from 'react';
import './styles.scss';
import one2allLogo from '../../../../images/12all-logo-128.png';
import {
  IonAlert,
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonListHeader,
  IonPopover,
  IonText,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {UpdateMetadata, VlrScheduleService, VlrService} from '../../../../services';
import {VlrScheduleDTO} from '../../../../shared/types';
import {createOutline, ellipsisVerticalOutline, trashOutline} from 'ionicons/icons';
import {parseRoomStart} from '../../../../shared/constants';
import {useDispatch, useSelector} from 'react-redux';
import setLivingRoom from '../../../../redux/actions/livingRoomActions';
import EditScheduledRoom from '../EditScheduledRoom';
import {setInfoToast} from '../../../../redux/actions/toastActions';
import {LivingRoomState, ReduxSelectors} from '../../../../redux/shared/types';
import {patchSelectedVlrTemplate} from '../../../../redux/actions/vlrTemplateActions';
import {ShareStreamOption} from '../../enums';
import {Routes} from '../../../../shared/routes';
import {useHistory} from 'react-router-dom';
import {getStreamSource} from '../../components/MyStream';
import {Dispatch} from 'redux';

let _roomSoonOnAirThreshold = 1800000;

export interface VlrScheduledRoom extends VlrScheduleDTO {
  startAtLocal: string;
  soonOnAir: boolean;
}

const setSoonOnAir = (startAt: string) => {
  const startingDate = Date.now() + _roomSoonOnAirThreshold;
  return startingDate >= Date.parse(startAt);
};

const setNextSoonInAir = (rooms: VlrScheduledRoom[], dispatch: Dispatch) => {
  const roomNotInAir = rooms.find(r => !r.soonOnAir);
  if (roomNotInAir) {
    return setTimeout(() => {
      dispatch(setLivingRoom({scheduledRooms: rooms.map(parseVlrScheduledDTO)}));
    }, Date.parse(roomNotInAir.start_at) - Date.now());
  }
};

export const parseVlrScheduledDTO = (vlr: VlrScheduleDTO): VlrScheduledRoom => {
  return {
    ...vlr,
    startAtLocal: parseRoomStart(vlr.start_at),
    soonOnAir: setSoonOnAir(vlr.start_at)
  };
};

const ScheduledRooms: FC = () => {
  const history = useHistory();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const scheduledRooms = useSelector(({livingRoom}: ReduxSelectors) => livingRoom.scheduledRooms);
  const {nickname} = useSelector(({profile}: ReduxSelectors) => profile);
  const {roomSoonOnAirThreshold} = useSelector(({webConfig}: ReduxSelectors) => webConfig);
  const {cam, mic} = useSelector(({userMedia}: ReduxSelectors) => userMedia);
  const popover = useRef<HTMLIonPopoverElement>(null);
  const soonInAirTimeout = useRef<NodeJS.Timeout>();
  const selectedRoom = useRef<VlrScheduledRoom>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [openEditSchedule, setOpenEditSchedule] = useState(false);
  const [openConfirmAlert, setOpenConfirm] = useState(false);

  useIonViewWillEnter(() => {
    _roomSoonOnAirThreshold = roomSoonOnAirThreshold;

    VlrScheduleService.getScheduledRooms().then(({data}) => {
      const rooms = data.map(parseVlrScheduledDTO);
      soonInAirTimeout.current = setNextSoonInAir(rooms, dispatch);
      dispatch(setLivingRoom({scheduledRooms: rooms}));
    });
  }, [dispatch]);

  useIonViewWillLeave(() => {
    soonInAirTimeout.current && clearTimeout(soonInAirTimeout.current);
  }, []);

  const handleOpenPopover = (e: React.MouseEvent, room: VlrScheduledRoom) => {
    selectedRoom.current = room;
    popover.current!.event = e;
    setPopoverOpen(true);
  };

  const handleRemoveRoom = () => {
    const id = (selectedRoom.current!).id;
    VlrScheduleService.removeScheduledRoom(id).then(() => {
      dispatch(setInfoToast('vlrSchedule.roomRemoved'));
      dispatch(setLivingRoom({scheduledRooms: scheduledRooms.filter(room => room.id !== id)}));
    });
  };

  const handleRoomUpdate = (updatedRoom: VlrScheduleDTO) => {
    const updateRoomParsed = parseVlrScheduledDTO(updatedRoom);
    const rooms = scheduledRooms
      .map(room => room.id === updateRoomParsed.id ? updateRoomParsed : room)
      .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
    soonInAirTimeout.current = setNextSoonInAir(rooms, dispatch);
    dispatch(setLivingRoom({scheduledRooms: rooms}));
  };

  const handlePreviewClick = (room: VlrScheduledRoom) => {
    const {
      name,
      genre,
      language,
      description,
      use_user_media,
      mode,
      logo,
      vlr,
      stream,
      share_type,
      custom_stream_url,
      room_resolution
    } = room;

    dispatch(patchSelectedVlrTemplate({
      room: {
        id: vlr.id,
        publicId: vlr.public_id,
        roomId: vlr.room_id
      },
      channelName: name,
      genre: genre || null,
      language: language || null,
      description: description || null,
      mode,
      logoUrl: logo,
      share: share_type,
      streamId: stream?.id,
      customStreamUrl: custom_stream_url,
      useMedia: use_user_media,
      showCustomStream: !!custom_stream_url,
      roomResolution: room_resolution
    }));
  };

  const handleStartClick = async (room: VlrScheduledRoom) => {
    const {
      name,
      genre,
      language,
      description,
      mode,
      logo,
      vlr,
      share_type,
      use_user_media,
      custom_stream_url,
      stream,
      room_resolution
    } = room;

    const data: UpdateMetadata = {
      channelLogo: logo || null,
      channelName: name,
      roomId: vlr.public_id,
      channelGenre: genre || null,
      channelDescription: description || null,
      channelLanguage: language || null,
      isPrivate: mode === 'private',
      streamCamera: false,
      streamId: share_type === ShareStreamOption.Stream && stream ? stream.id : null,
      streamUrl: share_type === ShareStreamOption.Stream && stream ? stream.url : null,
      isVlr: true
    };

    const {
      data: {
        fs_url,
        moderator_password,
        moderator_username,
        up_speed_url
      }
    } = await VlrService.updateMetadata(data);

    const livingRoomData: Partial<LivingRoomState> = {
      share: share_type,
      myStream: stream ? getStreamSource(stream.url) : custom_stream_url ? getStreamSource(custom_stream_url) : null,
      files: null,
      joinCamMic: use_user_media,
      cam,
      mic,
      channel: {
        logo: logo || null,
        name
      },
      streamName: null,
      epgId: null,
      isHost: true,
      singleConnection: !use_user_media,
      roomId: vlr.room_id,
      publicRoomId: vlr.public_id,
      joinRoomWithCoHost: false,
      vlrId: vlr.id,
      mode,
      joinedFromJoinScreen: false,
      nickname,
      moderatorUsername: moderator_username,
      moderatorPassword: moderator_password,
      fsUrl: fs_url,
      upSpeedUrl: up_speed_url,
      roomResolution: room_resolution
    };
    dispatch(setLivingRoom(livingRoomData));
    history.push(Routes.WatchPartyStartRoom);
  };

  return (
    <IonList className="scheduled-rooms-list">
      <IonListHeader>{t('watchPartyStart.upcomingRooms')}</IonListHeader>
      <IonContent>
        {
          scheduledRooms.map((room: VlrScheduledRoom) => (
            <IonItemGroup key={room.id} class="room-group-item">
              <IonItem class="room-data" lines="none">
                <IonAvatar slot="start">
                  <img src={room.logo || one2allLogo} alt=""/>
                </IonAvatar>
                <div className="meta">
                  <div>
                    <IonText className="share">{t(`vlrSchedule.${room.share_type}`)}</IonText>
                    <IonText className="name">{room.name}</IonText>
                  </div>
                  <IonText className="date">{room.startAtLocal}</IonText>
                  <IonText className={`mode ${room.mode}`}>{t(`common.${room.mode}`)}</IonText>
                </div>
                <IonButtons slot="end">
                  <IonButton onClick={(e) => handleOpenPopover(e, room)}>
                    <IonIcon icon={ellipsisVerticalOutline} slot="icon-only" size="small"/>
                  </IonButton>
                </IonButtons>
              </IonItem>
              {
                room.soonOnAir &&
                <IonItem className="on-air" lines="none">
                  <IonButtons slot="end">
                    {
                      (room.share_type === ShareStreamOption.File || (
                        room.share_type === ShareStreamOption.Stream &&
                        !room.custom_stream_url &&
                        !room.stream
                      )) ?
                        null
                        :
                        <IonButton color="success" onClick={() => handleStartClick(room)}>
                          {t('common.start')}
                        </IonButton>
                    }
                    <IonButton color="warning" onClick={() => handlePreviewClick(room)}>
                      {t('common.preview')}
                    </IonButton>
                  </IonButtons>
                </IonItem>
              }
            </IonItemGroup>
          ))
        }
      </IonContent>
      <IonPopover
        ref={popover}
        isOpen={popoverOpen}
        onDidDismiss={() => setPopoverOpen(false)}
        dismissOnSelect>
        <IonList>
          <IonItem button onClick={() => setOpenEditSchedule(true)}>
            <IonIcon icon={createOutline} slot="start" color="warning"/>
            <IonLabel color="warning">{t('common.edit')}</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setOpenConfirm(true)}>
            <IonIcon icon={trashOutline} slot="start" color="danger"/>
            <IonLabel color="danger">{t('common.remove')}</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
      <IonAlert
        isOpen={openConfirmAlert}
        onWillDismiss={() => setOpenConfirm(false)}
        message={t('vlrSchedule.removeSchedule')}
        buttons={[
          {
            text: t('common.cancel'),
            role: 'cancel'
          },
          {
            text: t('common.yes'),
            handler: () => handleRemoveRoom()
          }
        ]}
      />
      {
        selectedRoom.current &&
        <EditScheduledRoom
          room={selectedRoom.current}
          isOpen={openEditSchedule}
          onUpdateDone={handleRoomUpdate}
          onDismiss={setOpenEditSchedule}
        />
      }
    </IonList>
  );
};

export default ScheduledRooms;
