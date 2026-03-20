import { IonBadge } from '@ionic/react';
import React, { FC } from 'react'
import './style.scss';

type Props ={
    badgeNumber: number;
    isHidden: boolean;
    badgeColor: string
  }
const CustomBadge : FC<Props> = ({badgeNumber,isHidden,badgeColor}: Props)=>{
  return (
    <IonBadge
        color={badgeColor}
        className={!isHidden? 'custom-badge show-delay' : 'custom-badge'}
        hidden={isHidden}
    >
        {badgeNumber}
    </IonBadge>
  )
}

export default CustomBadge