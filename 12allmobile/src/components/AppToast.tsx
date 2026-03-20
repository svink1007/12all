import React, { useEffect, useRef, useState } from "react";
import { IonToast } from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors, Toast } from "../redux/types";
import { setResetToast } from "../redux/actions/toastActions";
import { useTranslation } from "react-i18next";
import { closeOutline } from "ionicons/icons";

const AppToast = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useSelector(({ toast }: ReduxSelectors) => toast);
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

  const handleToastDismiss = () => {
    if (openToast === null) {
      currentToast.current = null;
      dispatch(setResetToast());
    }
  };

  return (
    <IonToast
      isOpen={openToast === false ? false : toast.show}
      message={t(toast.i18nKey)}
      onDidDismiss={handleToastDismiss}
      color={toast.type}
      duration={toast.duration}
      buttons={[
        {
          side: "end",
          icon: closeOutline,
          role: "cancel",
          handler: handleToastDismiss,
        },
      ]}
    />
  );
};

export default AppToast;
