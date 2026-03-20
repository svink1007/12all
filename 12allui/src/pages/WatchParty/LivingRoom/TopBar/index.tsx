import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {IonIcon, IonItem, IonSpinner, IonText, IonToolbar} from '@ionic/react';
import ExitButton from '../../../../components/ExitButton';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';
import {film} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {ShareStreamOption} from '../../enums';
import NowPlaying from '../../../../components/NowPlaying';
import {StreamService} from '../../../../services/StreamService';
import {EpgEntry} from '../../../../shared/types';

type Props = {
  onLeave: () => void;
};

const TopBar: FC<Props> = ({onLeave}: Props) => {
  const {t} = useTranslation();
  const {streamName, share, epgId} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
  const {loadingStream} = useSelector(({inRoom}: ReduxSelectors) => inRoom);
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);

  useEffect(() => {
    if (epgId) {
      StreamService.getEpgEntries(epgId).then(({data}) => setEpgEntries(data))
    } else {
      setEpgEntries([]);
    }
  }, [epgId]);

  return (
    <IonToolbar className="living-room-top-bar">
      <ExitButton onExit={onLeave}/>
      <IonItem className="room-info" slot="end" lines="none">
        {
          share === ShareStreamOption.Stream &&
          <>
            {
              streamName &&
              <div className="room-info-row" title={t('sharedStream.streamName')}>
                <IonIcon icon={film} color="dark"/>
                <IonText>{streamName}</IonText>
              </div>
            }
            {loadingStream && <IonSpinner/>}
            {epgEntries.length > 0 && <NowPlaying epgEntries={epgEntries} streamName={streamName}/>}
          </>
        }
      </IonItem>
    </IonToolbar>
  );
};

export default TopBar;
