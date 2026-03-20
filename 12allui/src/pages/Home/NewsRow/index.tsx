import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../shared/constants';
import './styles.scss';
import '../../News/styles.scss';
import { IonCol, IonModal, IonRow } from '@ionic/react';
// import {getArticleUrl} from '../../../shared/helpers';
import { SwiperSlide } from 'swiper/react';
import SwiperPaginated from '../../../components/SwiperPaginated';
import { ArticlesService } from '../../../services';
import { AdSenseFormat, AdSenseSlot } from '../../../components/AdSense';
import { useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import AdSenseCard from '../../../components/AdSense/AdSenseCard';
// import { close } from 'ionicons/icons';
import NewsModal from '../../../components/NewsModal';

type Article = {
  id: number;
  image: {
    formats?: {
      small?: {
        url: string;
      }
    };
    url: string;
  },
  title: string;
  content: string;
};

const NewsRow: React.FC = () => {
  const { allowAds } = useSelector(({ adSense }: ReduxSelectors) => adSense);
  const [articles, setArticles] = useState<Article[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [contentDataArr, setContentDataArr] = useState<Array<string>>([])

  useEffect(() => {
    ArticlesService.getAllLimit(5).then(({ data }) => setArticles(data));
  }, []);

  const renderArticle = (article: Article) => {
    let articleContent = article.content;
    // if (articleContent.length > 300) {
    //   articleContent = article.content.substring(0, 400) + "...";
    // }

    return (
      <SwiperSlide key={article.id}>
        {/* <IonRouterLink href={getArticleUrl(article.id)} target="_blank"> */}
        {/*use img instead of ion-img to prevent lazy load*/}
        <article className="article" onClick={() => showPopUp(article)}>
          <div>
            <img height={240} src={`${API_URL}${article.image.url}`} alt="" />

            <section className="article-content">
              <h1>{article.title}</h1>
              <p>{articleContent}</p>
            </section>
          </div>
        </article>
        {/* </IonRouterLink> */}
      </SwiperSlide>
    );
  };

  const showPopUp = (contentData: Article) => {
    let image = API_URL + contentData.image.url
    if (contentData) {
      setOpenModal(true)
      setContentDataArr([contentData.title, contentData.content, image])
    }
  }

  return (
    <>
      <IonModal
        isOpen={openModal}
        onDidDismiss={() => setOpenModal(false)}
        className='ion-news-modal'
      >
        <NewsModal content={contentDataArr} setOpenModal={setOpenModal} />
      </IonModal>
      <IonRow className="news-row">
        {
          allowAds &&
          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2" className="ad">
            <AdSenseCard slot={AdSenseSlot.Left} format={AdSenseFormat.Rectangle} />
          </IonCol>
        }

        <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg={allowAds ? '8' : '12'} sizeXl={allowAds ? '8' : '12'}>
          <SwiperPaginated>
            {articles.map(renderArticle)}
          </SwiperPaginated>
        </IonCol>

        {
          allowAds &&
          <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2" className="ad">
            <AdSenseCard slot={AdSenseSlot.Right} format={AdSenseFormat.Rectangle} />
          </IonCol>
        }
      </IonRow>
    </>
  );
};

export default NewsRow;


