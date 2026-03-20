import { useEffect, useRef } from "react";
import { StreamService } from "../services";

const useApplyVideoTrackConstrains = (
  streamWidth: number,
  videoTrack: MediaStreamTrack | null
) => {
  const streamWidthConstrain = useRef<number>();

  useEffect(() => {
    StreamService.getStreamConstrains().then(
      ({ data: { width } }) => (streamWidthConstrain.current = width)
    );
  }, []);

  useEffect(() => {
    if (videoTrack) {
      try {
        const width =
          streamWidth > 0
            ? streamWidth
            : streamWidthConstrain.current
              ? streamWidthConstrain.current
              : 0;
        if (width) {
          videoTrack.applyConstraints({ width: { ideal: width } }).then();
          console.log("Constrained applied", streamWidth);
        }
      } catch (e: any) {
        console.error("Could not apply dynamic stream constrains", e);
      }
    }
  }, [streamWidth, videoTrack, streamWidthConstrain]);
};

export default useApplyVideoTrackConstrains;
