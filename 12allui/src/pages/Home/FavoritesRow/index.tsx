import React, { FC, useCallback, useEffect, useRef } from 'react';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import Stream from '../Stream';
// import {SwiperSlide} from 'swiper/react';
import { IonCol, IonRow, useIonViewWillEnter } from '@ionic/react';
// import HomeSwiper from '../HomeSwiper';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import NotingFound from '../NotingFound';
import { UserManagementService } from '../../../services';
import { Routes } from '../../../shared/routes';
import HeaderLink from '../HeaderLink';
import { setFavoriteStreams } from '../../../redux/actions/streamActions';
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, SwiperOptions } from 'swiper';
import SwiperClass from "swiper/types/swiper-class";

export const FAVORITES_ROW_ID = 'favorites-row-id';

const breakpoints = {
  640: {
    perPage: 1.5,
  },
  768: {
    perPage: 3,
  },
  1024: {
    perPage: 4,
  },
  1200: {
    perPage: 5,
  },
};

const breakpointsSwiper: { [width: number]: SwiperOptions } = {
  640: {
    slidesPerView: 2,
    slidesPerGroup: 2,
  },
  768: {
    slidesPerView: 4,
    slidesPerGroup: 4,
  },
  1024: {
    slidesPerView: 6,
    slidesPerGroup: 6,
  },
};

type Props = {
  otherRoom: boolean;
  onHasFavorites: (value: boolean) => void
};

const FavoritesRow: FC<Props> = ({ onHasFavorites, otherRoom }: Props) => {
  const dispatch = useDispatch();
  const { favoriteStreams } = useSelector(({ stream }: ReduxSelectors) => stream);
  const { filterParams } = useSelector(({ homeFilter }: ReduxSelectors) => homeFilter);
  const swiperRef = useRef<SwiperClass>();

  const getFavorites = useCallback(() => {
    UserManagementService.getUserFavorites(filterParams)
      .then(({ data: { favorite_streams } }) => {
        dispatch(setFavoriteStreams(favorite_streams));
        onHasFavorites(!!favorite_streams);
      });
  }, [filterParams, onHasFavorites, dispatch]);

  useIonViewWillEnter(() => {
    getFavorites();
    swiperRef.current?.slideTo(0);
  }, [getFavorites]);

  useEffect(() => {
    getFavorites();
  }, [getFavorites]);

  return (
    <IonRow
      className="favorites-row"
      hidden={!favoriteStreams.length && !filterParams}
      id={FAVORITES_ROW_ID}>
      <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
        <HeaderLink title="home.favorites" link={Routes.Favorites} />
        {favoriteStreams && favoriteStreams.length === 0 ?
          <NotingFound />
          :
          <>
            {favoriteStreams?.length >= 6 ?
              <Splide
                options={{
                  type: 'loop',
                  perPage: favoriteStreams?.length > 3 ? (!otherRoom ? 3 : 6) : favoriteStreams?.length,
                  gap: '30px',
                  interval: 0,
                  autoScroll: {
                    speed: 0,
                    pauseOnHover: true,
                    autoStart: true,
                    rewind: false,
                    pauseOnFocus: false
                  },
                  breakpoints,
                  isNavigation: false,
                  arrows: false,
                  pagination: false,
                  speed: 60000,
                  easing: 'linear',
                  drag: 'free',
                  focus: "center",
                  lazyLoad: 'sequential',
                  direction: 'rtl',
                }}
                extensions={{ AutoScroll }}
              >
                {favoriteStreams.map(stream =>
                  <SplideSlide key={`${stream.id}_fav_stream`}>
                    <Stream stream={stream} />
                  </SplideSlide>
                )}
              </Splide>
              : favoriteStreams.length > 0 &&
              <Swiper
                className="swiper-favorite"
                modules={[Grid]}
                slidesPerView={favoriteStreams.length}
                grid={{ rows: 1 }}
                spaceBetween={30}
                breakpoints={breakpointsSwiper}
                onSwiper={swiper => swiperRef.current = swiper}
              >
                {favoriteStreams.map(stream =>
                  <SwiperSlide key={`${stream.id}_fav_stream`} className='fav-list'>
                    <Stream stream={stream} />
                  </SwiperSlide>
                )}
              </Swiper>
            }
          </>
        }
      </IonCol>
    </IonRow>
  );
};

export default FavoritesRow;
