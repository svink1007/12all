import {useEffect, useState} from 'react';
import NetworkSpeed from '../models/NetworkSpeed';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../redux/shared/types';

const useNetworkUpSpeed = (check: boolean, upSpeedUrl: string | null) => {
  const {
    streamWidthConstrainLow,
    streamWidthConstrainMedium,
    streamWidthConstrainHigh,
    uplinkSpeedInMbpsMedium,
    uplinkSpeedInMbpsHigh,
    uplinkSpeedCheckIntervalSec,
    fileSizeInBytesUp,
  } = useSelector(({networkConfig}: ReduxSelectors) => networkConfig);

  const [streamWidth, setStreamWidth] = useState<number>(-1);

  useEffect(() => {
    if (!check || !upSpeedUrl) {
      return;
    }

    const getNetworkUploadSpeed = async () => {
      const {mbps} = await NetworkSpeed.getNetworkUploadSpeed(fileSizeInBytesUp, upSpeedUrl);

      if (mbps !== -1) {
        let width = streamWidthConstrainLow;
        if (mbps >= uplinkSpeedInMbpsHigh) {
          width = streamWidthConstrainHigh;
        } else if (mbps >= uplinkSpeedInMbpsMedium && mbps < uplinkSpeedInMbpsHigh) {
          width = streamWidthConstrainMedium;
        }
        setStreamWidth(width);
      }
    };
    getNetworkUploadSpeed().then();

    const interval = setInterval(() => {
      getNetworkUploadSpeed().then();
    }, uplinkSpeedCheckIntervalSec * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    uplinkSpeedCheckIntervalSec,
    streamWidthConstrainHigh,
    streamWidthConstrainMedium,
    streamWidthConstrainLow,
    uplinkSpeedInMbpsHigh,
    uplinkSpeedInMbpsMedium,
    fileSizeInBytesUp,
    check,
    upSpeedUrl
  ]);

  return streamWidth;
};

export default useNetworkUpSpeed;
