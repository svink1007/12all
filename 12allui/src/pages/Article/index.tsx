import React, {FC, useEffect, useState} from "react";
import Layout from "../../components/Layout";
import {useParams} from "react-router";
import {API_URL} from '../../shared/constants';
import "./styles.scss";

import {ArticlesService} from '../../services';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonImg,
  IonRow,
  IonToolbar
} from "@ionic/react";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {Routes} from '../../shared/routes';
import {parseArticleDate} from '../../shared/helpers';

type ArticleProps = {
  id: number;
  title: string;
  content: string;
  image: {
    url: string
  },
  published_at: string;
};

const Article: FC<ArticleProps> = () => {
  const {id} = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleProps>();
  const [articleText, setText] = useState<string>('');

  useEffect(() => {
    ArticlesService.getArticle(id)
      .then(({data}) => {
        let dbArticle = data[0];

        setArticle(data[0]);

        const findLink = (text: string) => {
          let urlRegex = /(https?:\/\/[^\s]+)/g;
          return text.replace(urlRegex, function (url: string) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
          })
        };

        setText(findLink(dbArticle.content));
      })
  }, [id]);

  return (
    <Layout className="article-page">
      <IonGrid>
        <IonCard>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={Routes.News}/>
            </IonButtons>
          </IonToolbar>

          <PerfectScrollbar>
            <IonCardContent>

              <IonRow>
                <IonCol className="article-image" sizeMd="3">
                  <IonImg
                    src={`${API_URL}${article?.image?.url}`}
                    className="articles-image"/>
                </IonCol>
                <IonCol className="article" sizeMd="9">
                  <IonCardHeader>
                    <IonCardTitle>
                      {article?.title}
                    </IonCardTitle>
                    <IonCardSubtitle>
                      {article?.published_at && parseArticleDate(article.published_at)}
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="article-content" dangerouslySetInnerHTML={{__html: `${articleText}`}}/>
                  </IonCardContent>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </PerfectScrollbar>
        </IonCard>
      </IonGrid>
    </Layout>
  );
};

export default Article;
