import { useEffect, useState } from "react";
import useSocketConnection from "./useSocketConnection";
import { Vlr } from "../shared/types";
import { useDispatch } from "react-redux";
import { updateVlrs } from "../redux/actions/broadcastActions";

const LIVE_ROOM_OPENED = "live-room-opened";
const LIVE_ROOM_UPDATED = "live-room-updated";
const LIVE_ROOM_CLOSED = "live-room-closed";
export const ADD_PARTICIPANT = "add-participant";
export const REMOVE_PARTICIPANT = "remove-participant";

const useRoomsSocket = () => {
  const dispatch = useDispatch();
  const [liveRooms, setLiveRooms] = useState<Vlr[]>([]);

  const socket = useSocketConnection("/rooms");

  useEffect(() => {
    dispatch(updateVlrs(liveRooms));
  }, [dispatch, liveRooms]);

  useEffect(() => {
    if (socket) {
      socket.on(LIVE_ROOM_OPENED, (vlr: Vlr) => {
        setLiveRooms((prevState) => {
          const roomExists = prevState.find(({ id }) => id === vlr.id);
          return roomExists
            ? prevState
            : [vlr, ...prevState].sort(
                (a, b) => Date.parse(a.started_at) - Date.parse(b.started_at)
              );
        });
      });

      socket.on(LIVE_ROOM_UPDATED, (vlr: Vlr) => {
        setLiveRooms((prevState) =>
          prevState.map((prevVlr) =>
            prevVlr.id === vlr.id
              ? {
                  ...vlr,
                  channel: {
                    ...vlr.channel,
                    https_preview_high: `${vlr.channel.https_preview_high}?hash=${Date.now()}`,
                  },
                }
              : {
                  ...prevVlr,
                  channel: {
                    ...prevVlr.channel,
                    https_preview_high: `${prevVlr.channel.https_preview_high}?hash=${Date.now()}`,
                  },
                }
          )
        );
      });

      socket.on(LIVE_ROOM_CLOSED, (vlr: Vlr) => {
        setLiveRooms((prevState) =>
          prevState.filter(({ id }) => id !== vlr.id)
        );
      });
    }

    return () => {
      if (socket) {
        socket.off(LIVE_ROOM_OPENED);
        socket.off(LIVE_ROOM_UPDATED);
        socket.off(LIVE_ROOM_CLOSED);
      }
    };
  }, [socket]);
};

export default useRoomsSocket;
