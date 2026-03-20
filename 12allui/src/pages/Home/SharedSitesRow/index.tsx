import React, {FC, useEffect, useState} from 'react';
import {IonCol, IonImg, IonItem, IonRow} from '@ionic/react';
import HeaderToolbar from '../HeaderToolbar';
import {SharedSitesService} from '../../../services';
import {SharedSiteResponse} from '../../../shared/types';
import HomeSwiper from '../HomeSwiper';
import {API_URL} from '../../../shared/constants';
import {useDispatch} from 'react-redux';
import setSharedSiteData from '../../../redux/actions/sharedSiteActions';
import {Routes} from '../../../shared/routes';
import {SwiperSlide} from 'swiper/react';

export const SHARED_SITES_ROW_ID = 'shared-sites-row-id';

const SharedSitesRow: FC = () => {
  const dispatch = useDispatch();
  const [sites, setSites] = useState<SharedSiteResponse[]>([]);

  useEffect(() => {
    SharedSitesService.getSharedSites().then(({data}) => setSites(data));
  }, []);

  return (
    <IonRow id={SHARED_SITES_ROW_ID}>
      <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="12" sizeXl="12">
        <HeaderToolbar title="home.sharedSites"/>
        <HomeSwiper>
          {
            sites.map(({id, url, name, logo, logo_image}: SharedSiteResponse) => (
              <SwiperSlide key={id}>
                <IonItem
                  lines="none"
                  detail={false}
                  color="light"
                  routerLink={Routes.SharedSites}
                  onClick={() => dispatch(setSharedSiteData({url, name}))}
                >
                  <IonImg src={logo_image ? `${API_URL}${logo_image.url}` : logo}/>
                </IonItem>
              </SwiperSlide>
            ))
          }
        </HomeSwiper>
      </IonCol>
    </IonRow>
  );
};

export default SharedSitesRow;
