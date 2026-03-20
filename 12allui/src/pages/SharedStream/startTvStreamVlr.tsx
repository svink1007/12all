import {SharedStream} from '../../shared/types';
import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import {StreamVlr} from './index';
import {VlrService} from '../../services';

type Props = {
  timeLoading: MutableRefObject<NodeJS.Timeout | null>;
  sharedStreamData: MutableRefObject<SharedStream | undefined>;
  streamVlr: MutableRefObject<StreamVlr>;
  setShowLoadingCancel: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setImHost: Dispatch<SetStateAction<boolean | null>>;
};

const startTvStreamVlr = (props: Props) => {
  const {
    timeLoading,
    sharedStreamData,
    streamVlr,
    setShowLoadingCancel,
    setProgress,
    setImHost
  } = props;

  timeLoading.current = setTimeout(() => setShowLoadingCancel(true), 10000);

  const start = async () => {
    if (!sharedStreamData.current) {
      throw new Error('No shared stream data');
    }

    const {
      data: {
        id,
        moderator_username,
        moderator_password,
        room_id,
        public_id,
        fs_url,
        up_speed_url
      }
    } = await VlrService.getFreeVlrTv({token: '9l7SawQy6fqUkVGzcwvVAwftsdQ18cu3', phoneNumber: '918826658880'});

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
      upSpeedUrl: up_speed_url
    };

    setProgress(0.2);
    setImHost(true);
  };

  start().catch(err => console.error(err));
};

export default startTvStreamVlr;
