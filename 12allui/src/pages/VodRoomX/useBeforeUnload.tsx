import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {VlrService} from '../../services';

const useBeforeUnload = (cb: () => void) => {
  const {jwt, id} = useSelector(({profile}: ReduxSelectors) => profile);
  const {publicRoomId} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);

  useEffect(() => {
    const onBeforeUnload = (e: any) => {
      // e.preventDefault()
      // e.returnValue = "Are you sure you want to leave this page?";
      cb();

      VlrService.sendFinalPing(publicRoomId, id).then();
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [cb, jwt, publicRoomId, id]);
};

export default useBeforeUnload;
