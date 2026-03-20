import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {IS_IN_FULLSCREEN} from '../../shared/constants';
import {SharedStreamVlrs, SharedVodVlrs, Vlr} from '../../shared/types';
import {StreamService} from '../../services/StreamService';
import {VlrService} from '../../services';
import {isPlatform} from '@ionic/react';
import {VodService} from "../../services/VodService";

type Props = {
  id: string | 'camera';
  roomId?: string;
  jwt: string;
  // setOpenSelectRoomModal: Dispatch<SetStateAction<boolean>>;
  setVlrs: Dispatch<SetStateAction<Vlr[]>>;
  sharedStreamData: MutableRefObject<SharedVodVlrs | undefined>;
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: Vlr) => void;
  // onExitRoom: (errorMessage?: string) => void;
};

const initVoD = (props: Props) => {
  const {
    id,
    roomId,
    jwt,
    // setOpenSelectRoomModal,
    setVlrs,
    sharedStreamData,
    onStartNewRoom,
    onJoinRoom,
    // onExitRoom
  } = props;

  const getRooms = async () => {

    let stream = null;
    if (roomId) {
      const {data} = await VlrService.mapVlrPublicId(roomId);
      onJoinRoom(data.vlr);
      stream = await VodService.getVideoOnDemand(+id);
      sharedStreamData.current = { ...stream.data, vlr: [data.vlr] };
    }
    else{
      stream = await VodService.getVideoOnDemand(+id);
      sharedStreamData.current = { ...stream.data, vlr: [] };
      onStartNewRoom();
    }

    if (stream.data.vlr?.length) {
      const showVlrOptions = (vlrs: Vlr[]) => {
        setVlrs(vlrs);
        // setOpenSelectRoomModal(true);
      };

      if (roomId) {
        const vlr = stream.data.vlr.find(vlr => vlr.public_id === roomId);
        if (vlr) {
          onJoinRoom(vlr);
        } else {
          showVlrOptions(stream.data.vlr);
        }
      } else {
        showVlrOptions(stream.data.vlr);
      }
    } else if (jwt && !isPlatform('ios')) {
      // onStartNewRoom();
    } else {
      // onExitRoom();
    }
  };

  getRooms().catch(err => {
    console.error(err.message);
    const message = VlrService.handleMapIdError(err);
    // onExitRoom(message);
  });
};

export default initVoD;
