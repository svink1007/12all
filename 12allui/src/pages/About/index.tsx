import React, {FC} from 'react';
import './styles.scss';
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonRow} from '@ionic/react';
import Layout from '../../components/Layout';
import Careers from '../Careers';
import {useTranslation} from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {RouteComponentProps} from 'react-router';
import AdSenseLeftCol from '../../components/AdSense/AdSenseLeftCol';
import AdSenseRightCol from '../../components/AdSense/AdSenseRightCol';

const About: FC<RouteComponentProps> = () => {
  const {t, i18n} = useTranslation();

  const renderPageText = () => {
    switch (i18n.language) {
      case 'ar':
        return (
          <>
            <p>
              مرحبًا بكم في (One Two All OOD (12all.tv) [١,٢ التلفزيون الشامل]، أول شركة مشاركة تلفزيونية اجتماعية
              حقيقية ، مما يسمح للمستخدمين بمشاركة تلفزيونهم مع مستخدمين آخرين حول العالم.
            </p>
            <p>
              هذه خطوة هائلة إلى الأمام في تجربة مشاهدة التلفزيون و الآن يمكنك رؤية وسماع أصدقائك بينما يشاهدون جميعًا
              قناتك التلفزيونية المفضلة / أو برنامجك المفضل معًا.
            </p>
            <p>
              عام 2020 كان هو عام وباء كورونا العظيم الذي سيبقى في اذهان الأجيال لفترة طويلة ، ولكنه أيضًا العام الذي
              غيرنا الطريقة التي نتواصل بها ، إلى الأبد.
            </p>
            <p>
              من خلال تلفزيون[١,٢ الشامل ] 12ALL Interactive TV ، يمكن للمستخدمين مشاركة قناتهم التلفزيونية من أي مكان
              في العالم ، مع الأصدقاء والعائلة والتواصل في الوقت الفعلي أثناء مشاهدتها.
            </p>
            <p>
              يمكنك أيضًا إنشاء قناة تلفزيونية خاصة بك مجانًا وبثها حول العالم. ويمكنك أن تصبح نجم العرض الخاص بك
              وامكانية كسب المال أثناء قيامك بذلك انضم إلينا اليوم في هذه المغامرة المثيرة
            </p>
            <p>واحصل على غرفة لنفسك</p>
          </>
        );
      case 'en':
      default:
        return (
          <>
            <p>
              Welcome to One Two All OOD (12all.tv) the first real together TV sharing company, allowing users to
              share their TV with other users around the world.
            </p>
            <p>
              This is a gigantic step forward in the TV watching experience and now you can see and hear your friends
              while everyone is watching your favorite TV channel/show together.
            </p>
            <p>
              2020 was the year of the great Pandemic that will be remembered for generations, but it was also the year
              that changed us and the way we communicate, forever.
            </p>
            <p>
              With 12ALL Interactive TV, users can share their TV channel from anywhere in the world, with
              friends and family and communicate in real time while watching it.
            </p>
            <p>
              You can also create your own TV channel FREE OF CHARGE and broadcast it around the world. You can
              become the star of your own show and even earn money while doing this!
            </p>
            <p>Join us today in this exciting adventure.</p>
            <p className="get-room">Get yourself a room!</p>
          </>
        );
    }
  };

  return (
    <Layout className="about-page">
      <PerfectScrollbar>
        <IonGrid>
          <IonRow>
            <AdSenseLeftCol/>

            <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="8" sizeXl="8">
              <IonCard className="about-card">
                <IonCardHeader>
                  <IonCardTitle>{t('about.header')}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="about-content">
                  {renderPageText()}
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{t('careers.header')}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="about-content">
                  <Careers/>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <AdSenseRightCol/>
          </IonRow>
        </IonGrid>
      </PerfectScrollbar>
    </Layout>
  );
};

export default About;
