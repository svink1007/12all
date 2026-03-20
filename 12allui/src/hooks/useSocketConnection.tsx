import {useIonViewWillEnter, useIonViewWillLeave} from '@ionic/react';
import {io, Socket} from 'socket.io-client';
import {API_URL} from '../shared/constants';
import {useState} from 'react';

const useSocketConnection = (endpoint: string) => {
  const [socket, setSocket] = useState<Socket | null>();

  
  useIonViewWillEnter(() => {
    const socket = io(`${API_URL}${endpoint}`, {transports: ['websocket']});
    socket.on('connect_error', (err) => {
      console.debug(`connect error due to ${err.message} - ${endpoint}`);
    });
    setSocket(socket);
  }, []);

  useIonViewWillLeave(() => {
    socket?.disconnect();
    setSocket(null)
  }, []);

  return socket;
};

export default useSocketConnection;
