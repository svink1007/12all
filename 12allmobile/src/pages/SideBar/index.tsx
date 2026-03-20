import { useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { useSelector } from "react-redux";
import { IonIcon, IonImg, IonRouterLink } from "@ionic/react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  settingsOutline,
  shirtOutline,
  shareSocialOutline,
  exitOutline,
} from "ionicons/icons";

import { ReduxSelectors } from "../../redux/types";
import { Routes } from "../../shared/routes";
import logo from "../../images/12all-logo-168.svg";
import defaultAvatar from "../../images/default-avatar.png";
import Star from "../../images/sidebar/star.svg";
import Premium from "../../images/sidebar/premium.svg";
import Login from "../../images/sidebar/login.svg";
import Logout from "../../images/sidebar/logout.svg";
import "./styles.scss";
import { logoutUser, setProfile } from "../../redux/actions/profileActions";
import BaseService from "../../services/BaseService";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { setSidebarClose } from "../../redux/actions/sidebarActions";
import { appVersion } from "../../shared/variables";
import { BillingServices } from "../../services/BillingServices";
import { setErrorToast } from "../../redux/actions/toastActions";
import setPrevRoute from "../../redux/actions/routeActions";
import { UserManagementService } from "../../services";

interface ISidebarProps {
  onClose: () => void;
}

const SideBar = (props: ISidebarProps) => {
  const { t } = useTranslation();
  const { id, avatar, nickname, jwtToken, isAnonymous } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  // const { starsBalance } = useSelector(
  //   ({ billingRewards }: ReduxSelectors) => billingRewards
  // );

  console.log("SIDEBAR:", isAnonymous);

  const { isOpen } = useSelector(({ sidebar }: ReduxSelectors) => sidebar);
  const [isStarsBarOpen, setIsStarsBarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const dispatch = useDispatch();

  const [starsBalance, setStarsBalance] = useState(0);

  const closeSidebar = () => {
    props.onClose();
  };

  useEffect(() => {
    (async function () {
      try {
        if (jwtToken && !isAnonymous && !BaseService.isExpired(jwtToken)) {
          let starValue = await BillingServices.billingStarBalance(id);
          setStarsBalance(starValue.data.starsBalance);
          UserManagementService.getUserData().then(({ data }) => {
            if (data.status === "ok") {
              const {
                result: {
                  avatar,
                  nickname,
                  country_of_residence,
                  preferred_language,
                  gender,
                  preferred_genre,
                  premium_status,
                  has_confirmed_is_over_eighteen,
                  show_debug_info,
                  has_confirmed_phone_number,
                  id,
                  username,
                  email,
                },
              } = data;

              // if (!has_confirmed_phone_number) {
              //   appStorage.removeItem(StorageKey.Login).then();
              //   BaseService.clearAuth();
              //   dispatch(resetProfile());
              //   return;
              // }

              dispatch(
                setProfile({
                  id,
                  avatar: avatar,
                  nickname: nickname || username,
                  countryOfResidence: country_of_residence,
                  preferredLanguage: preferred_language,
                  gender,
                  preferredGenre: preferred_genre,
                  premium: premium_status,
                  isOverEighteen: has_confirmed_is_over_eighteen,
                  showDebugInfo: show_debug_info || false,
                  isAnonymous: !email
                    ? false
                    : email.includes("@skiplogin.com")
                      ? true
                      : false,
                })
              );
            }
          });
        }
      } catch {
        dispatch(
          setErrorToast("An error occured while fetching the star balance")
        );
      }
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current === event.target) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const navigateToPages = (url: string) => {
    history.push(url);
  };

  const redirectToProfilePage = () => {
    if (jwtToken) {
      history.push(Routes.Profile);
    } else {
      history.push(Routes.Login);
    }
  };

  const onLogoClick = () => {
    setIsStarsBarOpen(false);
    history.push(Routes.About);
  };

  const onExitClick = () => {
    App.exitApp();
  };

  const onLogoutClick = async () => {
    await appStorage.removeItem(StorageKey.Login);
    dispatch(logoutUser());
    dispatch(setSidebarClose());
    dispatch(setPrevRoute(""));
    setIsStarsBarOpen(false);
    history.push(Routes.Login);
  };

  const onLoginClick = () => {
    dispatch(setSidebarClose());
    setIsStarsBarOpen(false);
    history.push(Routes.Login);
  };
  const onStarsBarHandle = () => {
    setIsStarsBarOpen(!isStarsBarOpen);
  };

  const isAuthenticated = () => {
    return jwtToken && !BaseService.isExpired(jwtToken) && !isAnonymous;
  };

  const onTopUpClick = () => {
    history.push(Routes.ProtectedTopUp);
  };

  const onCashOutClick = () => {
    history.push(Routes.ProtectedCashOut);
  };

  const onStarsStatusClick = () => {
    history.push(Routes.ProtectedStarsTransactions);
  };

  const onInviteAndWinClick = () => {
    history.push(Routes.ProtectedInviteAndWin);
  };

  const sidebarClass = isOpen ? "sidebar" : "sidebar closed";

  return (
    <>
      <div className={sidebarClass} ref={sidebarRef}>
        <div className="sidebar-container">
          <div className="top-icons-container">
            <div className="logo-container">
              <IonImg
                src={logo}
                className="logo"
                alt="logo"
                onClick={onLogoClick}
              />
              <div className="about-info">
                <span>{appVersion}</span>
                {/* <IonRouterLink href="mailto:support@12all.tv">
                    support@12all.tv
                  </IonRouterLink> */}
              </div>
            </div>
            <div className="actions-container">
              <div
                className="avatar-icon-container"
                onClick={redirectToProfilePage}
              >
                <img
                  src={avatar || defaultAvatar}
                  alt=""
                  className="avatar-icon"
                />
                <span>{nickname || "Not Logged In"}</span>
                {isAnonymous && <span>{"(Not Logged In)"}</span>}
              </div>
              {jwtToken && !BaseService.isExpired(jwtToken) && !isAnonymous ? (
                <div className="actions-item-container" onClick={onLogoutClick}>
                  <IonImg src={Logout} className="actions-item-icon" />
                  <span>{t("sideBar.logout")}</span>
                </div>
              ) : (
                <div className="actions-item-container" onClick={onLoginClick}>
                  <IonImg src={Login} className="actions-item-icon" />
                  <span>{t("sideBar.login")}</span>
                </div>
              )}
              <div
                className="actions-item-container"
                onClick={() => navigateToPages(Routes.ProtectedSettings)}
              >
                <IonIcon icon={settingsOutline} className="actions-item-icon" />
                <span>{t("sideBar.settings")}</span>
              </div>
              {isAuthenticated() && (
                <div
                  className="actions-item-container"
                  onClick={onStarsBarHandle}
                >
                  <IonImg src={Star} className="actions-item-icon" />
                  <span>{t("sideBar.stars")}</span>
                </div>
              )}
              {/* <div className="actions-item-container">
                <IonImg src={Premium} className="actions-item-icon" />
                <span>{t("sideBar.premium")}</span>
              </div>
              <div className="actions-item-container">
                <IonIcon icon={shirtOutline} className="actions-item-icon" />
                <span>{t("sideBar.store")}</span>
              </div>
              <div className="actions-item-container">
                <IonIcon
                  icon={shareSocialOutline}
                  className="actions-item-icon"
                />
                <span>{t("sideBar.social")}</span>
              </div> */}
              <div className="bottom-icon-container" onClick={onExitClick}>
                <IonIcon icon={exitOutline} className="exit-icon" />
                <span>{t("sideBar.exit")}</span>
              </div>
            </div>
          </div>
        </div>
        {isStarsBarOpen && (
          <div className="sidebar-star-container">
            <div className="sidebar-star-container-header">
              <IonImg src={Star} className="header-icon" />
              <span>{t("sideBar.stars")}</span>
              <div className="total-description">
                <span>{t("sideBar.currentBalance")}</span>
                <span>Total: {starsBalance} stars</span>
              </div>
            </div>
            <div className="sidebar-star-container-body">
              <div className="actions-container">
                {/* <div
                  className="actions-container-item"
                  onClick={onInviteAndWinClick}
                >
                  {t("sideBar.inviteandWin")}
                </div> */}
                <div
                  className="actions-container-item"
                  onClick={onStarsStatusClick}
                >
                  {t("sideBar.starsStatus")}
                </div>
                <div className="actions-container-item" onClick={onTopUpClick}>
                  {t("sideBar.topup")}
                </div>
                <div
                  className="actions-container-item"
                  onClick={onCashOutClick}
                >
                  {t("sideBar.cashOut")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideBar;
