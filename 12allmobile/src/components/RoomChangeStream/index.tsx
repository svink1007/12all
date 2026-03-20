import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
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
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { closeCircleOutline, filmOutline, heart } from "ionicons/icons";
import { SharedStream } from "../../shared/types";
import logo12all from "../../images/12all-logo-128.svg";
import { useTranslation } from "react-i18next";
import AppSearchbar from "../AppSearchbar";
import { StreamService } from "../../services";
import { API_URL } from "../../shared/constants";

type StreamsProps = {
  streams: SharedStream[];
  streamId?: number | null;
};

const Streams: FC<StreamsProps> = ({ streams, streamId }: StreamsProps) => (
  <>
    {streams.map(({ id, logo_image, name }: SharedStream) => (
      <IonItem
        id={`row-${id}`}
        key={id}
        data-id={id}
        button
        color={streamId === id ? "secondary" : ""}
      >
        <IonImg
          src={
            logo_image
              ? `${API_URL}${
                  logo_image.formats?.thumbnail?.url || logo_image.url
                }`
              : logo12all
          }
          className="stream-logo"
          data-id={id}
        />
        <IonLabel data-id={id}>{name}</IonLabel>
      </IonItem>
    ))}
  </>
);

const INITIAL_SLICE_TO = 50;
const ROOM_CHANGE_STREAM_MODAL_ID = "room-change-stream-modal-id";

type Props = {
  inPipMode: boolean;
  streamId: number;
  onChangeStream: (stream: SharedStream) => void;
};

const RoomChangeStream: FC<Props> = ({
  inPipMode,
  streamId,
  onChangeStream,
}: Props) => {
  const { t } = useTranslation();
  const searchValue = useRef<string>("");
  const favoriteStreamsRef = useRef<SharedStream[]>([]);
  const restStreamsRef = useRef<SharedStream[]>([]);
  const modal = useRef<HTMLIonModalElement>(null);

  const [filteredStreams, setFilteredStreams] = useState<SharedStream[]>([]);
  const [allStreams, setAllStreams] = useState<SharedStream[]>([]);
  const [favoriteStreams, setFavoriteStreams] = useState<SharedStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<SharedStream>();

  const handleSearchChange = useCallback(
    (value: string = searchValue.current, sliceTo = INITIAL_SLICE_TO) => {
      searchValue.current = value.toLowerCase();

      if (value) {
        const foundFavoriteStreams = favoriteStreamsRef.current.filter(
          ({ name }) => name.toLowerCase().startsWith(searchValue.current)
        );
        setFavoriteStreams(foundFavoriteStreams);
        const foundStreams = restStreamsRef.current.filter(({ name }) =>
          name.toLowerCase().startsWith(searchValue.current)
        );
        setFilteredStreams(foundStreams);
      } else {
        setFavoriteStreams(favoriteStreamsRef.current);
        setFilteredStreams(restStreamsRef.current.slice(0, sliceTo));
      }
    },
    []
  );

  useEffect(() => {
    StreamService.getStreams().then(({ data: { data } }) =>
      setAllStreams(data)
    );
  }, []);

  useEffect(() => {
    if (inPipMode) {
      modal.current?.dismiss();
    }
  }, [inPipMode]);

  useEffect(() => {
    if (streamId && allStreams.length) {
      const stream = allStreams.find(({ id }) => streamId === id);
      if (stream) {
        setSelectedStream(stream);
      }
    }
  }, [allStreams, streamId]);

  useEffect(() => {
    const favorite: SharedStream[] = [];
    const rest: SharedStream[] = [];
    allStreams.forEach((stream) => {
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

  const handleCloseStreams = () => {
    modal.current?.dismiss();
  };

  const handleModalDidPresent = () => {
    if (selectedStream) {
      const streamRow = document.getElementById("row-" + selectedStream.id);
      if (streamRow) {
        // need setTimeout for smooth scroll
        setTimeout(() =>
          streamRow.scrollIntoView({ block: "center", behavior: "smooth" })
        );
      }
    }
  };

  const handleStreamClick = (e: React.MouseEvent) => {
    const streamId = (e.target as HTMLElement).getAttribute("data-id");
    if (streamId) {
      const streamIdAsNumber = +streamId;
      const stream = filteredStreams.find(({ id }) => id === streamIdAsNumber);

      if (stream) {
        setSelectedStream(stream);
        onChangeStream(stream);
      }
    }

    handleCloseStreams();
  };

  const handleInfiniteScroll = (e: any) => {
    e.target.complete();
    handleSearchChange(
      searchValue.current,
      filteredStreams.length + INITIAL_SLICE_TO
    );
  };

  return (
    <>
      <IonButton id={ROOM_CHANGE_STREAM_MODAL_ID}>
        <IonIcon slot="icon-only" icon={filmOutline} />
      </IonButton>

      <IonModal
        ref={modal}
        trigger={ROOM_CHANGE_STREAM_MODAL_ID}
        onDidPresent={handleModalDidPresent}
        className="room-change-stream-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t("changeStream.title")}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseStreams}>
                <IonIcon slot="icon-only" icon={closeCircleOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <AppSearchbar
            value={searchValue.current}
            onSearchChange={handleSearchChange}
          />
        </IonHeader>

        <IonContent>
          <IonList
            onClick={handleStreamClick}
            className={`${
              !favoriteStreams.length && !filteredStreams.length
                ? "ion-hide"
                : ""
            }`}
          >
            <IonListHeader
              className={`${!favoriteStreams.length ? "ion-hide" : ""}`}
            >
              <IonIcon icon={heart} color="medium" />
              <IonLabel color="medium">
                {t("changeStream.favoriteStreams")}
              </IonLabel>
            </IonListHeader>
            <Streams streams={favoriteStreams} streamId={selectedStream?.id} />

            <IonListHeader
              className={`${!filteredStreams.length ? "ion-hide" : ""}`}
            >
              <IonIcon icon={filmOutline} color="medium" />
              <IonLabel color="medium">{t("changeStream.streams")}</IonLabel>
            </IonListHeader>
            <Streams streams={filteredStreams} streamId={selectedStream?.id} />
          </IonList>

          <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        </IonContent>
      </IonModal>
    </>
  );
};

export default RoomChangeStream;
