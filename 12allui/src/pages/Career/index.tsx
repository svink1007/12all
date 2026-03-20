import React, { FC, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useParams } from "react-router";
import "./styles.scss";

import { CareersService } from '../../services';
import {
    IonGrid,
    IonRow,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCol,
    IonBackButton,
    IonButton
} from "@ionic/react";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';

type CareerProps = {
    id: number;
    title: string;
    description: string;
    location: string;
    descriptionArray: Array<any>
};

const Career: FC<CareerProps> = () => {
    const { id } = useParams<{id: string}>();
    const { t } = useTranslation();

    const [career, setCareer] = useState<Partial<CareerProps>>({});

    useEffect(() => {
      CareersService.getCareer(id)
        .then(({ data }) => {
          data[0].descriptionArray = data[0].description.split("\n");
          setCareer(data[0]);
        });
    }, [id]);

    return (
        <Layout>

            <IonGrid className="">
                <IonCard className="">
                    <PerfectScrollbar style={{ height: '420px' }}>
                        <IonCardHeader className="">
                            <IonRow>
                                <IonCol sizeMd="2">
                                    <IonBackButton style={{ width: '50px' }} defaultHref="/about" />
                                </IonCol>
                                <IonCol sizeMd="10">
                                    <h1 style={{ color: '#fff' }}>{career.title}</h1>
                                </IonCol>
                            </IonRow>
                        </IonCardHeader>

                        <IonCardContent>
                            <IonRow>
                                <IonCol sizeMd="2">
                                </IonCol>
                                <IonCol sizeMd="10">
                                    {
                                        career.descriptionArray?.map((x, i) => {
                                            return (
                                                <div key={i} className="career-content">{x}</div>
                                            )
                                        })
                                    }
                                    <IonButton onClick={() => console.log('apply now')}>
                                        {t('careers.applyButton')}
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonCardContent>
                    </PerfectScrollbar>
                </IonCard>
            </IonGrid>
        </Layout>
    );
};

export default Career;
