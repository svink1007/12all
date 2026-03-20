import React, { FC, useEffect } from "react";
import "./styles.scss";
import {
  IonIcon,
  IonItem,
  IonSpinner,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { filmOutline, peopleOutline } from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  streamLoadingDone,
  streamReconnecting,
} from "../../redux/actions/streamActions";
import { ReduxSelectors } from "../../redux/types";
import { EpgEntry } from "../../shared/types";
import NowPlaying from "../NowPlaying";

type Props = {
  inPipMode: boolean;
  screenIsExpanded: boolean;
  numberOfParticipants: number;
  streamName?: string;
  imHost?: boolean | null;
  epgEntries?: EpgEntry[];
};

const RoomMetadata: FC<Props> = ({
  inPipMode,
  screenIsExpanded,
  numberOfParticipants,
  streamName,
  epgEntries,
}: Props) => {
  const dispatch = useDispatch();
  const { loading, reconnecting } = useSelector(
    ({ stream }: ReduxSelectors) => stream
  );
  // const {uplinkSpeed, streamWidth} = useSelector(({networkData}: ReduxSelectors) => networkData);

  useEffect(() => {
    return () => {
      dispatch(streamLoadingDone());
      dispatch(streamReconnecting(false));
    };
  }, [dispatch]);

  return (
    <IonToolbar
      className={`room-meta ${screenIsExpanded || inPipMode ? "ion-hide" : ""}`}
    >
      <IonItem lines="none">
        <div className="stream-meta">
          <div className={`stream-name ${!streamName ? "ion-hide" : ""}`}>
            <IonIcon icon={filmOutline} /> <IonText>{streamName}</IonText>
          </div>
          {!!epgEntries && epgEntries.length > 0 && (
            <NowPlaying
              inPipMode={inPipMode}
              epgEntries={epgEntries}
              streamName={streamName}
            />
          )}
          {(loading || reconnecting) && <IonSpinner />}
        </div>
        <div className="number-of-participants">
          <IonIcon icon={peopleOutline} />{" "}
          <IonText>{numberOfParticipants}</IonText>
        </div>
      </IonItem>
      {/*  imHost &&*/}
      {/*  <IonItem lines="none" className="network-info">*/}
      {/*    <IonText>{uplinkSpeed} mbps | {streamWidth}</IonText>*/}
      {/*  </IonItem>*/}
      {/*}*/}
    </IonToolbar>
  );
};

export default RoomMetadata;
