import React, { FC, useCallback, useRef } from 'react';
import './styles.scss';
import { IonCol, IonRow, useIonViewWillEnter } from '@ionic/react';
import { StreamService } from '../../../services/StreamService';
import { useDispatch, useSelector } from 'react-redux';
import Stream from '../Stream';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Navigation, SwiperOptions } from 'swiper';
// import SwiperClass from 'swiper/types/swiper-class';
import { ReduxSelectors } from '../../../redux/shared/types';
import NotingFound from '../NotingFound';
import HeaderLink from '../HeaderLink';
import { Routes } from '../../../shared/routes';
import { parseStreamSnapshots } from '../../../shared/helpers';
import useStreamsSocket from '../../../hooks/useStreamsSocket';
import {setStreamsRow} from '../../../redux/actions/streamRowActions';
// import { SharedStreamVlrs } from '../../../shared/types';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import { Grid } from '@splidejs/splide-extension-grid';

export const CHANNELS_ROW_ID = 'channels-row-id';
const CHANNELS_PER_PAGE = 96;

const breakpoints = {
  640: {
    perPage: 0.5,
    // gap:"10px"
  },
  768: {
    perPage: 1.5,
  },
  1024: {
    perPage: 2,
  },
  1200: {
    perPage: 2.5,
  },
};

type Props = {
  onHasChannels: (value: boolean) => void;
};


const ChannelsRow: FC<Props> = ({ onHasChannels }: Props) => {
  const dispatch = useDispatch();
  const {streams} = useSelector(({streamRow}: ReduxSelectors) => streamRow)
  const { filterParams } = useSelector(({ homeFilter }: ReduxSelectors) => homeFilter);
  const page = useRef<number>(0);
  // const swiperRef = useRef<SwiperClass>();
  // const [swipeSpeed,setSwipeSpeed] = useState(60000)

  const loadStreams = useCallback(async () => {
    const { data: { data } } = await StreamService.getSharedStreams(`limit=${CHANNELS_PER_PAGE}&start=${page.current * CHANNELS_PER_PAGE}&snapshots=1`);
    onHasChannels(!!data);
    return parseStreamSnapshots(data);
  }, [onHasChannels]);

  useStreamsSocket(loadStreams);

  useIonViewWillEnter(() => {
    page.current = 0;
    // swiperRef.current?.slideTo(0);
    loadStreams().then((streams) => dispatch(setStreamsRow(streams)) );
  }, [loadStreams, dispatch]);

  // const handleNavigationNext = (swiper: SwiperClass) => {
  //   const objBreakpoint = breakpoints[+swiper.currentBreakpoint];

  //   if (objBreakpoint?.slidesPerView) {
  //     const difference = objBreakpoint.slidesPerView as number * 2;
  //     if (swiper.snapIndex * difference === (CHANNELS_PER_PAGE * (page.current + 1) - difference)) {
  //       page.current = page.current + 1;
  //       loadStreams().then((additionalStreams) => dispatch(setStreamsRow([...streams, ...additionalStreams])));
  //     }
  //   }
  // };

  return (
    <IonRow
      className="home-channels-row"
      id={CHANNELS_ROW_ID}
      hidden={!streams.length && !filterParams}
    >
      <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
        <HeaderLink title="home.channels" link={Routes.Channels} />
        {
          streams.length > 0 && !filterParams ?
          <>              
          {/* <button style={{color:'white', zIndex:1000,position:'absolute'}} onClick={() => setSwipeSpeed(swipeSpeed === 60000 ? 10000 : 60000)}>{`>>`}</button> */}

            <Splide
              options={{
                type: 'loop',
                perPage: 4,
                gap: '30px',
                interval: 0,

                grid: {
                  rows: 2,
                  cols: 2,
                  gap: {
                    row: '1.5rem',
                    col: '30px',
                  },
                },
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
                // focus: "center",
                lazyLoad: 'sequential',
                // cloneStatus: false,
                // focusableNodes: "all",
              }}
              extensions={{ AutoScroll, Grid }}
            >
              {streams.map((stream, index) => (
                <SplideSlide key={index}>
                  <Stream stream={stream} redirectFrom='HOME'/>
                </SplideSlide>
              ))}
            </Splide>
          </>
            :
            <NotingFound />
        }
      </IonCol>
    </IonRow>
  );
};

export default ChannelsRow;
