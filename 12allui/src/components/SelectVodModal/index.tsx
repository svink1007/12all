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
import { closeCircleOutline, filmOutline } from 'ionicons/icons';
import logo12all from '../../images/12all-logo-128.png';
import { useTranslation } from 'react-i18next';
import { VodState } from "../../redux/reducers/vodReducers";
import { VodService } from "../../services/VodService";
import dollar from "../../images/icons/dollar.svg";
import redStar from "../../images/icons/star-sharp.svg";
import {useHistory} from "react-router";
import {Routes} from "../../shared/routes";

type VodsProps = {
  vod: VodState[],
  vodId?: number | null
};

const VoDElement: FC<VodsProps> = ({ vod, vodId }: VodsProps) => {
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
          vod.map(({ id, logo, title, starsAmount }: VodState) => (
              <IonItem id={`row-${id}`} key={id} data-id={id} button color={vodId === id ? 'secondary' : ''}>
                <IonImg
                    src={logo ? logo : logo12all}
                    className="stream-logo"
                    data-id={id} />
                <IonLabel data-id={id}>{title}</IonLabel>
                {
                    starsAmount && <div className='stars-amount'>
                      {!["FREE", "Free", "free", null, "", "0"].includes(`${starsAmount}`) && <IonImg src={dollar} />}
                      <IonLabel>{getCamelCase(`${starsAmount}`)}</IonLabel>
                      {!["FREE", "Free", "free", null, "", "0"].includes(`${starsAmount}`) && <IonImg src={redStar} />}
                    </div>
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
  vodId?: number;
  showManageStreamButtons?: boolean;
  onClose: (vod?: VodState) => void;
  onSelect?: (vod: VodState | null) => void;
  onDeleteVod?: () => void;
};

const SelectVodModal: FC<Props> = ({ open, vodId, showManageStreamButtons, onClose, onSelect, onDeleteVod }: Props) => {
  const { t } = useTranslation();

  const searchValue = useRef<string>('');
  const allVodRef = useRef<VodState[]>([]);

  const [allVod, setAllVod] = useState<VodState[]>([]);
  const [openEditVodModal, setOpenEditVodModal] = useState<boolean>(false);
  const [filteredVod, setFilteredVod] = useState<VodState[]>([]);
  const [selectedVod, setSelectedVod] = useState<VodState | null>(null);

  const handleSearchChange = useCallback((value: string = searchValue.current, sliceTo = INITIAL_SLICE_TO) => {
    searchValue.current = value.toLowerCase();
    if (value) {
      const foundVod = allVodRef.current.filter(({ title }) => title.toLowerCase().startsWith(searchValue.current));
      setFilteredVod(foundVod);
    } else {
      setFilteredVod(allVodRef.current.slice(0, sliceTo));
    }
  }, []);

  useEffect(() => {
    VodService.getAllVod("all").then(({ data }) => setAllVod(data));
  }, []);

  useEffect(() => {
    if (vodId && allVod.length) {
      const stream = allVod.find(({ id }) => vodId === id);
      if (stream) {
        setSelectedVod(stream);
        onSelect && onSelect(stream);
      }
    } else {
      onSelect && onSelect(null);
      setSelectedVod(null);
    }
  }, [allVod, vodId, onSelect]);

  useEffect(() => {
    allVodRef.current = allVod;
    setFilteredVod(allVod.slice(0, INITIAL_SLICE_TO));
    handleSearchChange();
  }, [allVod, handleSearchChange]);

  const handleModalDidPresent = () => {
    if (selectedVod) {
      const streamRow = document.getElementById('row-' + selectedVod.id);
      if (streamRow) {
        setTimeout(() => streamRow.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      }
    }
  };

  const handleCloseStreams = () => {
    onClose();
  };

  const history = useHistory();

  const handleStreamClick = (e: React.MouseEvent) => {
    const streamId = (e.target as HTMLElement).getAttribute('data-id');
    if (streamId) {
      const streamIdAsNumber = +streamId;
      const stream = allVod.find(({ id }) => id === streamIdAsNumber);
      if (stream) {
        const type = (e.target as HTMLElement).getAttribute('data-type');
        switch (type) {
          case 'edit':
            setOpenEditVodModal(true);
            break;
          default:
            history.push(`${Routes.Vod}/${streamId}`);
            onClose(stream);
            break;
        }
      }
      setSelectedVod(stream || null);
    }
  };

  const handleInfiniteScroll = (e: any) => {
    e.target.complete();
    handleSearchChange(searchValue.current, filteredVod.length + INITIAL_SLICE_TO)
  };

  return (
      <>
        <IonModal
            isOpen={open}
            onDidPresent={handleModalDidPresent}
            onDidDismiss={handleCloseStreams}
            className="room-select-stream-modal"
            style={{ "--height": "600px" }}
            hidden={openEditVodModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Change Video on Demand</IonTitle>
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
            <IonList onClick={handleStreamClick} hidden={!filteredVod.length}>
              <IonListHeader>
                <IonIcon icon={filmOutline} color="medium" />
                <IonLabel color="medium">{t('Video On Demand')}</IonLabel>
              </IonListHeader>
              <VoDElement vod={filteredVod} vodId={selectedVod?.id} />
            </IonList>

            <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
              <IonInfiniteScrollContent />
            </IonInfiniteScroll>
          </IonContent>
        </IonModal>
      </>
  );
};

export default SelectVodModal;