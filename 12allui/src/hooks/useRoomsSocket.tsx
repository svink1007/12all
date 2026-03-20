import {useCallback, useEffect, useRef, useState} from 'react';
import useSocketConnection from './useSocketConnection';
import {Vlr, VlrUpcoming} from '../shared/types';
import {VlrService} from '../services';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../redux/shared/types';
import {useIonViewWillEnter, useIonViewWillLeave} from '@ionic/react';

const RECONNECT = 'reconnect';
const LIVE_ROOM_OPENED = 'live-room-opened';
const LIVE_ROOM_UPDATED = 'live-room-updated';
const LIVE_ROOM_CLOSED = 'live-room-closed';
const UPCOMING_ROOM_CREATED = 'upcoming-room-created';
const UPCOMING_ROOM_UPDATED = 'upcoming-room-updated';
const UPCOMING_ROOM_REMOVED = 'upcoming-room-removed';
const UPCOMING_ROOM_STARTED = 'upcoming-room-started';
export const ADD_PARTICIPANT = 'add-participant';
export const REMOVE_PARTICIPANT = 'remove-participant';

const useRoomsSocket = () => {
  const enteredIntoView = useRef(false);
  const filterLivingRoomTimeout = useRef<NodeJS.Timeout>();
  const {language, genre} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
  const [liveRooms, setLiveRooms] = useState<Vlr[]>([]);
  const [upcomingRooms, setUpcomingRooms] = useState<VlrUpcoming[]>([]);

  const getRooms = useCallback(() => {
    const filterParams = [];
    language && filterParams.push(`language=${language}`);
    genre && filterParams.push(`genre=${genre}`);
    VlrService.getLiveAndUpcoming(filterParams.join('&'))
      .then(({data: {live, upcoming}}) => {
        setLiveRooms(live);
        setUpcomingRooms(upcoming);
      });
  }, [language, genre]);

  useIonViewWillEnter(() => {
    enteredIntoView.current = true;
    getRooms();
  }, [getRooms]);

  useIonViewWillLeave(() => {
    enteredIntoView.current = false;
    filterLivingRoomTimeout.current && clearTimeout(filterLivingRoomTimeout.current);
  }, []);

  useEffect(() => {
    enteredIntoView.current && getRooms();
  }, [getRooms]);

  useEffect(() => {
    filterLivingRoomTimeout.current && clearTimeout(filterLivingRoomTimeout.current);
    if (upcomingRooms.length) {
      const timeout = Date.parse(upcomingRooms[0].start_at) - Date.now();
      filterLivingRoomTimeout.current = setTimeout(() => {
        const now = Date.now();
        setUpcomingRooms(prevState => prevState.filter(r => Date.parse(r.start_at) >= now));
      }, timeout);
    }
  }, [upcomingRooms]);

  const socket = useSocketConnection('/rooms');

  useEffect(() => {
    socket?.io.on(RECONNECT, () => getRooms());

    return () => {
      socket?.io.off(RECONNECT);
    };
  }, [socket, getRooms]);

  useEffect(() => {
    if (socket) {
      socket.on(LIVE_ROOM_OPENED, (vlr: Vlr) => {
        setLiveRooms(prevState => {
          const roomExists = prevState.find(({id}) => id === vlr.id);
          return roomExists ? prevState : [vlr, ...prevState].sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
        });
      });

      socket.on(LIVE_ROOM_UPDATED, (vlr: Vlr) => {
        setLiveRooms(prevState => prevState.map(prevVlr => prevVlr.id === vlr.id ? ({
          ...vlr,
          channel: {
            ...vlr.channel,
            https_preview_high: `${vlr.channel.https_preview_high}?hash=${Date.now()}`
          }
        }) : ({
          ...prevVlr,
          channel: {
            ...prevVlr.channel,
            https_preview_high: `${prevVlr.channel.https_preview_high}?hash=${Date.now()}`
          }
        })));
      });

      socket.on(LIVE_ROOM_CLOSED, (vlr: Vlr) => {
        setLiveRooms(prevState => prevState.filter(({id}) => id !== vlr.id));
      });

      socket.on(UPCOMING_ROOM_CREATED, (vlr: VlrUpcoming) => {
        setUpcomingRooms(prevState => {
          const roomExists = prevState.find(({id}) => id === vlr.id);
          return roomExists ? prevState : [vlr, ...prevState].sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
        });
      });

      socket.on(UPCOMING_ROOM_UPDATED, (vlr: VlrUpcoming) => {
        setUpcomingRooms(prevState => {
          let newState: VlrUpcoming[];
          const vlrExists = prevState.find(state => state.id === vlr.id);
          if (vlrExists) {
            newState = prevState.map(prevVlr => prevVlr.id === vlr.id ? vlr : prevVlr);
          } else {
            newState = [vlr, ...prevState];
          }
          return newState.sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
        });
      });

      socket.on(UPCOMING_ROOM_REMOVED, (vlr: {id: number}) => {
        setUpcomingRooms(prevState => prevState.filter(({id}) => id !== vlr.id));
      });

      socket.on(UPCOMING_ROOM_STARTED, (vlr: VlrUpcoming) => {
        setUpcomingRooms(prevState => prevState.filter(({id}) => id !== vlr.id));
      });
    }

    return () => {
      if (socket) {
        socket.off(LIVE_ROOM_OPENED);
        socket.off(LIVE_ROOM_UPDATED);
        socket.off(LIVE_ROOM_CLOSED);
        socket.off(UPCOMING_ROOM_CREATED);
        socket.off(UPCOMING_ROOM_UPDATED);
        socket.off(UPCOMING_ROOM_REMOVED);
        socket.off(UPCOMING_ROOM_STARTED);
      }
    };
  }, [socket]);

  return {
    liveRooms,
    upcomingRooms
  };
};

export default useRoomsSocket;
