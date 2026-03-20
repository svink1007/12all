import React, {FC, useEffect, useRef} from 'react';
import {IonApp, setupIonicReact} from '@ionic/react';
import './app.scss';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Swiper styles */
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/grid';

/* Splide styles */
import '@splidejs/react-splide/css';

import {useDispatch} from 'react-redux';
import Waves from './components/Waves';
import Router from './components/Router';
import AppToast from './components/AppToast';
import {allowAds} from './redux/actions/adSenseActions';
import {AD_SENSE_URL, FACEBOOK_APP_ID} from './shared/constants';
import {ConfigService} from './services';
import {setWebConfig} from './redux/actions/webConfigActions';
import {setNetworkConfig} from './redux/actions/networkConfigActions';
import NetworkService from './services/NetworkService';
import VertoVariables from './verto/VertoVariables';
import { FacebookProvider } from 'react-facebook';

import './app.scss';

// Must import and call setupIonicReact even if not setting custom config
setupIonicReact();

const App: FC = () => {
  const dispatch = useDispatch();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.crossOrigin = 'anonymous';
    script.src = AD_SENSE_URL;
    script.onload = () => {
      let hasAdBlocker = false;
      if (adRef.current) {
        hasAdBlocker = adRef.current.hasChildNodes();
      }

      !hasAdBlocker && dispatch(allowAds());
    };
    document.head.appendChild(script);

    ConfigService.getWebConfig().then(({data}) => {
      dispatch(setWebConfig(data));
      VertoVariables.sdpVideoCodecRegex = data.sdpVideoCodecRegex;
    });
    NetworkService.getNetworkConfig().then(({data}) => dispatch(setNetworkConfig(data)));
  }, [dispatch]);

  useEffect(() => {
    // Add the gtag script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-6W8L8CTPQ3';
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag config after script is added
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6W8L8CTPQ3');
    `;
    document.head.appendChild(inlineScript);
  }, []);

  return (
    <IonApp>
      <FacebookProvider appId={FACEBOOK_APP_ID}>
        {/*Dummy div to check if there is an adblock*/}
        <div ref={adRef} className="adsbygoogle" hidden/>
        <Waves/>
        <Router/>
        <AppToast/>
      </FacebookProvider>
    </IonApp>
  );
};

export default App;
