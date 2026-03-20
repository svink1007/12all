import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonAvatar, IonButton, IonFabButton, IonIcon, IonImg, IonItem, IonItemGroup, IonLabel, IonSpinner, IonText, IonToolbar} from '@ionic/react';
import {enter, film, people} from 'ionicons/icons';
import {Participant} from '../../../verto/models';
import {useTranslation} from 'react-i18next';
import {streamLoadingDone} from '../../../redux/actions/streamLoadingActions';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../redux/shared/types';
import {EpgEntry, SharedStreamVlrs, SharedVodVlrs} from '../../../shared/types';
import NowPlaying from '../../../components/NowPlaying';
import { heartOutline,close} from "ionicons/icons";
import Header2 from '../../../components/Header2';


type Props = {
  sharedStreamData?: SharedVodVlrs;
  logo: string |null;
  streamName?: string;
  roomId?: string;
  sessionName?: string;
  epgEntries?: EpgEntry[];
  participants: Participant[];
  onExit: () => void;
};

const TopBarStream: FC<Props> = ({streamName,logo, roomId, epgEntries, participants, onExit,sessionName,sharedStreamData}: Props) => {
  
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {loading} = useSelector(({streamLoading}: ReduxSelectors) => streamLoading);
  const [numberOfParticipants, setNumberOfParticipants] = useState<number>(1);
  const [snapshotError, setSnapshotError] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  useEffect(() => {
    return () => {
      dispatch(streamLoadingDone());
    };
  }, [dispatch]);

  useEffect(() => {
    setNumberOfParticipants(participants.filter(p => !p.isHostSharedVideo).length || 1);
  }, [participants]);

  useEffect(() => {
    console.log();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <IonToolbar className="top-bar-stream-share" >
      <div className="flex justify-between items-center"  >
        <div className="flex items-center ">
          {logo && logo.length>1&&
            <IonAvatar className='size-10 ml-6 '>
              <img 
              alt="channel logo" 
              src={logo} 
              />
            </IonAvatar>
          }
          
          <IonLabel 
          className='ml-3 text-md' 
          style={{color: 'var(--ion-color-secondary-new-contrast)'}}>Video On Demand</IonLabel>
          <IonLabel className='ml-3 text-white text-lg'>{streamName}</IonLabel>
        </div>

        <div>
          <IonLabel className='text-white'>{sessionName ?? ''}</IonLabel>
        </div>
          
        <div>
          <div className={"flex justify-start items-center mr-5"}>

            <Header2 params={"vod"} sharedStreamData={sharedStreamData}/>

            <IonFabButton onClick={onExit}>
              <IonIcon icon={close}></IonIcon>
            </IonFabButton>
                        
          </div>
        </div>
      </div>
      

    </IonToolbar>
    /* <IonToolbar className="top-bar-stream-share">
      <ExitButton onExit={onExit}/>
      <IonItem className="room-info" slot="end" lines="none">
        {
          streamName &&
          <div className="room-info-row" title={t('sharedStream.streamName')}>
            <IonIcon icon={film}/>
            <IonText>{streamName}</IonText>
            {loading && <IonSpinner/>}
          </div>
        }
        {epgEntries.length > 0 && <NowPlaying epgEntries={epgEntries} streamName={streamName}/>}
        <div className="room-info-row" title={t('sharedStream.roomNumber')}>
          <IonIcon icon={enter}/>
          <IonText>{roomId}</IonText>
        </div>
        <div className="room-info-row" title={t('sharedStream.numberOfParticipants')}>
          <IonIcon icon={people}/>
          <IonText>{numberOfParticipants}</IonText>
        </div>
      </IonItem>
    </IonToolbar> */
  );
};

export default TopBarStream;
