import React, {FC} from 'react';
import {AdSenseFormat, AdSenseSlot} from './index';
import {IonCol, IonRow} from '@ionic/react';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import AdSenseCard from './AdSenseCard';

const AdSenseDownRow: FC = () => {
  const {allowAds} = useSelector(({adSense}: ReduxSelectors) => adSense);

  return (
    <>
      {
        allowAds ?
          <IonRow className="ion-text-center">
            <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="8" sizeXl="8" offsetLg="2" offsetXl="2">
              <AdSenseCard slot={AdSenseSlot.Down} format={AdSenseFormat.Horizontal}/>
            </IonCol>
          </IonRow>
          :
          null
      }
    </>
  );
};

export default AdSenseDownRow;
