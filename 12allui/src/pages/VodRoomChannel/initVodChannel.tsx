import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {IS_IN_FULLSCREEN} from '../../shared/constants';
import {SharedStreamVlrs, SharedVodVlrs, Vlr, vod} from '../../shared/types';
import {StreamService} from '../../services/StreamService';
import {VlrService} from '../../services';
import {isPlatform} from '@ionic/react';
import {VodService} from "../../services/VodService";
import { setErrorToast } from 'src/redux/actions/toastActions';
import { ToastTextFormat } from 'src/redux/shared/enums';
import { set } from 'react-hook-form';

type Props = {
  channelId?: string;
  vodId?: string;
  roomId?: string;
  jwt: string;
  setVlrs: Dispatch<SetStateAction<Vlr[]>>;
  sharedStreamData: MutableRefObject<SharedVodVlrs | undefined>;
  onStartNewRoom: () => void;
  setCurrentVod: (currentVod: number | null) => void;
  onJoinRoom: (vlr: Vlr) => void;
  setVodChannel: (vodChannelIds: vod[])=>void;
};

const initVodChannel = (props: Props) => {
  const {
    channelId,
    vodId,
    roomId,
    jwt,
    setCurrentVod,
    setVlrs,
    sharedStreamData,
    onStartNewRoom,
    onJoinRoom,
    setVodChannel
  } = props;

  const getRooms = async () => {
    let firstVodId: number=  0;
    if(channelId){
      const streamDetails: any = await StreamService.getStream(+channelId);
      if(!streamDetails.data.shared_vods || streamDetails.data.shared_vods.length === 0) {
        console.error('No VODs found for this channel');
      }
      const vodChannel: vod[] = streamDetails.data.shared_vods
      setVodChannel(vodChannel)
      firstVodId = streamDetails.data.shared_vods[0].id
    }
    if(vodId){//either it's a simple vod or the room has already been created
      firstVodId = +vodId; 
    }
    let stream = null;
    if (roomId ) {
      const {data} = await VlrService.mapVlrPublicId(roomId);
      onJoinRoom(data.vlr);
      stream = await VodService.getVideoOnDemand(firstVodId);
      sharedStreamData.current = { ...stream.data, vlr: [data.vlr] };
    }
    else{
      stream = await VodService.getVideoOnDemand(firstVodId);
      sharedStreamData.current = { ...stream.data, vlr: [] };
      onStartNewRoom();
    }
    setCurrentVod(firstVodId);
    if (stream.data.vlr?.length) {
      const showVlrOptions = (vlrs: Vlr[]) => {
        setVlrs(vlrs);
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
    }

    
  };
  getRooms().catch(err => {
      console.error(err.message);
      const message = VlrService.handleMapIdError(err);
      console.error('Error initializing channel VOD:', message);
    });
}
export default initVodChannel;


