import React, {FC, useCallback, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonCard, IonCardContent, IonModal, IonTitle, IonToolbar} from '@ionic/react';
import MyStream from '../components/MyStream';
import {MyStreamSource} from '../types';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import setLivingRoom from '../../../redux/actions/livingRoomActions';
import {ShareStreamOption} from '../enums';
import {StreamService} from '../../../services/StreamService';
import {ReduxSelectors} from '../../../redux/shared/types';
import {SharedStream} from '../../../shared/types';
import {patchSelectedVlrTemplate} from '../../../redux/actions/vlrTemplateActions';

type Props = {
  show: boolean;
  onOk: () => void;
  onClose: () => void;
  handleSwitchChannel: (stream: SharedStream | null) => void;
  onStopStream: () => void;
};

const ChangeStream: FC<Props> = ({show, onOk, onClose, handleSwitchChannel, onStopStream}: Props) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {astraUrl} = useSelector(({webConfig}: ReduxSelectors) => webConfig);

  const [src, setSrc] = useState<MyStreamSource | MyStreamSource[] | null>(null);
  const [stream, setStream] = useState<SharedStream | null>(null);
  const [valid, setValid] = useState<boolean>(false);

  const onStreamSrcValid = useCallback((valid: boolean) => {
    setValid(valid);
  }, []);

  const handleSrcChange = useCallback((source: MyStreamSource | MyStreamSource[] | null, isValid?: boolean, stream?: SharedStream) => {
    setSrc(source);
    setStream(stream || null);
    setValid(isValid || false);
    stream && dispatch(patchSelectedVlrTemplate({streamId: stream.id, streamUrl: stream.url}));
  }, [dispatch]);

  const handleStreamModalDismiss = () => {
    onClose();
  };

  const handleStreamModalOk = () => {
    if (valid && src) {
      onStopStream()
      dispatch(setLivingRoom({myStream: src, streamName: stream?.name, epgId: stream?.epg_channel?.id, share: ShareStreamOption.Stream}));
      handleSwitchChannel(stream)
    }

    const url = src && !Array.isArray(src) && src.src;
    const regex = new RegExp(astraUrl);
    if (url && (!astraUrl || regex.test(url))) {
      StreamService.requestAstraStreamOpening(url).then();
    }

    onOk();
    handleStreamModalDismiss();
  };

  return (
    <IonModal
      isOpen={show}
      onDidDismiss={handleStreamModalDismiss}
      className="wp-change-stream-modal"
    >
      <IonToolbar>
        <IonTitle>{t('controlBar.addNewStream')}</IonTitle>
      </IonToolbar>

      <IonCard>
        <IonCardContent>
          <MyStream
            onSrc={handleSrcChange}
            onValid={onStreamSrcValid}
          />

          <IonToolbar className="toolbar-actions">
            <IonButtons slot="end">
              <IonButton onClick={handleStreamModalDismiss}>
                {t('common.cancel')}
              </IonButton>

              <IonButton onClick={handleStreamModalOk} disabled={!valid}>
                {t('common.ok')}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonCardContent>
      </IonCard>
    </IonModal>
  );
};

export default ChangeStream;
