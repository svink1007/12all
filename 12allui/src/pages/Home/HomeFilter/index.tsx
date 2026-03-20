import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonLabel, useIonRouter, useIonViewWillEnter} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import SelectLanguage from '../../../components/SelectLanguage';
import {useDispatch, useSelector} from 'react-redux';
import {setHomeFilter} from '../../../redux/actions/homeFilterActions';
import SelectCountry from '../../../components/SelectCountry';
import SelectGenre from '../../../components/SelectGenre';
import {ReduxSelectors} from '../../../redux/shared/types';
// import { useHistory } from 'react-router';
import {Routes} from '../../../shared/routes';
import SelectOwner from "../../../components/SelectOwner";
import {splitLabel} from "../../../shared/helpers";

type Props = {
    slot?: 'start' | 'end';
    // isHome?: boolean
};

const HomeFilter: FC<Props> = ({slot}: Props) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    // const history = useHistory();
    const router = useIonRouter();
    const {language, genre, country, owner, filterParams} = useSelector(({homeFilter}: ReduxSelectors) => homeFilter);
    const {currentStreamRoute} = useSelector(({stream}: ReduxSelectors) => stream)
    const isPushedToGenre = useRef(false);
    const [openLanguageModal, setOpenLanguageModal] = useState<boolean>(false);
    const [openGenreModal, setOpenGenreModal] = useState<boolean>(false);
    const [openOwnerModal, setOpenOwnerModal] = useState<boolean>(false);
    const [openCountryModal, setOpenCountryModal] = useState<boolean>(false);
    const [isRouteToGenre, setIsRouteToGenre] = useState<boolean>(false)

    useEffect(() => {
    }, [filterParams, owner]);

    const handleFilterChange = (value: { [language: string]: string | null }) => {
        dispatch(setHomeFilter(value));
    };

    useIonViewWillEnter(() => {
        if (currentStreamRoute === "FROM_HOME") {
            dispatch(setHomeFilter({genre: "", language: "", country: "", owner: ""}))
            setIsRouteToGenre(false)
            isPushedToGenre.current = false;
        }
    }, [])

    useEffect(() => {
        if (!["/channels"].includes(router.routeInfo.pathname)) {
            if (!(router.routeInfo.prevRouteLastPathname?.split("/")[1] === "stream")) {
                filterParams && router.push(`${Routes.Genre}?${filterParams}`);
            }
        }

    }, [country, genre, language, owner]);

    useEffect(() => {
        if ((language || genre || country || owner) && router.routeInfo.pathname === "/home") {
            setIsRouteToGenre(true)
        }
    }, [language, genre, country, owner, router])



    return (
        <>
            <IonButtons className="home-filter gap-3" slot={slot || ''}>
                <IonButton onClick={() => setOpenGenreModal(true)}>
                    <IonLabel>{t('home.genre')}{genre && ` (${genre})`}</IonLabel>
                </IonButton>

                <IonButton onClick={() => setOpenOwnerModal(true)}>
                    <IonLabel>{t('home.owner')}{owner && ` (${splitLabel(owner).label})`}</IonLabel>
                </IonButton>

                <IonButton onClick={() => setOpenLanguageModal(true)}>
                    <IonLabel>{t('home.language')}{language && ` (${language})`}</IonLabel>
                </IonButton>

                <IonButton onClick={() => setOpenCountryModal(true)}>
                    <IonLabel>{t('home.country')}{country && ` (${country})`}</IonLabel>
                </IonButton>
            </IonButtons>
            <SelectLanguage
                language={language}
                open={openLanguageModal}
                onSelect={(language) => handleFilterChange({language})}
                onClose={() => setOpenLanguageModal(false)}
            />
            <SelectGenre
                genre={genre}
                open={openGenreModal}
                onSelect={(genre) => handleFilterChange({genre})}
                onClose={() => setOpenGenreModal(false)}
            />
            <SelectOwner
                owner={owner}
                open={openOwnerModal}
                onSelect={(owner) => handleFilterChange({owner})}
                onClose={() => setOpenOwnerModal(false)}
            />
            <SelectCountry
                country={country}
                open={openCountryModal}
                onSelect={(country) => handleFilterChange({country})}
                onClose={() => setOpenCountryModal(false)}
            />
        </>
    );
};

export default HomeFilter;