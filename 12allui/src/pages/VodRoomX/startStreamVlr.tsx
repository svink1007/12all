import {SharedStream, SharedVodVlrs, Vlr} from '../../shared/types';
import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {VlrService} from '../../services';
import {StreamVlr} from "./index";

type Props = {
  sharedStreamData: MutableRefObject<SharedVodVlrs | undefined>;
  streamVlr: MutableRefObject<StreamVlr | null>;
  setImHost: Dispatch<SetStateAction<boolean | null>>;
  onReady: () => void;
};

const startStreamVlr = (props: {
  sharedStreamData: React.MutableRefObject<SharedVodVlrs | undefined>;
  streamVlr: React.MutableRefObject<StreamVlr | null>;
  setImHost: (value: (((prevState: (boolean | null)) => (boolean | null)) | boolean | null)) => void;
  onReady: () => void
}) => {
  const {
    sharedStreamData,
    streamVlr,
    setImHost,
    onReady
  } = props;


  const start = async () => {

    if (!sharedStreamData.current) {
      throw new Error('No shared stream data');
    }

    const {data: {
      id,
      moderator_username,
      moderator_password,
      room_id,
      public_id,
      fs_url,
      up_speed_url
    }} = await VlrService.getFreeVlr();

    streamVlr.current = {
      ...streamVlr.current,
      moderator: {
        username: moderator_username,
        password: moderator_password
      },
      roomId: room_id,
      publicId: public_id,
      fsUrl: fs_url,
      vlrId: id,
      upSpeedUrl: up_speed_url,
      isMyRoom: true,
      updateMetadata: streamVlr.current?.updateMetadata ?? true
    };

    setImHost(true);
  };

  start().catch(err => console.error(err)).finally(() => onReady());
};

export default startStreamVlr;
