import { io } from "socket.io-client";
import { API_URL } from "../constants";

type Params = {
  userId: number;
  callId: string;
  nickname: string;
  vlrId: number;
  isSharedStream?: boolean;
  isHost: boolean;
  isVlr?: boolean;
};

export const initRoomSocket = (params: Params) => {
  const socket = io(`${API_URL}/in-room`, {
    transports: ["websocket"], // optional, for forcing ws
  });

  socket.on("connect", () => {
    console.log("ROOM SOCKET CONNECTED:", socket.id);
    socket.emit("entered", params);
  });

  socket.io.on("reconnect", () => {
    console.log("ROOM SOCKET RECONNECTED:", socket.id);
    socket.emit("entered", params);
  });

  return socket;
};
