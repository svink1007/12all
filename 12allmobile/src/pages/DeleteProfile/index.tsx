import { IonImg, IonPage } from "@ionic/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { Routes } from "../../shared/routes";
import { BillingServices } from "../../services/BillingServices";
import { ReduxSelectors } from "../../redux/types";

import "./styles.scss";
import Close from "../../images/settings/close.svg";
import { UserManagementService } from "../../services";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { resetProfile } from "../../redux/actions/profileActions";
import { setSidebarClose } from "../../redux/actions/sidebarActions";
import { setErrorToast } from "../../redux/actions/toastActions";
import SafeAreaView from "../../components/SafeAreaView";
import { clearSkipLoginData } from "../../utils/skipLoginUtils";

const DeleteProfile = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { id, jwtToken } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async function () {
      const data = await BillingServices.billingStarBalance(id);
      if (data.data.status === "ok" && data.data.starsBalance > 0) {
        setBalance(data.data.starsBalance);
      }
    })();
  }, []);

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  const onNoClick = () => {
    history.push(Routes.Broadcasts);
  };

  const onYesClick = async () => {
    try {
      await UserManagementService.removeProfile();
      await appStorage.removeItem(StorageKey.Login);
      await clearSkipLoginData(); // Explicitly clear skip login data
      dispatch(resetProfile());
      dispatch(setSidebarClose());
      setTimeout(() => history.push(Routes.Broadcasts));
    } catch (error) {
      dispatch(setErrorToast("deleteProfile.errorMsg"));
    }
  };

  return (
    <IonPage>
      <SafeAreaView>
        <div className="delete-profile-container">
          <div className="delete-profile-header">
            <IonImg
              src={Close}
              className="delete-profile-close"
              onClick={onCloseClick}
            />
            <div className="delete-profile-header-title">
              <p>{t("deleteProfile.deleteAccount")}</p>
              <p className="transactions-header-meeting-link"></p>
            </div>
          </div>
          <div className="delete-profile-body">
            <p className="delete-profile-body-text">
              {t("deleteProfile.bodyText")}
            </p>
            <div className="delete-profile-button-group">
              <button className="delete-profile-button" onClick={onYesClick}>
                Yes
              </button>
              <button className="delete-profile-button" onClick={onNoClick}>
                No
              </button>
            </div>
          </div>
        </div>
      </SafeAreaView>
    </IonPage>
  );
};

export default DeleteProfile;
