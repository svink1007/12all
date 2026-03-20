import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {StreamService} from '../../../services/StreamService';
import {SharedStreamTest} from '../../../shared/types';
import {IonButton, IonIcon, IonSpinner} from '@ionic/react';
import {chevronDown, chevronUp, play, stop, thumbsDownOutline, thumbsUpOutline} from 'ionicons/icons';
import InfiniteContent from '../../../components/InfiniteContent';
import {UpdateTableStream} from '../index';
import VertoSession from '../../../verto/VertoSession';

const INITIAL_SLICE_TO = 50;

enum Sort {
  Id,
  Name,
  LastActive,
  PS
}

type SortProps = {
  sorted: boolean,
  sortAsc: boolean
};

const SortIcons: FC<SortProps> = ({sorted, sortAsc}: SortProps) => (
  <>
    {sorted ? <IonIcon icon={sortAsc ? chevronDown : chevronUp}/> : null}
  </>
);

const sortBoolean = (a: boolean | null, b: boolean | null, sortAsc: boolean) => {
  if (a === b) {
    return 0;
  }

  if (a === null) {
    return sortAsc ? 1 : -1;
  }

  if (b === null) {
    return sortAsc ? -1 : 1;
  }

  if (sortAsc) {
    return a < b ? 1 : -1;
  }

  return a < b ? -1 : 1;
};

const formatDate = (date: Date) => {
  const padZeros = (value: number) => value.toString().padStart(2, '0'),
    year = date.getFullYear(),
    month = padZeros(date.getMonth() + 1),
    day = padZeros(date.getDate()),
    hours = padZeros(date.getHours()),
    minutes = padZeros(date.getMinutes());

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

type Props = {
  vertoSession?: VertoSession | null;
  updateStream?: UpdateTableStream;
  onPlay: (stream: SharedStreamTest) => void;
  onStop: (stream: SharedStreamTest) => void;
};

const StreamTable: FC<Props> = ({vertoSession, updateStream, onPlay, onStop}: Props) => {
  const allStreams = useRef<SharedStreamTest[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [streams, setStreams] = useState<SharedStreamTest[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SharedStreamTest | null>(null);
  const [sort, setSort] = useState<Sort>(Sort.Name);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    StreamService.getAll()
      .then(({data}) => {
        allStreams.current = (data as SharedStreamTest[]).map(stream => {
          stream.last_active_local = '-';
          stream.last_active_local_ms = 0;

          if (stream.last_active) {
            const date = new Date(stream.last_active);
            stream.last_active_local = formatDate(date);
            stream.last_active_local_ms = date.getTime();
          }

          return stream;
        });
        setStreams(allStreams.current.slice(0, INITIAL_SLICE_TO));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    vertoSession?.notification.onEarlyCallError.subscribe(() => {
      setCurrentlyPlaying(null);
    });

    vertoSession?.notification.onDestroy.subscribe(() => {
      setCurrentlyPlaying(null);
    });
  }, [vertoSession]);

  useEffect(() => {
    if (updateStream) {
      const streamForUpdate = allStreams.current.find(s => s.id === updateStream.id);
      if (streamForUpdate) {
        streamForUpdate.last_active = updateStream.lastActive;
        const lastActiveDate = new Date(updateStream.lastActive);
        streamForUpdate.last_active_local = formatDate(lastActiveDate);
        streamForUpdate.last_active_local_ms = lastActiveDate.getTime();
        streamForUpdate.played_successfully = updateStream.playedSuccessfully;
        setStreams(prevState => allStreams.current.slice(0, prevState.length + INITIAL_SLICE_TO));
      }
    }
  }, [updateStream]);

  const handleTbodyClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.tagName !== 'ION-BUTTON') {
      return;
    }

    if (target.dataset.id && target.dataset.action) {
      const id = +target.dataset.id;
      const action = target.dataset.action;
      const stream = streams.find(stream => stream.id === id);
      if (stream) {
        if (action === 'play') {
          onPlay(stream);
          setCurrentlyPlaying(stream);
        } else {
          onStop(stream);
          setCurrentlyPlaying(null);
        }
      }
    }
  };

  const handleLoadMore = (target: any) => {
    setStreams(prevState => allStreams.current.slice(0, prevState.length + INITIAL_SLICE_TO));
    target.complete();
  };

  const handleSort = (sortType: Sort) => {
    let _sortAsc = true;

    if (sort !== sortType) {
      setSort(sortType);
    } else {
      _sortAsc = !sortAsc;
      setSortAsc(_sortAsc);
    }

    switch (sortType) {
      case Sort.Id:
        allStreams.current = allStreams.current.sort(_sortAsc ?
          (a, b) => a.id - b.id :
          (a, b) => b.id - a.id
        );
        break;
      case Sort.Name:
        allStreams.current = allStreams.current.sort(_sortAsc ?
          (a, b) => a.name.localeCompare(b.name) :
          (a, b) => b.name.localeCompare(a.name)
        );
        break;
      case Sort.LastActive:
        allStreams.current = allStreams.current.sort(_sortAsc ?
          (a, b) => a.last_active_local_ms - b.last_active_local_ms :
          (a, b) => b.last_active_local_ms - a.last_active_local_ms
        );
        break;
      case Sort.PS:
        allStreams.current = allStreams.current.sort((a, b) => sortBoolean(a.played_successfully, b.played_successfully, _sortAsc));
        break;
    }

    setStreams(prevState => allStreams.current.slice(0, prevState.length));
  };

  return (
    <InfiniteContent onLoadMore={handleLoadMore}>
      <table className="stream-table">
        <thead>
        <tr>
          <th onClick={() => handleSort(Sort.Id)} className="sortable">
            ID <SortIcons sorted={sort === Sort.Id} sortAsc={sortAsc}/>
          </th>
          <th onClick={() => handleSort(Sort.Name)} className="sortable">
            Name <SortIcons sorted={sort === Sort.Name} sortAsc={sortAsc}/>
          </th>
          <th onClick={() => handleSort(Sort.LastActive)} className="sortable">
            Last active <SortIcons sorted={sort === Sort.LastActive} sortAsc={sortAsc}/>
          </th>
          <th onClick={() => handleSort(Sort.PS)} className="sortable" title="Played successfully">
            PS <SortIcons sorted={sort === Sort.PS} sortAsc={sortAsc}/>
          </th>
          <th/>
        </tr>
        </thead>
        <tbody onClick={handleTbodyClick}>
        {
          loading &&
          <tr>
            <td colSpan={5}>
              <IonSpinner name="bubbles"/>
            </td>
          </tr>
        }
        {streams.map(({id, name, last_active_local, played_successfully}: SharedStreamTest) => (
          <tr key={id}>
            <td>{id}</td>
            <td>{name}</td>
            <td>{last_active_local}</td>
            <td className="played-successfully">
              {
                played_successfully !== null ?
                  (played_successfully ?
                    <IonIcon icon={thumbsUpOutline} color="success"/> :
                    <IonIcon icon={thumbsDownOutline} color="danger"/>)
                  :
                  '-'
              }
            </td>
            <td className="action">
              {
                currentlyPlaying?.id === id ?
                  <IonButton
                    size="small"
                    fill="clear"
                    shape="round"
                    title={`Stop ${name}`}
                    color="danger"
                    data-id={id}
                    data-action="stop"
                  >
                    <IonIcon icon={stop} slot="icon-only"/>
                  </IonButton>
                  :
                  <IonButton
                    size="small"
                    fill="clear"
                    shape="round"
                    title={`Play ${name}`}
                    color="success"
                    data-id={id}
                    data-action="play"
                  >
                    <IonIcon icon={play} slot="icon-only"/>
                  </IonButton>
              }
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </InfiniteContent>
  );
};

export default StreamTable;

