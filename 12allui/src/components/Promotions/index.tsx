import React, {useEffect, useState} from 'react';
import './styles.scss';
import {IonImg, IonRouterLink} from '@ionic/react';
import {Promotion} from '../../shared/types';
import {getCompleteImageUrl} from '../../shared/helpers';
import {HomeService} from '../../services';

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    HomeService.getHomePage()
      .then(({data}) => {
        const p = data.promotions.map(
          (promotion: { link: string; image: { url: string } }) => {
            return {
              link: promotion.link,
              image: {url: getCompleteImageUrl(promotion.image.url)}
            };
          }
        );
        setPromotions(p);
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <div className="promotions-component">
      {promotions.map(
        (p: { link: string; image: { url: string } }, i: number) =>
          p.link.indexOf('http') !== 0 ? (
            <IonRouterLink routerLink={p.link} key={i}>
              <IonImg src={p.image.url}/>
            </IonRouterLink>
          ) : (
            <IonRouterLink href={p.link} target="_blank" key={i}>
              <IonImg src={p.image.url}/>
            </IonRouterLink>
          )
      )}
    </div>
  );
};

export default Promotions;
