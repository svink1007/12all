import React, {useEffect, useState} from "react";
import './styles.scss';
import {API_URL} from '../../../../shared/constants';

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonImg,
  IonRouterLink,
  IonRow,
  IonSpinner,
  IonToolbar,
  IonBackButton,
  IonButtons, IonCardSubtitle
} from "@ionic/react";
import "../../styles.scss";

import {getArticleUrl, parseArticleDate} from "../../../../shared/helpers";

import {ArticlesService} from '../../../../services';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {Routes} from '../../../../shared/routes';

type ArticlesListProps = {
  colSize: string;
};

const Articles: React.FC<ArticlesListProps> = ({colSize}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState(Array<any>());

  useEffect(() => {
    ArticlesService.getAll()
      .then(({data}) => {
        setArticles(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const articlesDom = (
    <IonRow className="articles">
      {
        articles.map(article => {
          let articleTitle = article.title;
          let articleContent = article.content;
          let key = `${article.id}articles`;
          let cardCss = 'ion-text-center articles-card';

          if (articleTitle.length > 30) {
            articleTitle = article.title.substring(0, 30) + "...";
          }

          if (articleContent.length > 100) {
            articleContent = article.content.substring(0, 100) + "...";
          }

          if (isLoading) {
            return <IonSpinner key={key} className="center-spinner" name="lines"/>;
          } else {
            return (
              <IonCol key={article.id} sizeMd={colSize} sizeXs="12">
                <IonCard className={cardCss} role="button">
                  <IonCardHeader className="articles-card-header">
                    <IonRouterLink routerLink={getArticleUrl(article.id)}>
                      <IonImg src={`${API_URL}${article.image.formats.thumbnail.url}`} className="articles-image"/>
                      <IonCardTitle>
                        {articleTitle}
                      </IonCardTitle>
                      <IonCardSubtitle>
                        {parseArticleDate(article.published_at)}
                      </IonCardSubtitle>
                    </IonRouterLink>
                  </IonCardHeader>
                  <IonCardContent text-wrap>
                    {articleContent}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            )
          }
        })
      }
    </IonRow>
  );

  return (
    <IonCard className="articles-list-card">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref={Routes.News}/>
        </IonButtons>
      </IonToolbar>
      <PerfectScrollbar>
        {articlesDom}
      </PerfectScrollbar>
    </IonCard>
  );
};

export default Articles;
