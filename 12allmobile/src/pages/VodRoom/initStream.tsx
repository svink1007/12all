import { SharedStreamVlrs, Vlr } from "../../shared/types";
import { StreamService, VlrService } from "../../services";
import { JoinStreamVlr } from "./index";
import { isPlatform } from "@ionic/react";

type IntiStreamProps = {
  id: string | "camera";
  roomId?: string;
  onStreamData: (streamVLrs: SharedStreamVlrs) => void;
  onStartNewRoom: () => void;
  onJoinRoom: (vlr: JoinStreamVlr) => void;
  onShowVlrOptions: (vlrs: Vlr[]) => void;
  onError: (message: string) => void;
  onExit: () => void;
};

const initStream = (props: IntiStreamProps) => {
  const {
    id,
    roomId,
    onStreamData,
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
        onJoinRoom(new JoinStreamVlr(data.vlr));
      } else {
        onStartNewRoom();
      }
      return;
    }

    const stream = await StreamService.getStream(id);
    onStreamData(stream.data);

    if (stream.data.vlr?.length) {
      if (roomId) {
        const vlr = stream.data.vlr.find((vlr) => vlr.public_id === roomId);

        if (vlr) {
          if (vlr.is_active) {
            onJoinRoom(new JoinStreamVlr(vlr));
          } else if (isPlatform("android") || isPlatform("desktop")) {
            onStartNewRoom();
          } else {
            onExit();
          }
        } else {
          onShowVlrOptions(stream.data.vlr);
        }
      } else {
        onShowVlrOptions(stream.data.vlr);
      }
    } else if (isPlatform("android") || isPlatform("desktop")) {
      onStartNewRoom();
    } else {
      onExit();
    }
  };

  init().catch((err) => {
    console.error(err.message);
    const message = VlrService.handleMapIdError(err);
    onError(message);
  });
};

export default initStream;
