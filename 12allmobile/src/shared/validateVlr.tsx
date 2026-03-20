import setLivingRoom from "../redux/actions/livingRoomActions";
import { Dispatch } from "redux";
import { VlrService } from "../services";

const validateVlr = async (roomId: string, dispatch: Dispatch) => {
  const { data } = await VlrService.mapVlrPublicId(roomId);
  const { channelIsActive, status, fsUrl, mappedId, vlr } = data;
  let errorMessage = "";
  switch (status) {
    case "ok":
      if (channelIsActive) {
        if (!vlr.channel?.is_vlr && vlr.stream) {
          return { streamId: vlr.stream?.id, streamCamera: false };
        }

        if (vlr.channel?.stream_camera) {
          return { streamCamera: true, streamId: null };
        }

        dispatch(
          setLivingRoom({
            fsUrl,
            roomId: mappedId,
            channel: {
              logo: vlr.channel?.logo,
            },
            publicRoomId: roomId,
            vlrId: vlr.id,
          })
        );
        return { streamId: null, streamCamera: false, error: false };
      }

      errorMessage = "joinScreen.roomNotActive";
      break;
    case "room_not_found":
      errorMessage = "joinScreen.noRoom";
      break;
    default:
      errorMessage = "joinScreen.roomError";
      break;
  }

  throw new Error(errorMessage);
};

export default validateVlr;
