import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonProgressBar,
  IonText,
  IonToolbar
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import SocialNetworks from '../SocialNetworks';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {API_URL} from '../../shared/constants';
import {AdSenseFormat, AdSenseSlot} from '../AdSense';
import AdSenseCard from '../AdSense/AdSenseCard';
import appStorage from '../../shared/appStorage';
import {volumeHighOutline, volumeMuteOutline} from 'ionicons/icons';

const MUTE_STREAM_LOADING_PREVIEW = 'muteStreamLoadingPreview';

type Props = {
  progress: number;
  show: boolean;
  showLeave: boolean;
  invitationUrl: string;
  // streamMediaStream: MediaStream | null;
  onLeave: () => void;
};

const ProgressLoaderInvite: FC<Props> = ({
                                           show,
                                           progress,
                                           showLeave,
                                           invitationUrl,
                                           onLeave
                                         }: Props) => {
  const {t} = useTranslation();
  const streamVideoRef = useRef<HTMLVideoElement>(null);
  const {previewClip} = useSelector(({webConfig}: ReduxSelectors) => webConfig);
  const [muteVideo, setMuteVideo] = useState<boolean>(false);

  useEffect(() => {
    const value = appStorage.getItem(MUTE_STREAM_LOADING_PREVIEW);
    if (value && value === 'true') {
      setMuteVideo(true);
    }
  }, []);

  // useEffect(() => {
  //   if (streamVideoRef.current && streamMediaStream && show) {
  //     streamVideoRef.current.srcObject = streamMediaStream;
  //   }
  // }, [streamMediaStream, show]);

  useEffect(() => {
    if (streamVideoRef.current) {
      if (show) {
        streamVideoRef.current.play().then();
      } else {
        streamVideoRef.current.pause();
      }
    }
  }, [show]);

  const handleMuteVideo = () => {
    appStorage.setItem(MUTE_STREAM_LOADING_PREVIEW, (!muteVideo).toString());
    setMuteVideo(!muteVideo);
  };
  return (
    <div className="progress-loader-invite" hidden={!show}>
      <AdSenseCard
        slot={AdSenseSlot.Left}
        format={AdSenseFormat.LargeSquare}
        className="ad-holder ad-holder-left"
      />

      <IonCard className="main-card">
        <IonCardContent>
          <div className="player">
            {/*<video ref={streamVideoRef} autoPlay className={streamMediaStream ? 'playing' : ''}/>*/}
            <video ref={streamVideoRef} className="playing" src={`${API_URL}${previewClip}`} muted={muteVideo} loop playsInline/>
            <IonButtons className="player-buttons">
              <IonButton onClick={handleMuteVideo} color="dark">
                <IonIcon slot="icon-only" icon={muteVideo ? volumeMuteOutline : volumeHighOutline}/>
              </IonButton>
            </IonButtons>
          </div>
          <IonText color="dark">{t('livingRoom.firstHost')}</IonText>
          <IonText color="dark">{t('livingRoom.inviteYourFriends')}</IonText>
          <SocialNetworks url={invitationUrl}/>
        </IonCardContent>

        <IonToolbar>
          {
            showLeave && progress < 1 &&
            <IonButton fill="clear" onClick={() => onLeave()}>{t('livingRoom.cancel')}</IonButton>
          }
        </IonToolbar>

        <IonProgressBar value={progress} hidden={progress === 1}/>
      </IonCard>

      <AdSenseCard
        slot={AdSenseSlot.Right}
        format={AdSenseFormat.LargeSquare}
        className="ad-holder"
      />
    </div>
  );
};

export default ProgressLoaderInvite;
