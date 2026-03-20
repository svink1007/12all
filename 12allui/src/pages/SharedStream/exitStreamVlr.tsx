import { MutableRefObject } from "react";
import { StreamVlr } from "./index";
import VertoSession from "../../verto/VertoSession";
import { Participant } from "../../verto/models";
import { VlrService } from "../../services";

type Props = {
  imHost: boolean | null;
  isStreamingCamera: boolean;
  participants: Participant[];
  vertoSession: MutableRefObject<VertoSession | null>;
  streamVlr: MutableRefObject<StreamVlr>;
  userId: number;
};

const exitStreamVlr = ({
  imHost,
  isStreamingCamera,
  vertoSession,
  streamVlr,
  participants,
  userId,
}: Props) => {
  if (vertoSession.current) {
    if (imHost || isStreamingCamera) {
      const participantsLeft = participants.filter(
        (p) => p.isActive && !p.me && !p.isHostSharedVideo
      );
      if (participantsLeft.length) {
        const onPc = participantsLeft.find((p) => !p.isMobileApp);
        const nextHost = onPc || participantsLeft[0];
        const { username, password } = streamVlr.current.moderator;
        if (isStreamingCamera) {
          vertoSession.current?.sendMessage.switchHostCamera(nextHost.callId);
        } else {
          vertoSession.current?.sendMessage.switchHostStream(
            nextHost.callId,
            username,
            password,
            nextHost.participantName
          );
        }
      } else {
        // No participants left, ensure WebRTC cleanup
        vertoSession.current?.cleanupWebRTC();
        VlrService.sendFinalPing(streamVlr.current.publicId, userId).then();
      }
    }

    vertoSession.current?.cleanupWebRTC();
    vertoSession.current.hangup();
  }
};

export default exitStreamVlr;
