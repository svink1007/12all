import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import './styles.scss';
import { IonCol, IonRow } from '@ionic/react';
import NotingFound from '../NotingFound';
import { useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import { Routes } from '../../../shared/routes';
import HeaderLink from '../HeaderLink';
import LiveRoom from '../../../components/LiveRoom';
import UpcomingRoom from '../../../components/UpcomingRoom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import RoomHeader from '../../../components/RoomHeader';
import useRoomsSocket from '../../../hooks/useRoomsSocket';
import FavoritesRow from "../FavoritesRow";

export const ROOMS_ROW_ID = 'rooms-row-id';

type Props = {
  onHasRooms: (hasRooms: boolean) => void;
  onHasFavourites: (hasRooms: boolean) => void;
};

interface RoomSwiperProps extends PropsWithChildren {
  hasOtherRooms: boolean;
}

const RoomSwiper: FC<RoomSwiperProps> = ({ hasOtherRooms, children }: RoomSwiperProps) => {
  const [keyValue, setKeyValue] = useState(1);

  useEffect(() => {
    // We need to rerender the swiper oh rooms change in order for the breakpoints to take effect
    setKeyValue(prevState => prevState + 1);
  }, [hasOtherRooms]);

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={12}
      breakpoints={{
          640: {
              slidesPerView: hasOtherRooms ? 1 : 2,
              slidesPerGroup: hasOtherRooms ? 1 : 2
          },
          768: {
              slidesPerView: hasOtherRooms ? 2 : 4,
              slidesPerGroup: hasOtherRooms ? 2 : 4
          },
          1024: {
              slidesPerView: hasOtherRooms ? 3 : 6,
              slidesPerGroup: hasOtherRooms ? 3 : 6
          },
          1920: {
              slidesPerView: hasOtherRooms ? 4 : 8,
              slidesPerGroup: hasOtherRooms ? 4 : 8
          }
      }}
      navigation
      modules={[Navigation]}
      className="room-swiper"
      key={keyValue}
    >
      {children}
    </Swiper>
  );
};

const RoomsRow: FC<Props> = ({ onHasRooms, onHasFavourites }) => {
  const { filterParams } = useSelector(({ homeFilter }: ReduxSelectors) => homeFilter);
  const { liveRooms, upcomingRooms } = useRoomsSocket();

  const { jwt, isAnonymous, id } = useSelector(({ profile }: ReduxSelectors) => profile);
  const { favoriteStreams } = useSelector(({ stream }: ReduxSelectors) => stream);

  useEffect(() => {
    onHasRooms(!!liveRooms.length || !!upcomingRooms.length);
  }, [liveRooms, upcomingRooms, onHasRooms]);

  return (

    <IonRow>
        <IonCol sizeXs="12" sizeSm="12" sizeMd={!liveRooms.length ? "12" : "6"} sizeLg={!liveRooms.length ? "12" : "6"} sizeXl={!liveRooms.length ? "12" : "6"}>
            {jwt && <FavoritesRow otherRoom={!liveRooms.length && !upcomingRooms.length} onHasFavorites={onHasFavourites} />}
        </IonCol>
        <IonCol sizeXs="12" sizeSm="12" sizeMd={!favoriteStreams.length ? "12" : "6"} sizeLg={!favoriteStreams.length ? "12" : "6"} sizeXl={!favoriteStreams.length ? "12" : "6"}>
            <IonRow
                className="rooms-row"
                hidden={!liveRooms.length && !upcomingRooms.length && !filterParams}
                id={ROOMS_ROW_ID}>
                <IonCol
                    sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
                    <HeaderLink title="home.rooms" link={Routes.Rooms} />
                    {liveRooms.length === 0 && upcomingRooms.length === 0 && <NotingFound />}
                </IonCol>
                <IonCol
                    sizeXs="12"
                    sizeSm="12"
                    sizeMd={upcomingRooms.length ? '6' : '12'}
                    sizeLg={upcomingRooms.length ? '6' : '12'}
                    sizeXl={upcomingRooms.length ? '6' : '12'}
                    hidden={!liveRooms.length}
                    className="live-rooms-col">
                    <RoomSwiper hasOtherRooms={!!favoriteStreams.length}>
                        {
                            liveRooms?.map((room) => {
                                    return (
                                        <SwiperSlide key={`${room.id}_live`}>
                                            <LiveRoom isHome={true} room={room} />
                                        </SwiperSlide>)
                                }
                            )
                        }
                    </RoomSwiper>
                </IonCol>
                <IonCol
                    sizeXs="12"
                    sizeSm="12"
                    sizeMd="6"
                    sizeLg={liveRooms.length ? '6' : '12'}
                    sizeXl={liveRooms.length ? '6' : '12'}
                    hidden={!upcomingRooms.length}
                    className="upcoming-rooms-col">
                    <RoomHeader title="home.upcomingRooms" />
                    <RoomSwiper hasOtherRooms={!!liveRooms.length}>
                        {
                            upcomingRooms.map((room) =>
                                <SwiperSlide key={`${room.id}_upcoming`}>
                                    <UpcomingRoom room={room} />
                                </SwiperSlide>)
                        }
                    </RoomSwiper>
                </IonCol>
            </IonRow>
        </IonCol>
    </IonRow>

  );
};

export default RoomsRow;
