import React, {FC, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/react';
import {VlrBlockedIp} from '../../../../shared/types';
import {useTranslation} from 'react-i18next';
import {arrowUndoOutline, closeOutline, removeCircleOutline} from 'ionicons/icons';
import {VlrService} from '../../../../services';
import axios, {AxiosError} from 'axios';

interface VlrBlockedIpManage extends VlrBlockedIp {
  toBeRemoved: boolean;
}

type Props = {
  publicRoomId: string;
  ips: VlrBlockedIp[];
  open: boolean;
  onClose: (ips?: VlrBlockedIp[]) => void;
};

const TOAST_INITIAL = {
  show: false,
  message: '',
  color: undefined
};

const ManageBlockedUsers: FC<Props> = ({publicRoomId, ips, open, onClose}: Props) => {
  const {t} = useTranslation();
  const [manageIps, setManageIps] = useState<VlrBlockedIpManage[]>([]);
  const [removedIps, setRemovedIps] = useState<string[]>([]);
  const [toast, setToast] = useState<{ show: boolean, message: string, color?: string }>(TOAST_INITIAL);

  const handleWillPresent = () => {
    setManageIps(ips.map(ip => ({...ip, toBeRemoved: false})));
    setRemovedIps([]);
  };

  const handleRemoveIp = (ipToBeRemoved: string) => {
    setRemovedIps(prevState => [...prevState, ipToBeRemoved]);
    setManageIps(prevState => prevState.map(ip => (ip.ip === ipToBeRemoved ? {...ip, toBeRemoved: true} : ip)));
  };

  const handleUndoRemoveIp = (undoIp: string) => {
    setRemovedIps(prevState => prevState.filter(ip => ip !== undoIp));
    setManageIps(prevState => prevState.map(ip => (ip.ip === undoIp ? {...ip, toBeRemoved: false} : ip)));
  };

  const handleSave = () => {
    const execute = async () => {
      const {data: {blocked_ips}} = await VlrService.removeBlockedIps(publicRoomId, removedIps);
      setToast({
        show: true,
        message: 'manageBlockedIps.successMessage',
        color: 'dark'
      });

      onClose(blocked_ips);
    };

    execute().catch((err: Error | AxiosError) => {
      let message = 'common.unexpectedError';
      if (axios.isAxiosError(err) && (err.response?.data as any).message === 'vlr_not_found') {
        message = 'manageBlockedIps.vlrNotFound';
      }
      setToast({
        show: true,
        message,
        color: 'danger'
      });
    });
  };

  return (
    <>
      <IonModal
        isOpen={open}
        className="manage-blocked-ips-modal"
        onWillPresent={handleWillPresent}
        onWillDismiss={() => onClose()}
      >
        <IonToolbar>
          <IonTitle>{t('watchPartyStart.manageBlockedUsers')}</IonTitle>
        </IonToolbar>

        <IonList>
          {
            manageIps.map(({id, ip, toBeRemoved}) => (
              <IonItem key={id}>
                {
                  toBeRemoved ?
                    <>
                      <IonLabel color="medium">{ip}</IonLabel>
                      <IonButtons slot="end">
                        <IonButton
                          title={t('common.undo')}
                          onClick={() => handleUndoRemoveIp(ip)}
                        >
                          <IonIcon icon={arrowUndoOutline} slot="icon-only"/>
                        </IonButton>
                      </IonButtons>
                    </> :
                    <>
                      <IonLabel>{ip}</IonLabel>
                      <IonButtons slot="end">
                        <IonButton
                          title={t('common.remove')}
                          onClick={() => handleRemoveIp(ip)}
                        >
                          <IonIcon icon={removeCircleOutline} slot="icon-only" color="danger"/>
                        </IonButton>
                      </IonButtons>
                    </>
                }
              </IonItem>
            ))
          }
        </IonList>

        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={() => onClose()}>
              {t(`common.${removedIps.length ? 'cancel' : 'close'}`)}
            </IonButton>
            {
              removedIps.length > 0 &&
              <IonButton onClick={handleSave}>
                {t('common.save')}
              </IonButton>
            }
          </IonButtons>
        </IonToolbar>
      </IonModal>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast(TOAST_INITIAL)}
        message={t(toast.message)}
        color={toast.color}
        duration={5000}
        buttons={[
          {
            side: 'end',
            icon: closeOutline,
            role: 'cancel'
          }
        ]}
      />
    </>
  );
};

export default ManageBlockedUsers;
