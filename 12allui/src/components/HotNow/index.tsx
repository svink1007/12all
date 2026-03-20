import React, {useRef, useState} from 'react';
import './styles.scss';
import {useTranslation} from 'react-i18next';

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonRouterLink,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import {Channel} from '../../shared/types';
import SwiperPaginated from '../SwiperPaginated';
import {SwiperSlide} from 'swiper/react';
import {getChannelUrlSuffix} from '../../shared/helpers';
import logo from '../../images/12all-logo-128.png';
import {HomeService} from '../../services';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';

type HotNowChannel = {
  id: number;
  link: string;
  name: string;
  preview: string | null;
  logo: string;
};

const parseChannels = (channels: Channel[], maxHotItems: number) => {
  return channels.map(channel => ({
    id: channel.id,
    link: getChannelUrlSuffix(channel),
    name: channel.name,
    preview: `${channel.https_preview_high}?hash=${Date.now()}`,
    logo: channel.logo || logo
  })).slice(0, maxHotItems);
};

const HotNow: React.FC = () => {
  const {t} = useTranslation();
  const getHomePageDataInterval = useRef<NodeJS.Timeout | null>(null);
  const {maxHotItems} = useSelector(({webConfig}: ReduxSelectors) => webConfig);
  const [channels, setChannels] = useState<HotNowChannel[]>([]);

  useIonViewWillEnter(() => {
    const getHomePageData = () => {
      HomeService.getHomePage()
        .then(({data: {channels}}) => {
          const parsedChannels = parseChannels(channels.map(vlr => vlr.channel), maxHotItems);
          setChannels(parsedChannels);
        })
        .catch(err => console.error(err));
    };
    getHomePageData();
    getHomePageDataInterval.current = setInterval(() => getHomePageData(), 15000);
  }, []);

  useIonViewWillLeave(() => {
    getHomePageDataInterval.current && clearInterval(getHomePageDataInterval.current);
  }, []);

  const handleImgError = (sharedChannel: HotNowChannel) => {
    setChannels(channels.map((channel) => {
      return channel.id !== sharedChannel.id
        ? channel
        : {
          ...channel,
          preview: null
        };
    }));
  };

  return (
    <>
      <IonCard className="hot-now-card">
        <IonCardHeader>
          <IonCardTitle>{t('home.hotNow')}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <SwiperPaginated>
            {
              channels.map(channel => (
                <SwiperSlide key={channel.id}>
                  <IonRouterLink routerLink={channel.link}>
                    <img
                      src={channel.preview || channel.logo}
                      onError={() => handleImgError(channel)}
                      alt=""
                    />

                    <IonCardTitle>{channel.name}</IonCardTitle>
                  </IonRouterLink>
                </SwiperSlide>
              ))
            }
          </SwiperPaginated>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default HotNow;
