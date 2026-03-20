import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonImg,
  IonList,
  IonRouterLink,
  IonRow
} from '@ionic/react';
import Layout from '../../components/Layout';
import {DownloadsResponse} from './types';
import {DownloadsService} from '../../services';
import {AdSenseFormat, AdSenseSlot} from '../../components/AdSense';
import AdSenseLeftCol from '../../components/AdSense/AdSenseLeftCol';
import AdSenseRightCol from '../../components/AdSense/AdSenseRightCol';
import AdSenseCard from '../../components/AdSense/AdSenseCard';
import {API_URL} from '../../shared/constants';
import {useTranslation} from 'react-i18next';
import mobile from '../../images/downloads-phone.png';

const DownloadsPage: FC = () => {
  const {t} = useTranslation();
  const [downloads, setDownloads] = useState<DownloadsResponse[]>([]);

  useEffect(() => {
    DownloadsService.getDownloads()
      .then(({data}) => setDownloads(data))
      .catch(err => console.error('Error while fetching downloads', err));
  }, []);

  return (
    <Layout className="downloads-page">
      <IonGrid>
        <IonRow>
          <AdSenseLeftCol/>

          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="8" sizeXl="8">
            <IonCard className="download-card" color="primary">
              <IonCardHeader>
                <div>
                  <IonCardTitle>
                    {t('downloads.title')}
                  </IonCardTitle>
                  <IonCardSubtitle>
                    {t('downloads.subtitle')}
                  </IonCardSubtitle>
                </div>

                <IonList className="store-holder">
                  {
                    downloads.map(({id, link, store}) => (
                      <IonRouterLink href={link} target="_blank" key={id}>
                        <IonImg src={`${API_URL}${store.logo.url}`}/>
                      </IonRouterLink>
                    ))
                  }
                </IonList>
              </IonCardHeader>
              <IonCardContent>
                <div>
                  <IonImg src={mobile} className="mobile"/>
                </div>
              </IonCardContent>
            </IonCard>

            <div className="ad-down">
              <AdSenseCard slot={AdSenseSlot.Down} format={AdSenseFormat.Horizontal}/>
            </div>
          </IonCol>

          <AdSenseRightCol/>
        </IonRow>
      </IonGrid>
    </Layout>
  );
};

export default DownloadsPage;
