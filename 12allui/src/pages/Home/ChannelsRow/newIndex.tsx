import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import { IonCol, IonImg, IonItem, IonRouterLink, IonRow, IonText, useIonViewWillEnter } from "@ionic/react";
import { StreamService } from "../../../services/StreamService";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Grid } from "swiper";
import SwiperClass from "swiper/types/swiper-class";
import { ReduxSelectors } from "../../../redux/shared/types";
import NotingFound from "../NotingFound";
import HeaderLink from "../HeaderLink";
import { Routes } from "../../../shared/routes";
import { parseStreamSnapshots } from "../../../shared/helpers";
import useStreamsSocket from "../../../hooks/useStreamsSocket";
import { setStreams } from "../../../redux/actions/streamActions";
import { useHistory } from "react-router";
import { SharedStreamVlrs, Vlr } from "../../../shared/types";
import { API_URL ,SNAPSHOT_URL} from "../../../shared/constants";
import logo from '../../../images/12all-logo-128.png';
import StreamActions from "../StreamActions";


export const CHANNELS_ROW_ID = "channels-row-id";
// const CHANNELS_PER_PAGE = 24;
// const breakpoints: { [width: number]: SwiperOptions } = {
//   640: {
//     slidesPerView: 2,
//     slidesPerGroup: 2,
//   },
//   768: {
//     slidesPerView: 4,
//     slidesPerGroup: 4,
//   },
//   1024: {
//     slidesPerView: 6,
//     slidesPerGroup: 6,
//   },
// };

type Props = {
  onHasChannels: (value: boolean) => void;
};

const ChannelsRowNew: FC<Props> = React.memo(({ onHasChannels }: Props) => {
  const dispatch = useDispatch();
  const { streams } = useSelector(({ stream }: ReduxSelectors) => stream);
  const page = useRef<number>(0);
  const swiperRef = useRef<SwiperClass>();
  const { isAnonymous } = useSelector(({ profile }: ReduxSelectors) => profile)
  const history = useHistory()
  const [vlrs, setVlrs] = useState<Vlr[]>([]);
  const [snapshotError, setSnapshotError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    streams?.map((stream: SharedStreamVlrs) => {
      if (stream?.vlr) {
        setVlrs(stream.vlr ? stream.vlr : []);
      }
    })
  }, [streams]);

  const loadStreams = useCallback(async () => {
    const {
      data: { data },
    } = await StreamService.getSharedStreams(
      `limit=${100}&start=${0}&snapshots=1&`
    );
    onHasChannels(!!data);
    return parseStreamSnapshots(data);
  }, [onHasChannels]);

  useStreamsSocket(loadStreams);

  useIonViewWillEnter(() => {
    page.current = 0;
    swiperRef.current?.slideTo(0);
    loadStreams().then((streams) => dispatch(setStreams(streams)));
  }, [loadStreams, dispatch]);

  useEffect(() => {
    page.current = 0;
    loadStreams().then((streams) => dispatch(setStreams(streams)));
  }, [loadStreams, dispatch]);

  // const handleNavigationNext = (swiper: SwiperClass) => {
  //   const objBreakpoint = breakpoints[+swiper.currentBreakpoint];

  //   if (objBreakpoint?.slidesPerView) {
  //     const difference = (objBreakpoint.slidesPerView as number) * 2;
  //     if (
  //       swiper.snapIndex * difference ===
  //       CHANNELS_PER_PAGE * (page.current + 1) - difference
  //     ) {
  //       page.current = page.current + 1;
  //       loadStreams().then((additionalStreams) =>
  //         dispatch(setStreams([...streams, ...additionalStreams]))
  //       );
  //     }
  //   }
  // };

  const handleAnonymousStreamRoute = (stream: SharedStreamVlrs) => {
    if (isAnonymous) {
      return history.push(Routes.Login, { streamId: stream.id, from: "anonymousStream" });
    } else {
      return history.push(`${Routes.Stream}/${stream.id}`)
    }
  }

  const renderStream = (stream: any) => {

    return (
      <SwiperSlide key={stream.id}>
        <IonItem
          button
          className="shared-stream-item"
          lines="none"
          detail={false}
        >
          <IonRouterLink
            className="shared-stream-wrapper"
            // routerLink={`${Routes.Stream}/${stream.id}`}
            onClick={() => handleAnonymousStreamRoute(stream)}
          >
            {
              vlrs.length > 0 ?
                <div className={`stream-preview-holder stream-previews-${vlrs.length}`}>
                  {
                    vlrs.map(vlr => (
                      <IonImg
                        key={vlr.id}
                        src={vlr.channel.https_preview_high as string}
                        onIonError={() => setVlrs(vlrs.filter(v => v.id !== vlr.id))}
                        alt=""
                      />
                    ))
                  }
                </div> :
                stream.id ?
                <IonImg
                  src={snapshotError ? logo : `${SNAPSHOT_URL}/${stream.id}.jpg`}
                  alt=""
                  className="stream-snapshot"
                  onIonError={() => setSnapshotError(true)}
                /> :
                null
            }

            <IonImg
              src={stream.logo_image ? `${API_URL}${(stream.logo_image.formats?.thumbnail?.url || stream.logo_image.url)}` : (stream.logo || logo)}
              alt=""
              className="stream-logo"
            />
            <IonText className="shared-stream-name" color="dark">{stream.name}</IonText>
          </IonRouterLink>
          <StreamActions stream={stream} />

        </IonItem>
      </SwiperSlide>
    )
  }

  // const handleMouseEnter = (e: any) => {
  //   console.log("e", e)
  //   if (swiperRef.current?.autoplay) {
  //     console.log("swiperRef.current?.autoplay", swiperRef.current?.autoplay)
  //     swiperRef.current.autoplay.pause(0);
  //   }
  // };

  // const handleMouseLeave = () => {
  //   if (swiperRef.current?.autoplay) {
  //     swiperRef.current.autoplay.start();
  //   }
  // };

  // console.log("swiper ref", swiperRef.current)
  // useEffect(() => {
  //   window.location.reload()
  // }, [history])

  return (
    <IonRow
      className="home-channels-row"
      id={CHANNELS_ROW_ID}
    >
      <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
        <HeaderLink title="home.channels" link={Routes.Channels} />
        {streams?.length > 0 ?
          (
            <Swiper
              className="swiper-paginated"
              modules={[Grid, Autoplay]}
              slidesPerView={6}
              grid={{ rows: 2 }}
              spaceBetween={30}
              // onReachEnd={handleReachEnd}
              // initialSlide={activeIndex}
              // loopedSlides={24}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
                stopOnLastSlide: false,
              }}
              // onProgress={(e) => console.log("prog", e)}
              // onAutoplayPause={() => swiperRef?.current?.autoplay.pause(500)}
              // onAutoplayResume={handleMouseLeave}
              speed={4000}
              // breakpoints={breakpoints}
              // navigation
              // pagination={{ clickable: true }}
              loop={true}
              onSwiper={swiper => swiperRef.current = swiper}
            // onNavigationNext={handleNavigationNext}
            // freeMode={true}
            >
              {streams.map(renderStream)}
            </Swiper>
          ) : (
            <NotingFound />
          )
        }
      </IonCol>
    </IonRow>
  );
});

export default ChannelsRowNew;