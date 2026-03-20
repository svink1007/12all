import React, {FC, ReactNode} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonIcon, IonTitle, IonToolbar, useIonRouter} from '@ionic/react';
import HomeFilter from '../../pages/Home/HomeFilter';
import {Routes} from '../../shared/routes';
import {arrowBack} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setHomeFilter } from '../../redux/actions/homeFilterActions';

type Props = {
  title: string;
  addition?: ReactNode;
};

const FilterToolbar: FC<Props> = ({title, addition}: Props) => {
  const {t} = useTranslation();
  const router = useIonRouter()
  const dispatch = useDispatch()

  const handleIonRouter = () => {
    dispatch(setHomeFilter({genre: "", country: "", language: "", filterParams: ""}))
    router.push(Routes.Home, 'back', 'push')
    // setTimeout(() => {
    // }, 500);
  }

  // useEffect(() => {
  //   return () => { dispatch(setHomeFilter({ genre: "", country: "", language: "" })) }
  // }, [dispatch])

  return (
    <IonToolbar color="light" className="filter-toolbar py-2">
      <IonButtons slot="start">
        <IonButton onClick={handleIonRouter}>
          <IonIcon icon={arrowBack} slot="icon-only"/>
        </IonButton>
      </IonButtons>
      <IonTitle>{t(title)}</IonTitle>
      {addition}
      <HomeFilter slot="end"/>
    </IonToolbar>
  );
};

export default FilterToolbar;

