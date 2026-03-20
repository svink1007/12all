import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { closeCircleOutline, createOutline, filmOutline, heart, trashOutline } from 'ionicons/icons';
import { SharedStream } from '../../shared/types';
import logo12all from '../../images/12all-logo-128.png';
import { useTranslation } from 'react-i18next';
import { StreamService } from '../../services/StreamService';
import EditStream from '../EditStream';
import DeleteStream from '../DeleteStream';
import { setErrorToast, setInfoToast } from '../../redux/actions/toastActions';
import { useDispatch } from 'react-redux';
import { API_URL } from '../../shared/constants';
import dollar from "../../images/icons/dollar.svg";
import redStar from "../../images/icons/star-sharp.svg";

type StreamsProps = {
  streams: SharedStream[],
  streamId?: number | null
};

const Streams: FC<StreamsProps> = ({ streams, streamId }: StreamsProps) => {

  const { t } = useTranslation();

  const getCamelCase = (starsAmount: string) => {
    switch (starsAmount) {
      case "FREE":
      case "Free":
      case "free":
        return "Free"
      default: return starsAmount
    }
  }

  return (
    <>
      {
        streams.map(({ id, logo_image, name, is_owner, starsAmount }: SharedStream) => (
          <IonItem id={`row-${id}`} key={id} data-id={id} button color={streamId === id ? 'secondary' : ''}>
            <IonImg
              src={logo_image ? `${API_URL}${(logo_image.formats?.thumbnail?.url || logo_image.url)}` : logo12all}
              className="stream-logo"
              data-id={id} />
            <IonLabel data-id={id}>{name}</IonLabel>
            <div className='stars-amount'>
              {!["FREE", "Free", "free", null, ""].includes(starsAmount) && <IonImg src={dollar} />}
              <IonLabel>{getCamelCase(starsAmount)}</IonLabel>
              {!["FREE", "Free", "free", null, ""].includes(starsAmount) && <IonImg src={redStar} />}
            </div>
            {
              is_owner &&
              <IonButtons slot="end">
                <IonButton color="warning" title={t('common.edit')} data-type="edit" data-id={id}>
                  <IonIcon icon={createOutline} slot="icon-only" data-type="edit" data-id={id} />
                </IonButton>
                <IonButton color="danger" title={t('common.delete')} data-type="delete" data-id={id}>
                  <IonIcon icon={trashOutline} slot="icon-only" data-type="delete" data-id={id} />
                </IonButton>
              </IonButtons>
            }
          </IonItem>
        ))
      }
    </>
  );
};

const INITIAL_SLICE_TO = 50;

type Props = {
  open: boolean;
  streamId?: number;
  showManageStreamButtons?: boolean;
  onClose: (stream?: SharedStream) => void;
  onSelect?: (stream: SharedStream | null) => void;
  onDeleteSteam?: () => void;
};

const SelectStreamModal: FC<Props> = ({ open, streamId, showManageStreamButtons, onClose, onSelect, onDeleteSteam }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const searchValue = useRef<string>('');
  const favoriteStreamsRef = useRef<SharedStream[]>([]);
  const restStreamsRef = useRef<SharedStream[]>([]);

  const [allStreams, setAllStreams] = useState<SharedStream[]>([]);
  const [openDeleteStreamAlert, setOpenDeleteStreamAlert] = useState<boolean>(false);
  const [openEditStreamModal, setOpenEditStreamModal] = useState<boolean>(false);
  const [favoriteStreams, setFavoriteStreams] = useState<SharedStream[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<SharedStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<SharedStream | null>(null);

  const handleSearchChange = useCallback((value: string = searchValue.current, sliceTo = INITIAL_SLICE_TO) => {
    searchValue.current = value.toLowerCase();
    if (value) {
      const foundFavoriteStreams = favoriteStreamsRef.current.filter(({ name }) => name.toLowerCase().startsWith(searchValue.current));
      setFavoriteStreams(foundFavoriteStreams);
      const foundStreams = restStreamsRef.current.filter(({ name }) => name.toLowerCase().startsWith(searchValue.current));
      setFilteredStreams(foundStreams);
    } else {
      setFavoriteStreams(favoriteStreamsRef.current);
      setFilteredStreams(restStreamsRef.current.slice(0, sliceTo));
    }
  }, []);

  useEffect(() => {
    StreamService.getSharedStreams().then(({ data: { data } }) => setAllStreams(data));
  }, []);

  useEffect(() => {
    if (streamId && allStreams.length) {
      const stream = allStreams.find(({ id }) => streamId === id);
      if (stream) {
        setSelectedStream(stream);
        onSelect && onSelect(stream);
      }
    } else {
      onSelect && onSelect(null);
      setSelectedStream(null);
    }
  }, [allStreams, streamId, onSelect]);

  useEffect(() => {
    const favorite: SharedStream[] = [];
    const rest: SharedStream[] = [];
    allStreams.forEach(stream => {
      if (stream.is_favorite) {
        favorite.push(stream);
      } else {
        rest.push(stream);
      }
    });

    favoriteStreamsRef.current = favorite;
    restStreamsRef.current = rest;
    setFavoriteStreams(favorite);
    setFilteredStreams(rest.slice(0, INITIAL_SLICE_TO));
    handleSearchChange();
  }, [allStreams, handleSearchChange]);

  const handleModalDidPresent = () => {
    if (selectedStream) {
      const streamRow = document.getElementById('row-' + selectedStream.id);
      if (streamRow) {
        // need setTimeout for smooth scroll
        setTimeout(() => streamRow.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      }
    }
  };

  const handleCloseStreams = () => {
    onClose();
  };

  const handleStreamClick = (e: React.MouseEvent) => {
    const streamId = (e.target as HTMLElement).getAttribute('data-id');
    console.log(streamId);
    if (streamId) {
      const streamIdAsNumber = +streamId;
      const stream = allStreams.find(({ id }) => id === streamIdAsNumber);
      if (stream) {
        const type = (e.target as HTMLElement).getAttribute('data-type');
        switch (type) {
          case 'edit':
            setOpenEditStreamModal(true);
            break;
          case 'delete':
            setOpenDeleteStreamAlert(true);
            break;
          default:
            onClose(stream);
            break;
        }
      }
      setSelectedStream(stream || null);
    }
  };

  const handleInfiniteScroll = (e: any) => {
    e.target.complete();
    handleSearchChange(searchValue.current, filteredStreams.length + INITIAL_SLICE_TO)
  };

  const handleUpdateStream = (stream: SharedStream) => {
    const filteredStreams = allStreams.filter(s => s.id !== stream.id);
    setAllStreams([...filteredStreams, stream].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteStreamConfirmed = () => {
    if (selectedStream) {
      StreamService.deleteStream(selectedStream.id)
        .then(() => {
          dispatch(setInfoToast('manageStream.deleted'));
          setOpenDeleteStreamAlert(false);
          setAllStreams(prevState => prevState.filter(s => s.id !== selectedStream.id));
          setSelectedStream(null);
          onDeleteSteam && onDeleteSteam();
        })
        .catch(() => {
          dispatch(setErrorToast('manageStream.generalError'));
        });
    }
  };

  return (
    <>
      <IonModal
        isOpen={open}
        onDidPresent={handleModalDidPresent}
        onDidDismiss={handleCloseStreams}
        className="room-select-stream-modal"
        style={{ "--height": "600px" }}
        hidden={openEditStreamModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('changeStream.title')}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseStreams}>
                <IonIcon slot="icon-only" icon={closeCircleOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonSearchbar
            value={searchValue.current}
            onIonChange={e => handleSearchChange(e.detail.value || '')}
          />
        </IonHeader>

        <IonContent>
          <IonList onClick={handleStreamClick} hidden={!favoriteStreams.length && !filteredStreams.length}>
            <IonListHeader hidden={!favoriteStreams.length}>
              <IonIcon icon={heart} color="medium" />
              <IonLabel color="medium">{t('changeStream.favoriteStreams')}</IonLabel>
            </IonListHeader>
            <Streams streams={favoriteStreams} streamId={selectedStream?.id} />

            <IonListHeader hidden={!filteredStreams.length}>
              <IonIcon icon={filmOutline} color="medium" />
              <IonLabel color="medium">{t('changeStream.streams')}</IonLabel>
            </IonListHeader>
            <Streams streams={filteredStreams} streamId={selectedStream?.id} />
          </IonList>

          <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        </IonContent>
      </IonModal>

      {
        selectedStream && showManageStreamButtons &&
        <>
          <EditStream
            stream={selectedStream}
            open={openEditStreamModal}
            onDismiss={() => setOpenEditStreamModal(false)}
            onUpdateStream={handleUpdateStream}
          />
          <DeleteStream
            streamName={selectedStream.name}
            open={openDeleteStreamAlert}
            onDismiss={() => setOpenDeleteStreamAlert(false)}
            onConfirm={handleDeleteStreamConfirmed}
          />
        </>
      }
    </>
  );
};

export default SelectStreamModal;
