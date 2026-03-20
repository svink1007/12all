import React, {FC} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonIcon, IonItem} from '@ionic/react';
import {setInfoToast} from '../../redux/actions/toastActions';
import {copyOutline, logoTwitter, logoVk, logoWhatsapp} from 'ionicons/icons';
import {TwitterShareButton, VKShareButton, WhatsappShareButton} from 'react-share';
import {useDispatch} from 'react-redux';

type Props = {
  url: string;
};

const SocialNetworks: FC<Props> = ({url}) => {
  const dispatch = useDispatch();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => dispatch(setInfoToast('invite.copied')))
  };

  return (
    <IonItem className="social-networks" lines="none">
      <IonButtons>
        <IonButton onClick={handleCopyUrl} shape="round">
          <IonIcon icon={copyOutline}/>
        </IonButton>
        <IonButton shape="round">
          <WhatsappShareButton url={url}>
            <IonIcon icon={logoWhatsapp}/>
          </WhatsappShareButton>
        </IonButton>
        <IonButton shape="round">
          <TwitterShareButton url={url}>
            <IonIcon icon={logoTwitter}/>
          </TwitterShareButton>
        </IonButton>
        <IonButton shape="round">
          <VKShareButton url={url}>
            <IonIcon icon={logoVk}/>
          </VKShareButton>
        </IonButton>
      </IonButtons>
    </IonItem>
  )
};

export default SocialNetworks;
