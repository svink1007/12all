import React, { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import './styles.scss';
import { IonCol, IonRow, useIonViewWillEnter } from '@ionic/react';
import NotingFound from '../NotingFound';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import { Routes } from '../../../shared/routes';
import HeaderLink from '../HeaderLink';
import { VodService } from "../../../services/VodService";
import { allVods } from "../../../redux/actions/vodActions";
import VodRoom from "../../../components/VodRoom";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import { Grid } from "@splidejs/splide-extension-grid";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useVodNavigation } from '../../../hooks/useVodNavigation';

export const VODS_ROW_ID = 'vods-row-id';

type Props = {
    onHasRooms: (hasRooms: boolean) => void;
};

type ComponentProps = PropsWithChildren<{
    count: number;
    onSlideClick: (event: MouseEvent) => void;
}>;

const RoomSplider: FC<ComponentProps> = ({ children, count, onSlideClick }: ComponentProps) => {
    const splideRef = useRef<any>();

    useEffect(() => {
        const splide = splideRef.current?.splide;
        if (splide) {
            const handleClick = (slide: any, event: MouseEvent) => {
                onSlideClick(event);
            };

            splide.on('click', handleClick);
            return () => splide.off('click', handleClick);
        }
    }, [onSlideClick]);

    return (
        <Splide
            ref={splideRef}
            options={{
                type: 'loop',
                perPage: 6,
                gap: '30px',
                interval: 0,
                grid: {
                    rows: count > 12 ? 2 : 1,
                    cols: 1,
                    gap: {
                        row: '1.5rem',
                        col: '30px',
                    },
                },
                breakpoints: {
                    640: { perPage: 2 },
                    768: { perPage: 4 },
                    1024: { perPage: 8 },
                    1200: { perPage: 10 },
                },
                isNavigation: false,
                arrows: false,
                pagination: false,
            }}
            extensions={{ AutoScroll, Grid }}
        >
            {children}
        </Splide>
    );
};

const RoomsRow: FC<Props> = ({ onHasRooms }) => {
    const page = useRef<number>(0);
    const dispatch = useDispatch();
    const voData = useSelector(({ vod }: ReduxSelectors) => vod);
    const { handleVodRedirection } = useVodNavigation();

    const loadVods = useCallback(async () => {
        const { data } = await VodService.getAllVod(null);
        onHasRooms(!!data);
        return data;
    }, [onHasRooms]);

    useIonViewWillEnter(() => {
        page.current = 0;
        loadVods().then((vod) => dispatch(allVods(vod)));
    }, [loadVods, dispatch]);

    useEffect(() => {
        onHasRooms(!!voData.allVODs.length);
    }, [voData.allVODs, onHasRooms]);

    const handleSlideClick = useCallback((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const slideElement = target.closest('.splide__slide');

        console.log(target, slideElement)

        // if (slideElement) {
        //     const indexString = (slideElement as HTMLElement).dataset.index;
        //     if (indexString !== undefined) {
        //         const realIndex = parseInt(indexString, 10);
        //         if (!isNaN(realIndex) && voData.allVODs[realIndex]) {
        //             const clickedVod = voData.allVODs[realIndex];
        //             handleVodRedirection({
        //                 vodId: clickedVod.id,
        //                 vodStarsAmount: clickedVod.starsAmount ?? 0
        //             });
        //         }
        //     }
        // }
    }, [voData.allVODs, handleVodRedirection]);

    return (
        <IonRow>
            <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
                <IonRow className="rooms-row" id={VODS_ROW_ID}>
                    <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
                        <HeaderLink title={"home.vods"} link={Routes.Vods} />
                        {voData.allVODs.length === 0 && <NotingFound />}
                    </IonCol>
                    <IonCol
                        sizeXs="12"
                        sizeSm="12"
                        sizeMd="6"
                        sizeLg={'12'}
                        sizeXl={'12'}
                        hidden={!voData.allVODs.length}
                        className="live-rooms-col"
                    >
                        {voData.allVODs.length > 0 && (
                            <RoomSplider 
                                key={voData.allVODs.length}
                                count={voData.allVODs.length}
                                onSlideClick={handleSlideClick}>
                                {voData.allVODs?.filter(vod=>vod.url.trim().length>2).map((vod, index) => (
                                    <SplideSlide key={`${vod.id}_vod`} data-index={index}>
                                        <div>
                                            <VodRoom vod={vod} noRedirection={false} />
                                        </div>
                                    </SplideSlide>
                                ))}
                            </RoomSplider>
                        )}
                    </IonCol>
                </IonRow>
            </IonCol>
        </IonRow>
    );
};

export default RoomsRow;