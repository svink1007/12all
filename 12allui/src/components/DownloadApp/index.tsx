import React, {FC} from 'react';
import './styles.scss';
import Layout from '../Layout';
import {IonButton, IonRouterLink, isPlatform} from '@ionic/react';
import {Trans, useTranslation} from 'react-i18next';
import {RouteComponentProps} from 'react-router';
import * as H from 'history';

export const DOWNLOAD_APP_V_PARAM = 'web';

export const showDownloadApp = ({search, pathname}: H.Location, route: string) => {
  const version = new URLSearchParams(search).get('v');
  return (isPlatform('android') || isPlatform('ios')) && version !== DOWNLOAD_APP_V_PARAM && pathname.startsWith(route);
};

const DownloadApp: FC<RouteComponentProps> = ({location: {pathname}}: RouteComponentProps) => {
  const {t} = useTranslation();

  return (
    <Layout>
      <div className="download-app-component">
        <h1>{t('downloadApp.header')}</h1>
        {
          isPlatform('android') &&
          <>
            <IonButton href="https://play.google.com/store/apps/details?id=tv.m12all" target="_blank">
              {t('downloadApp.googlePlay')}
            </IonButton>
            <div className="app-already-installed">
              <Trans i18nKey="downloadApp.alreadyInstalled">
                Already installed 12all? <IonRouterLink href="https://12all.tv">Launch meeting</IonRouterLink>
              </Trans>
            </div>
          </>
        }

        {
          isPlatform('ios') &&
          <>
            <IonButton href="https://apps.apple.com/app/one2all/id1614237068" target="_blank">
              {t('downloadApp.appStore')}
            </IonButton>
            <div className="app-already-installed">
              <Trans i18nKey="downloadApp.alreadyInstalled">
                Already installed 12all? <IonRouterLink href="capacitor://">Launch meeting</IonRouterLink>
              </Trans>
            </div>
          </>
        }

        <div className="continue-using-web">
          <Trans i18nKey="downloadApp.continueUsingWebVersion">
            or <IonRouterLink routerLink={`${pathname}?v=${DOWNLOAD_APP_V_PARAM}`} routerDirection="back">
            continue using web version</IonRouterLink>
          </Trans>
        </div>
      </div>
    </Layout>
  );
};

export default DownloadApp;
