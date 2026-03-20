import React, {FC} from 'react';
import {IonCard, IonCardContent} from '@ionic/react';
import AdSense, {AdSenseFormat, AdSenseSlot} from './index';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import AdSenseGuard from '../AdSenseGuard';

type Props = {
  slot: AdSenseSlot;
  format?: AdSenseFormat;
  className?: string;
};

const AdSenseCard: FC<Props> = ({slot, format, className}) => {
  const {allowAds} = useSelector(({adSense}: ReduxSelectors) => adSense);

  return (
    <>
      {
        allowAds ?
          <AdSenseGuard className={className}>
            <IonCard>
              <IonCardContent>
                <AdSense slot={slot} format={format}/>
              </IonCardContent>
            </IonCard>
          </AdSenseGuard>
          :
          null
      }
    </>

  );
};

export default AdSenseCard;
