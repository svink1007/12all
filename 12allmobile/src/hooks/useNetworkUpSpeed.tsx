import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";
import NetworkSpeed from "../models/NetworkSpeed";

const useNetworkUpSpeed = (check: boolean, upSpeedUrl: string) => {
  const dispatch = useDispatch();
  const {
    streamWidthConstrainLow,
    streamWidthConstrainMedium,
    streamWidthConstrainHigh,
    uplinkSpeedInMbpsMedium,
    uplinkSpeedInMbpsHigh,
    uplinkSpeedCheckIntervalSec,
    fileSizeInBytesUp,
  } = useSelector(({ networkConfig }: ReduxSelectors) => networkConfig);

  const [streamWidth, setStreamWidth] = useState<number>(-1);

  useEffect(() => {
    if (!check) {
      return;
    }

    const getSpeed = async () => {
      const { mbps } = await NetworkSpeed.getNetworkUploadSpeed(
        fileSizeInBytesUp,
        upSpeedUrl
      );

      if (mbps !== -1) {
        let width = streamWidthConstrainLow;
        if (mbps >= uplinkSpeedInMbpsHigh) {
          width = streamWidthConstrainHigh;
        } else if (
          mbps >= uplinkSpeedInMbpsMedium &&
          mbps < uplinkSpeedInMbpsHigh
        ) {
          width = streamWidthConstrainMedium;
        }
        setStreamWidth(width);
        // dispatch(setNetworkData({uplinkSpeed: mbps, streamWidth: width}));
        console.log("Uplink speed:", mbps, "mbps;", "Stream width:", width);
      }
    };
    getSpeed().then();

    const interval = setInterval(() => {
      getSpeed().then();
    }, uplinkSpeedCheckIntervalSec * 3000);

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
    dispatch,
    upSpeedUrl,
  ]);

  return streamWidth;
};

export default useNetworkUpSpeed;
