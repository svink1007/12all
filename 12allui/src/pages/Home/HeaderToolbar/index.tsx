import React, { FC, useEffect, useState } from 'react';
import './styles.scss';
import { IonChip, IonIcon, IonLabel, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { close } from 'ionicons/icons';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../redux/shared/types';
import { setHomeFilter } from '../../../redux/actions/homeFilterActions';
import {splitLabel} from "../../../shared/helpers";

type Props = {
  title: string;
  isGenreChannel?: boolean;
}

const HeaderToolbar: FC<Props> = ({ title, isGenreChannel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const { filterParams } = useSelector(({ homeFilter }: ReduxSelectors) => homeFilter);
  const [filterChip, setFilterChip] = useState<Array<string>>([])
  
  const parseFilterChipClose = (chip: string, index: number) => {
    const key = chip.split("=")[0] === "country_of_origin" ? "country" : chip.split("=")[0]
    const value = chip.split("=")[1]

    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, "", url.pathname + url.search);

    if (key && value) {
      setFilterChip((currState) => {
        return currState.filter((item, idx) => idx !== index);
      })
      dispatch(setHomeFilter({ [key]: "" }));
    }
  }

  useEffect(() => {
    if (filterParams.length > 0 ) {
      setFilterChip(filterParams.split("&").filter((param) => param !== "")); 
      if(title === "home.vod") {   //if it's vod we display only the vod filter
        const ownerParam = filterParams.split('&').find(param => param.startsWith('owner='));
        ownerParam && setFilterChip([ownerParam]);
      } else{
        setFilterChip(filterParams.split("&"))
      }
    }
  }, [filterParams, title])

  return (
    <IonToolbar className="home-header-toolbar">
      <div className="home-header-with-chip">
        <IonTitle>{t(title)}</IonTitle>
        {isGenreChannel && filterChip && filterChip.map((chip: string, index: number) => {
          return (
            <IonChip key={index}>
              <IonLabel>{splitLabel(chip?.split("=")[1]).label}</IonLabel>
              <IonIcon icon={close} onClick={() => parseFilterChipClose(filterChip[index], index)}></IonIcon>
            </IonChip>
          )
        })
        }
      </div>
    </IonToolbar>
  );
};

export default HeaderToolbar;
