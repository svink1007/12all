import {Dispatch, MutableRefObject, SetStateAction} from 'react';
import VertoSession from '../../../verto/VertoSession';
import {setErrorToast} from '../../../redux/actions/toastActions';
import {Participant} from '../../../verto/models';
import {HTMLVideoStreamElement} from '../../WatchParty/types';
import getCamParams from '../../../shared/methods/getCamParams';
import {RoomTest} from '../../../redux/shared/types';

type Props = {
  stream?: MediaStream;
  roomTest: RoomTest;
  dispatch: Dispatch<any>;
  vertoSession: MutableRefObject<VertoSession | null>;
  roomRef: MutableRefObject<HTMLVideoStreamElement | null>;
  userStreamRef: MutableRefObject<MediaStream | null>;
  numberOfAdditionalParticipantsRef: MutableRefObject<number>;
  setCanLeave: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setShowProgressbar: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setParticipants: Dispatch<SetStateAction<Participant[]>>;
  cam: string;
}

const establishVertoSession = (props: Props) => {
  const {
    stream,
    roomTest,
    vertoSession,
    dispatch,
    roomRef,
    userStreamRef,
    setCanLeave,
    setLoading,
    setShowProgressbar,
    setProgress,
    setParticipants,
    cam,
    numberOfAdditionalParticipantsRef
  } = props;

  const redirect = () => {
    setCanLeave(true);
  };

  const connect = async () => {
    setProgress(0.5);
    let sessionState = {
      secondaryEstablished: false,
      currentNumberOfAdditionalConnections: 0
    };

    const userStream = await navigator.mediaDevices.getUserMedia({audio: true, video: getCamParams(cam)});
    userStreamRef.current = userStream;

    const vs = new VertoSession({
      realNumber: roomTest.roomId,
      streamNumber: `${roomTest.roomId}_stream`,
      callerName: roomTest.moderatorUsername || `User_${new Date().getUTCMilliseconds()}`,
      localStream: userStream,
      moderatorUsername: roomTest.moderatorUsername,
      moderatorPassword: roomTest.moderatorPassword,
      fsUrl: roomTest.fsUrl,
      isHost: true,
      notifyOnStateChange: true,
      giveFloor: !!stream,
      connectionType: "stream_test",
      incomingBandwidth: 0,
      outgoingBandwidth: 1300,
      destinationNumber: `room_test_stream_720`
    });

    vertoSession.current = vs;

    setProgress(0.5);

    vs.notification.onFSLoggedError.subscribe(() => {
      dispatch(setErrorToast('fs.cannotAuthenticate'));
      redirect();
    });

    vs.notification.onStateChange.subscribe(() => {
      if (stream && !sessionState.secondaryEstablished) {
        sessionState.secondaryEstablished = true;
        vs.initSecondaryCallStream(stream, roomTest.streamName || 'Broadcast');
      } else if (numberOfAdditionalParticipantsRef.current > sessionState.currentNumberOfAdditionalConnections) {
        sessionState.currentNumberOfAdditionalConnections++;
        vs.addConnection(userStream, `User_${sessionState.currentNumberOfAdditionalConnections}`);
      }
    });

    vs.notification.onPlayRemoteVideo.subscribe((remoteVideoStream: MediaStream) => {
      if (!roomRef?.current) {
        return;
      }

      if (!roomRef.current.srcObject) {
        roomRef.current.srcObject = remoteVideoStream;
      } else {
        roomRef.current.srcObject = remoteVideoStream;
        roomRef.current.play().then(() => {
          setLoading(false);
          setShowProgressbar(false);
          setProgress(1);
        });
      }
    });

    vs.notification.onBootstrappedParticipants.subscribe((bootParticipants: Participant[]) => {
      setParticipants(bootParticipants);

      const p = bootParticipants.filter(p => !p.me);
      if (p.length) {
        bootParticipants.forEach(p => vs.removeParticipant(p.participantId));
      }
    });

    vs.notification.onAddedParticipant.subscribe((participant: Participant) => {
      if (participant.isHostSharedVideo) {
        vs.giveParticipantFloor(participant.participantId);
        vs.toggleSecondaryMic();
      }
      setParticipants(prevState => [...prevState, participant]);
    });

    vs.notification.onRemovedParticipant.subscribe((participant: Participant) => {
     setParticipants(prevState => prevState.filter(p => p.callId !== participant.callId));
    });

    vs.notification.onPrimaryCallDestroy.subscribe(() => {
      redirect();
    });
  };

  connect().catch((err) => {
    console.error(err);
    dispatch(setErrorToast('sharedStream.givePermission'));
    redirect();
  });
};

export default establishVertoSession;
