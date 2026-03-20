import React, {FC, FormEvent, useEffect, useRef, useState} from 'react';
import './styles.scss';
import Layout from '../../../components/Layout';
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import {FreeVlrListResponse, Server, SharedStream, Vlr} from '../../../shared/types';
import {RouteComponentProps} from 'react-router';
import {useDispatch} from 'react-redux';
import {setRoomTest} from '../../../redux/actions/roomTestActions';
import {Routes} from '../../../shared/routes';
import {cogOutline} from 'ionicons/icons';
import UserMediaModal from '../../../components/UserMediaModal';
import {setErrorToast, setWarnToast} from '../../../redux/actions/toastActions';
import {ServerService, VlrService} from '../../../services';
import {StreamService} from '../../../services/StreamService';

const RoomHomePage: FC<RouteComponentProps> = ({history}) => {
  const dispatch = useDispatch();
  const vlrResponseData = useRef<FreeVlrListResponse>();
  const customPort = useRef<HTMLIonInputElement>(null);

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [joinOtherRoom, setJoinOtherRoom] = useState<boolean>(false);
  const [streams, setStreams] = useState<SharedStream[]>([]);
  const [streamId, setStreamId] = useState<number>();
  const [vlrs, setVlrs] = useState<Vlr[]>([]);
  const [vlrId, setVlrId] = useState<number>();
  const [vlrPublicId, setVlrPublicId] = useState<string | null>(null);
  const [numberOfParticipants, setNumberOfParticipants] = useState<number>(0);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  useEffect(() => {
    ServerService.getServers().then(({data}) => {
      setServers(data);
      data.length && setSelectedServer(data[0].name);
    });
    StreamService.getSharedStreams()
      .then(({data}) => {
        setStreams(data.data);
        if (data.data.length) {
          setStreamId(data.data[0].id);
        }
      });

    VlrService.getFreeVlrList()
      .then(({data}) => {
        vlrResponseData.current = data;
        setVlrs(data.vlr_collection);
        setVlrId(data.vlr_collection[0].id);
      });
  }, []);

  const handleStart = (e: FormEvent) => {
    e.preventDefault();

    const dispatchRoom = (
      roomId: string,
      publicId: string,
      streamName?: string,
      streamUrl?: string,
      moderatorUsername?: string,
      moderatorPassword?: string
    ) => {
      const fsUrl = `wss://${selectedServer}.12all.tv:${customPort.current?.value ? customPort.current.value : '8082'}`;
      dispatch(setRoomTest({
        fsUrl,
        streamName,
        streamUrl,
        roomId,
        moderatorPassword,
        moderatorUsername,
        publicId,
        numberOfParticipants
      }));

      history.push(Routes.RoomTest);
    };

    if (!joinOtherRoom) {
      const stream = streams.find(s => s.id === streamId);
      const room = vlrs.find(v => v.id === vlrId);
      if (room && stream && vlrResponseData.current) {
        const {room_id, public_id} = room;
        const {name, url} = stream;
        const {moderator_username, moderator_password} = vlrResponseData.current;
        if (!moderator_username || !moderator_password) {
          dispatch(setWarnToast('sharedStream.noModeratorRights'));
        }
        dispatchRoom(room_id, public_id, name, url, moderator_username, moderator_password);
      }
    } else if (vlrPublicId) {
      VlrService.mapVlrPublicId(vlrPublicId)
        .then(({data}) => {
          const {status, mappedId} = data;
          let errorMessage = '';

          switch (status) {
            case 'ok':
              dispatchRoom(mappedId, vlrPublicId)
              return;
            case 'room_not_found':
              errorMessage = 'notifications.noRoom';
              break;
            default:
              errorMessage = 'notifications.roomError';
              break;
          }

          dispatch(setErrorToast(errorMessage));
        });
    }
  };

  return (
    <Layout>
      <form className="room-home-page" onSubmit={handleStart}>
        <h1>Room test</h1>
        <IonItem className="row-item">
          <IonRadioGroup value={selectedServer} onIonChange={(e) => setSelectedServer(e.detail.value)}>
            <IonListHeader>
              <IonLabel>Select server</IonLabel>
            </IonListHeader>
            {
              servers.map(({id, name}) => (
                <IonItem slot="start" key={id}>
                  <IonRadio value={name} slot="start"/>
                  <IonLabel>{name}</IonLabel>
                </IonItem>
              ))
            }
          </IonRadioGroup>
        </IonItem>

        <IonItem slot="end">
          <IonLabel position="stacked">Enter custom port (optional)</IonLabel>
          <IonInput
            type="number"
            placeholder="Default 8082"
            ref={customPort}
          />
        </IonItem>

        <IonItem className="row-item" hidden={joinOtherRoom}>
          <IonLabel position="floating">Select room</IonLabel>
          <IonSelect value={vlrId} onIonChange={(e) => setVlrId(+e.detail.value)}>
            {vlrs.map(({id, public_id}: Vlr) =>
              <IonSelectOption key={id} value={id}>
                {public_id}
              </IonSelectOption>)
            }
          </IonSelect>
        </IonItem>

        <IonItem className="row-item" hidden={!joinOtherRoom}>
          <IonLabel position="floating">Room id</IonLabel>
          <IonInput onIonChange={(e) => setVlrPublicId(e.detail.value || '')}/>
        </IonItem>

        <IonItem className="row-item">
          <IonCheckbox checked={joinOtherRoom} slot="start" onIonChange={e => setJoinOtherRoom(e.detail.checked)}/>
          <IonLabel>Join other room</IonLabel>
        </IonItem>

        <IonItem className="row-item" hidden={joinOtherRoom}>
          <IonLabel position="floating">Select stream</IonLabel>
          <IonSelect value={streamId} onIonChange={(e) => setStreamId(+e.detail.value)}>
            {streams.map(({id, name}: SharedStream) =>
              <IonSelectOption key={id} value={id}>
                {name}
              </IonSelectOption>)
            }
          </IonSelect>
        </IonItem>

        <IonItem className="row-item">
          <IonLabel position="floating">Number of additional participants</IonLabel>
          <IonInput
            type="number"
            onIonChange={(e) => e.detail.value && setNumberOfParticipants(+e.detail.value || 0)}
          />
        </IonItem>

        <IonItem
          button
          onClick={() => setShowSettingsModal(true)}
          className="row-item"
        >
          <IonIcon icon={cogOutline} color="dark" slot="start"/>
          <IonLabel>Camera and microphone settings</IonLabel>
        </IonItem>

        <UserMediaModal
          show={showSettingsModal}
          setShow={setShowSettingsModal}
        />

        <IonButton type="submit" disabled={!selectedServer}>Start</IonButton>
      </form>
    </Layout>
  );
};

export default RoomHomePage;
