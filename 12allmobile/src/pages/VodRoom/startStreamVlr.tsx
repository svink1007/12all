import { VlrService } from "../../services";
import { StreamVlrBase } from "./index";

type StartStreamVlrProps = {
  onStart: (data: StreamVlrBase) => void;
  onError: (message: string) => void;
};

const startStreamVlr = ({ onStart, onError }: StartStreamVlrProps) => {
  const start = async () => {
    const {
      data: {
        id,
        moderator_username,
        moderator_password,
        room_id,
        public_id,
        fs_url,
        up_speed_url,
      },
    } = await VlrService.getFreeVlr();

    onStart({
      moderator: {
        username: moderator_username,
        password: moderator_password,
      },
      roomId: room_id,
      publicId: public_id,
      fsUrl: fs_url,
      vlrId: id,
      upSpeedUrl: up_speed_url,
    });
  };

  start().catch((err) => {
    console.error(err);
    onError("sharedStream.unexpectedErrorStart");
  });
};

export default startStreamVlr;
