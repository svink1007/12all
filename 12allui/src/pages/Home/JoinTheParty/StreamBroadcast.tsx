import React from 'react';

import {IonImg, IonItem, IonRouterLink, IonText} from '@ionic/react';

import logo from '../../../images/12all-logo-128.png';

// import ChannelActions from './ChannelActions';
import {Channel} from '../../../shared/types';
import {useDispatch} from 'react-redux';
import {onChannelPreviewError, onChannelPreviewLoaded} from '../../../redux/actions/channelActions';
import {Routes} from '../../../shared/routes';


type Props = {
  channel: Channel;
};

const StreamBroadcast: React.FC<Props> = ({channel}: Props) => {
  const dispatch = useDispatch();

  return (
    <IonItem
      button
      lines="none"
      className="channel"
      detail={false}
    >
      <IonRouterLink
        routerLink={`${Routes.Stream}/${channel.stream_id}/${channel.channel_deep_link}`}
        className="channel-logo-wrapper"
      >
        <IonImg
          src={!channel.is_adult_content && channel.logo ? channel.logo : logo}
          className={channel.preview_loaded ? 'channel-logo' : 'channel-img-12all'}
        />

        {
          channel.https_preview_high &&
          <IonImg
            src={channel.https_preview_high}
            className={`channel-preview ${channel.preview_loaded ? 'preview_loaded' : ''}`}
            onIonImgDidLoad={() => dispatch(onChannelPreviewLoaded(channel.id))}
            onIonError={() => dispatch(onChannelPreviewError(channel.id))}
          />
        }

        <IonText className="channel-name" color="dark">{channel.name}</IonText>
      </IonRouterLink>
      {/* <ChannelActions channel={channel}/> */}
    </IonItem>
  );
};

export default StreamBroadcast;
