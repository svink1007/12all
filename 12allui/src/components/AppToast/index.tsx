import React, {FC, useEffect, useRef, useState} from 'react';
import {IonToast} from '@ionic/react';
import {setResetToast} from '../../redux/actions/toastActions';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors, Toast} from '../../redux/shared/types';
import {ToastTextFormat} from '../../redux/shared/enums';
import {useTranslation} from 'react-i18next';
import {closeOutline} from 'ionicons/icons';

const AppToast: FC = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const toast = useSelector(({toast}: ReduxSelectors) => toast);
  const toastRef = useRef<HTMLIonToastElement>(null);
  const currentToast = useRef<Toast | null>(null);
  const [openToast, setOpenToast] = useState<false | null>(null);

  useEffect(() => {
    if (currentToast.current) {
      setOpenToast(false);

      setTimeout(() => {
        setOpenToast(null);
      }, 500);
    }

    if (toast.show) {
      currentToast.current = toast;
    }
  }, [toast]);

  const handlePresent = () => {
    const bigBottomAd = document.querySelector('[data-anchor-status=\'displayed\']');
    if (bigBottomAd) {
      // Wait until default style changes are applied and add the new one
      setTimeout(() => {
        const wrapper = toastRef.current?.shadowRoot?.querySelector('.toast-wrapper') as HTMLDivElement;
        if (wrapper) {
          wrapper.style.bottom = '132px';
        }
      });
    }
  };

  const handleDismiss = () => {
    if (openToast === null) {
      currentToast.current = null;
      dispatch(setResetToast());
    }
  };

  return (
    <IonToast
      ref={toastRef}
      isOpen={openToast === false ? false : toast.show}
      message={toast.textFormat === ToastTextFormat.i18 ? t(toast.text) : toast.text}
      color={toast.type}
      duration={toast.duration}
      buttons={[
        {
          side: 'end',
          icon: closeOutline,
          role: 'cancel',
          handler: handleDismiss
        }
      ]}
      onWillPresent={handlePresent}
      onDidDismiss={handleDismiss}
    />
  );
};

export default AppToast;
