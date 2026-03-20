import React, {FC} from 'react';
import './styles.scss';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

type Props = {
  content: Array<string>;
  setOpenModal: Function;
};

const NewsModal: FC<Props> = ({content, setOpenModal}: Props) => {

  return (
    <IonCard className='ion-card-modal'>
      <div className="ion-close-button">
        <IonButton color="transparent" className="ion-transparent-button" onClick={() => setOpenModal(false)}>
          <IonIcon slot="icon-only" color='white' icon={closeOutline} />
        </IonButton>
      </div>
      <img className='ion-card-image' alt="news-img" src={content[2]} />
      <IonCardHeader>
        <IonCardTitle>{content[0]}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {content[1]}
      </IonCardContent>
    </IonCard>    
  );
};

export default NewsModal;
