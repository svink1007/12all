import React, {FC, PropsWithChildren} from 'react';
import {IonContent, IonInfiniteScroll, IonInfiniteScrollContent} from '@ionic/react';

interface Props extends PropsWithChildren {
  onLoadMore: (target: any) => void;
}

const InfiniteContent: FC<Props> = ({children, onLoadMore}) => {
  const handleInfiniteScroll = (e: any) => {
    onLoadMore(e.target);
  };

  return (
    <IonContent>
      <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
        <IonInfiniteScrollContent>{children}</IonInfiniteScrollContent>
      </IonInfiniteScroll>
    </IonContent>
  )
};

export default InfiniteContent;
