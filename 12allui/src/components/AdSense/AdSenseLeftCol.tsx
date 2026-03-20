import React, {FC} from 'react';
import {AdSenseFormat, AdSenseSlot} from './index';
import {IonCol} from '@ionic/react';
import AdSenseCard from './AdSenseCard';

type Props = {
  format?: AdSenseFormat;
};

const AdSenseLeftCol: FC<Props> = ({format}) => {
  return (
    <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2" className="ad-sense-col-left">
      <AdSenseCard slot={AdSenseSlot.Left} format={format}/>
    </IonCol>
  );
};

export default AdSenseLeftCol;
