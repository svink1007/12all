import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {IonButton, IonButtons, IonIcon} from '@ionic/react';
import {informationCircleOutline} from 'ionicons/icons';

const TipButton: FC<{ onClick: () => void; }> = ({onClick}) => {
  const {t} = useTranslation();

  return (
    <IonButtons slot="end" className="tip-buttons">
      <IonButton title={t('vlrTips.showMoreInfo')} onClick={onClick}>
        <IonIcon icon={informationCircleOutline} slot="icon-only"/>
      </IonButton>
    </IonButtons>
  );
};

export default TipButton;
