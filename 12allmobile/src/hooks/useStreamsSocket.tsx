import { useEffect, useRef } from "react";
import useSocketConnection from "./useSocketConnection";
import { SharedStreamVlrs, Vlr } from "../shared/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";
import { updateStreams } from "../redux/actions/broadcastActions";

const UPDATE_STREAM = "update-stream";

const useStreamsSocket = () => {
  const dispatch = useDispatch();
  const { streams } = useSelector(({ broadcast }: ReduxSelectors) => broadcast);
  const streamsRef = useRef<SharedStreamVlrs[]>(streams);

  const socket = useSocketConnection("/streams");

  useEffect(() => {
    streamsRef.current = streams;
  }, [streams]);

  useEffect(() => {
    if (socket) {
      socket.on(UPDATE_STREAM, (stream: { id: number; vlr: Vlr[] }) => {
        const streamIndex = streamsRef.current.findIndex(
          (prev) => prev.id === stream.id
        );
        if (streamIndex !== -1) {
          streamsRef.current[streamIndex].vlr = stream.vlr;
          dispatch(updateStreams(streamsRef.current));
        }
      });

      return () => {
        socket.off(UPDATE_STREAM);
      };
    }
  }, [socket, dispatch]);
};

export default useStreamsSocket;
