import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import './styles.scss';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonItemGroup,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { closeOutline, searchOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { SearchType } from '../../redux/shared/enums';
import { ReduxSelectors } from '../../redux/shared/types';
import { setSearch } from '../../redux/actions/searchActions';
import { useHistory } from 'react-router-dom';
import { Routes } from '../../shared/routes';

const HeaderSearchbar: FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { type } = useSelector(({ search }: ReduxSelectors) => search);
  const inputRef = useRef<HTMLIonInputElement | null>(null);
  const [toggleSearchbar, setToggleSearchbar] = useState<boolean>(false);

  const handleFind = useCallback((e: any) => {
    e.preventDefault()
    if (inputRef.current?.value !== null) {
      dispatch(setSearch({ query: inputRef?.current?.value as string }));
      history.location.pathname !== Routes.Search && history.push(Routes.Search);
    }
  }, [dispatch, history]);

  useEffect(() => {
    if(toggleSearchbar){
      inputRef.current?.setFocus()
    }
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      e.preventDefault()
      if (toggleSearchbar) {
        if (e.key === 'Enter' && inputRef.current?.value) {
          if (history?.location?.pathname === "/search") {
            handleFind(e);
          }
        }
      }
    });
  }, [handleFind, history, toggleSearchbar]);

  const handleTypeChange = (type: SearchType) => {
    dispatch(setSearch({ type }));
  };

  return (
    <IonItemGroup className="header-searchbar">
      <IonItem lines="none" className="category-item" hidden={!toggleSearchbar}>
        <IonSelect value={type} interface="popover" onIonChange={(e) => handleTypeChange(e.detail.value)}>
          <IonSelectOption value={SearchType.All}>{t('headerSearchbar.all')}</IonSelectOption>
          <IonSelectOption value={SearchType.Channel}>{t('headerSearchbar.channel')}</IonSelectOption>
          <IonSelectOption value={SearchType.Room}>{t('headerSearchbar.room')}</IonSelectOption>
          <IonSelectOption value={SearchType.Vod}>{t('headerSearchbar.vod')}</IonSelectOption>
          {/*<IonSelectOption value={HeaderSearchbarCategory.User}>{t('headerSearchbar.user')}</IonSelectOption>*/}
          {/*<IonSelectOption value={HeaderSearchbarCategory.Followers}>{t('headerSearchbar.followers')}</IonSelectOption>*/}
          {/*<IonSelectOption value={HeaderSearchbarCategory.Following}>{t('headerSearchbar.following')}</IonSelectOption>*/}
        </IonSelect>
      </IonItem>

      <IonItem lines="none" className="input-item" color="dark" hidden={!toggleSearchbar}>
        <IonInput
          ref={inputRef}
          placeholder={t('nav.search')}
          debounce={500}
          onIonChange={handleFind}
        />
        <IonButtons slot="end">
          <IonButton
            title={t('common.close')}
            onClick={(e) => {
              e.preventDefault()
              setToggleSearchbar(false)
              if (inputRef?.current?.value) {
                inputRef.current.value = null
              }
              history.push("/home")
            }}
          >
            <IonIcon icon={closeOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonItem>

      <IonItem lines="none" className="find" hidden={!toggleSearchbar} button onClick={handleFind}>
        <IonIcon icon={searchOutline} color="light" />
      </IonItem>

      <IonItem
        button
        lines="none"
        className="button-item"
        hidden={toggleSearchbar}
        onClick={() => setToggleSearchbar(true)}>
        <IonIcon icon={searchOutline} color="dark" />
      </IonItem>
    </IonItemGroup>
  );
};

export default HeaderSearchbar;
