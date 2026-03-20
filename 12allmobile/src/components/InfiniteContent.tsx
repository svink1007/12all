import React, { FC, PropsWithChildren } from "react";
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";

type Props = {
  children: PropsWithChildren<any>;
  onLoadMore: () => void;
};

const InfiniteContent: FC<Props> = ({ children, onLoadMore }) => {
  const handleInfiniteScroll = (e: any) => {
    e.target.complete();
    onLoadMore();
  };

  return (
    <IonContent>
      {children}
      <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
        <IonInfiniteScrollContent />
      </IonInfiniteScroll>
    </IonContent>
  );
};

export default InfiniteContent;
