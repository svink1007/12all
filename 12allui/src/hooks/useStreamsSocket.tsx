import {useEffect, useRef} from 'react';
import useSocketConnection from './useSocketConnection';
import {SharedStreamVlrs, Vlr} from '../shared/types';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../redux/shared/types';
import {setStreams} from '../redux/actions/streamActions';

const RECONNECT = 'reconnect';
const UPDATE_STREAM = 'update-stream';

const useStreamsSocket = (loadStreams: () => void) => {
  const dispatch = useDispatch();
  const {streams} = useSelector(({stream}: ReduxSelectors) => stream);
  const streamsRef = useRef<SharedStreamVlrs[]>(streams);

  const socket = useSocketConnection('/streams');

  useEffect(() => {
    streamsRef.current = streams;
  }, [streams]);


  useEffect(() => {
    socket?.io.on(RECONNECT, () => loadStreams());

    return () => {
      socket?.io.off(RECONNECT);
    };
  }, [socket, loadStreams]);

  useEffect(() => {
    if (socket) {
      socket.on(UPDATE_STREAM, (stream: { id: number, vlr: Vlr[] }) => {
        const streamIndex = streamsRef.current.findIndex(prev => prev.id === stream.id);
        if (streamIndex !== -1) {
          streamsRef.current[streamIndex].vlr = stream.vlr;
          dispatch(setStreams(streamsRef.current.map(prev => ({
            ...prev,
            vlr: prev.vlr?.map(v => ({
              ...v,
              channel: {
                ...v.channel,
                https_preview_high: `${v.channel.https_preview_high}?hash=${Date.now()}`
              }
            }))
          }))));
        }
      });

      return () => {
        socket.off(UPDATE_STREAM);
      };
    }
  }, [socket, dispatch]);
};

export default useStreamsSocket;
