import React, {FC, MouseEvent, useEffect, useState} from 'react';
import './styles.scss';
import {IonAvatar, IonButton, IonButtons, IonIcon, IonItem, IonLabel} from '@ionic/react';
import {apertureOutline, closeCircleOutline} from 'ionicons/icons';
import ParseLogo from '../ParseLogo';
import {useTranslation} from 'react-i18next';

type Props = {
  logo?: string | null;
  logoText?: string;
  selectLogoText?: string;
  removeLogoText?: string;
  onLogoSelected: (logo: File | null) => void;
};

const SelectLogo: FC<Props> = ({
                                 logo,
                                 logoText,
                                 selectLogoText,
                                 removeLogoText,
                                 onLogoSelected
                               }: Props) => {
  const {t} = useTranslation();
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);

  useEffect(() => {
    setCurrentLogo(logo || null);
  }, [logo]);

  const handleLogoSelected = (logo: File) => {
    setCurrentLogo(URL.createObjectURL(logo));
    setShowLogoModal(false);
    onLogoSelected(logo);
  };

  const handleRemoveLogo = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentLogo(null);
    onLogoSelected(null);
  };

  const handleShowLogoModal = () => {
    setShowLogoModal(true);
  };

  return (
    <>
      <IonItem
        button
        onClick={handleShowLogoModal}
        className="select-logo-component"
      >
        {!currentLogo ? (
          <>
            <IonIcon
              icon={apertureOutline}
              color="dark"
              className="default-icon-avatar"
            />
            <IonLabel>
              {t(selectLogoText ? selectLogoText : 'selectLogo.selectLogo')}
            </IonLabel>

          </>
        ) : (
          <>
            <IonAvatar>
              <img src={currentLogo} alt=""/>
            </IonAvatar>
            <IonLabel>{t(logoText ? logoText : 'selectLogo.logo')}</IonLabel>
            <IonButtons slot="end">
              <IonButton
                onClick={handleRemoveLogo}
                title={t(
                  removeLogoText ? removeLogoText : 'selectLogo.removeLogo'
                )}
              >
                <IonIcon slot="icon-only" icon={closeCircleOutline}/>
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonItem>

      <ParseLogo
        logo={logo}
        show={showLogoModal}
        setShow={setShowLogoModal}
        onSelect={handleLogoSelected}
      />
    </>
  );
};

export default SelectLogo;
