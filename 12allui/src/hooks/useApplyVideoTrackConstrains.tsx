import {useEffect} from 'react';
import {IS_CHROME} from '../shared/constants';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../redux/shared/types';

const useApplyVideoTrackConstrains = (streamWidth: number, videoTrack: MediaStreamTrack | null) => {
  const {streamWidthConstrain} = useSelector(({webConfig}: ReduxSelectors) => webConfig);

  useEffect(() => {
    if (videoTrack && IS_CHROME) {
      try {
        videoTrack.applyConstraints({width: {ideal: streamWidth > 0 ? streamWidth : streamWidthConstrain}}).then();
        console.log('Constrained applied', streamWidth);
      } catch (e: any) {
        console.error('Could not apply dynamic stream constrains', e);
      }
    }
  }, [streamWidth, videoTrack, streamWidthConstrain]);
};

export default useApplyVideoTrackConstrains;
