import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {IS_IN_FULLSCREEN} from '../../shared/constants';
import {SharedStreamVlrs, Vlr} from '../../shared/types';
import {StreamService} from '../../services/StreamService';
import {VlrService} from '../../services';
import {isPlatform} from '@ionic/react';

type Props = {
  id: string | 'camera';
  roomId?: string;
  jwt: string;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setShowProgressbar: Dispatch<SetStateAction<boolean>>;
  setOpenSelectRoomModal: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setVlrs: Dispatch<SetStateAction<Vlr[]>>;
  sharedStreamData: MutableRefObject<SharedStreamVlrs | undefined>;
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: Vlr) => void;
  onExitRoom: (errorMessage?: string) => void;
};

const initStream = (props: Props) => {
  const {
    id,
    roomId,
    jwt,
    setIsFullscreen,
    setLoading,
    setShowProgressbar,
    setOpenSelectRoomModal,
    setProgress,
    setVlrs,
    sharedStreamData,
    onStartNewRoom,
    onJoinRoom,
    onExitRoom
  } = props;

  document.onfullscreenchange = () => {
    setIsFullscreen(IS_IN_FULLSCREEN());
  };

  const getRooms = async () => {
    setLoading(true);
    setShowProgressbar(true);
    setProgress(0.1);

    if (id === 'camera') {
      if (roomId) {
        const {data} = await VlrService.mapVlrPublicId(roomId);
        onJoinRoom(data.vlr);
      }
      return;
    }

    const stream = await StreamService.getStream(+id);
    sharedStreamData.current = stream.data;

    if (stream.data.vlr?.length) {
      const showVlrOptions = (vlrs: Vlr[]) => {
        setShowProgressbar(false);
        setVlrs(vlrs);
        setOpenSelectRoomModal(true);
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
      onStartNewRoom();
    } else {
      onExitRoom();
    }
  };

  getRooms().catch(err => {
    console.error(err.message);
    const message = VlrService.handleMapIdError(err);
    onExitRoom(message);
  });
};

export default initStream;
