import { SharedStreamVlrs, Vlr } from "../../shared/types";
import { VlrService, VodService } from "../../services";
import { isPlatform } from "@ionic/react";

type InitVodProps = {
  id: string | "camera";
  roomId?: string;
  onVodData: (vodData: SharedStreamVlrs) => void;
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: Vlr) => void;
  onShowVlrOptions: (vlrs: Vlr[]) => void;
  onError: (message: string) => void;
  onExit: () => void;
};

const initVod = (props: InitVodProps) => {
  const {
    id,
    roomId,
    onVodData,
    onStartNewRoom,
    onJoinRoom,
    onShowVlrOptions,
    onError,
    onExit,
  } = props;

  const init = async () => {
    if (id === "camera") {
      if (roomId) {
        const { data } = await VlrService.mapVlrPublicId(roomId);
        onJoinRoom(data.vlr);
      } else {
        onStartNewRoom();
      }
      return;
    }

    try {
      // Get VOD data first using the compatibility method
      const vodData = await VodService.getVideoOnDemandForStream(+id);
      
      if (roomId) {
        const { data } = await VlrService.mapVlrPublicId(roomId);
        const vlr = data.vlr;
        
        if (vlr.is_active) {
          onJoinRoom(vlr);
          // Update shared stream data with VOD info
          onVodData({ ...vodData.data, vlr: [vlr] });
        } else if (isPlatform("android") || isPlatform("desktop")) {
          onStartNewRoom();
        } else {
          onExit();
        }
      } else {
        // No room ID provided, start a new room
        if (isPlatform("android") || isPlatform("desktop")) {
          onStartNewRoom();
          // Set VOD data without VLR
          onVodData({ ...vodData.data, vlr: [] });
        } else {
          onExit();
        }
      }
    } catch (err) {
      console.error("Error initializing VOD:", err);
      onError("vod.unexpectedErrorInit");
    }
  };

  init().catch((err) => {
    console.error(err.message);
    const message = VlrService.handleMapIdError(err);
    onError(message);
  });
};

export default initVod;
