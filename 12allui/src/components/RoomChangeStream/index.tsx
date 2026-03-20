import React, {FC, useState} from 'react';
import {IonButton, IonIcon} from '@ionic/react';
import {filmOutline} from 'ionicons/icons';
import {SharedStream} from '../../shared/types';
import SelectStreamModal from '../SelectStreamModal';
import {VodState} from "../../redux/reducers/vodReducers";
import SelectVodModal from "../SelectVodModal";

type Props = {
  streamId?: number;
  onChangeStream: (stream: SharedStream) => void;
};

const RoomChangeStream: FC<Props> = ({streamId, onChangeStream}: Props) => {
  const [openStreams, setOpenStreams] = useState<boolean>(false);

  const handleOnClose = (stream?: SharedStream) => {
    setOpenStreams(false);
    stream && onChangeStream(stream);
  };

  return (
    <>
      <IonButton onClick={() => setOpenStreams(true)}>
        <IonIcon slot="icon-only" icon={filmOutline} color={openStreams ? 'success' : 'dark'}/>
      </IonButton>
      <SelectStreamModal
        open={openStreams}
        streamId={streamId}
        onClose={handleOnClose}/>
    </>
  );
};


type VodProp = {
    vodID?: number;
    onChangeVod: (vod: VodState) => void;
};

export const VodChangeStream: FC<VodProp> = ({vodID, onChangeVod}: VodProp) => {
    const [openVod, setOpenVod] = useState<boolean>(false);

    const handleOnClose = (vod?: VodState) => {
        setOpenVod(false);
        vod && onChangeVod(vod);
    };

    return (
        <>
            <IonButton onClick={() => setOpenVod(true)}>
                <IonIcon slot="icon-only" icon={filmOutline} color={openVod ? 'success' : 'dark'}/>
            </IonButton>
            <SelectVodModal
                open={openVod}
                vodId={vodID}
                onClose={handleOnClose}/>
        </>
    );
};

export default RoomChangeStream;
