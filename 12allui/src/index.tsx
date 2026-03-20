import React, {Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
// import * as serviceWorker from './serviceWorker';
import './i18n';
import {Provider} from 'react-redux';
import store from './redux/store';
import 'webrtc-adapter';
import {IonSpinner} from '@ionic/react';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Suspense fallback={<IonSpinner/>}>
    <Provider store={store}>
      <App/>
    </Provider>
  </Suspense>
);

// Call the element loader after the app has been rendered the first time
defineCustomElements(window);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
