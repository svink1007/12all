import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPopover,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  useIonRouter,
  // useIonRouter
} from "@ionic/react";
import {globeOutline, personCircleOutline, videocamOutline} from "ionicons/icons";
import headerLogo from "../../images/12all-header.png";
import { ILanguage, LANGUAGES } from "../../shared/Language";
import { useHistory, useLocation } from "react-router";
import { Routes } from "../../shared/routes";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/shared/types";
import { setLogout } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { setInfoToast } from "../../redux/actions/toastActions";
import setLanguage from "../../redux/actions/languageActions";
import i18n from "../../i18n";
import { MAIN_CONTENT_ID } from "../../shared/constants";
import HeaderSearchbar from "../HeaderSearchbar";
import redSharpStar from "../../images/icons/star-sharp.svg";
import { setTotalStarBalance } from "../../redux/actions/billingRewardActions";

const APP_LNG = "appLng";

// billing:
type starsType = {
  [key: string]: string;
  howToWin: string;
  inviteAndWin: string;
  shop: string;
  starsStatus: string;
  starsTransaction: string;
  // cashOut: string
};

type starsTypeVisible = {
  [key: string]: boolean;
  howToWin: boolean;
  inviteAndWin: boolean;
  shop: boolean;
  starsStatus: boolean;
  starsTransaction: boolean;
  // cashOut: boolean
};

type MenuItemsProps = {
  inToolbar?: boolean;
  onChangeLanguage: (language: ILanguage) => void;
  onProfileClick: (event: any) => void;
};

const Logo: FC = () => (
    <IonItem
        routerLink={Routes.Home}
        routerDirection="back"
        lines="none"
        detail={false}
    >
      <IonImg src={headerLogo} />
    </IonItem>
);

const MenuItems: FC<MenuItemsProps> = ({
                                         inToolbar,
                                         onChangeLanguage,
                                         onProfileClick,
                                       }: MenuItemsProps) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const router = useIonRouter();
  const history = useHistory();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const language = useSelector(({ language }: ReduxSelectors) => language);
  const { starsBalance } = useSelector(
      ({ billingRewards }: ReduxSelectors) => billingRewards
  );
  const lines = useRef<"none" | "full">(inToolbar ? "none" : "full");
  const [activeRoute, setActiveRoute] = useState<string>("");
  const [selectedStar, setSelectedStar] = useState<string>("");

  // billing:
  const starsObj: starsType = {
    howToWin: "HOW TO WIN STARS",
    inviteAndWin: "INVITE AND WIN",
    shop: "SHOP",
    starsStatus: "STARS STATUS",
    starsTransaction: "STARS TRANSACTIONS",
    // cashOut: "CASH OUT"
  };

  const starsObjAuthVisible: starsTypeVisible = {
    howToWin: false,
    inviteAndWin: true,
    shop: true,
    starsStatus: true,
    starsTransaction: true,
    // cashOut: true
  };

  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname]);

  const manageLanguageChange = (e: CustomEvent) => {
    const language = LANGUAGES.find((l) => l.key === e.detail.value);
    if (language) {
      onChangeLanguage(language);
      appStorage.setItem(APP_LNG, language.key);
    }
  };

  // billing:
  const selectStars = (e: CustomEvent) => {
    console.log("e", e.detail.value);
    switch (e.detail.value) {
      case "howToWin":
        setSelectedStar(e.detail.value);
        // window.location.href = Routes.howToWin;
        history.push(Routes.howToWin);
        break;
      case "inviteAndWin":
        setSelectedStar(e.detail.value);
        router.push(Routes.InviteAndWin);
        break;
      case "shop":
        setSelectedStar(e.detail.value);
        router.push(Routes.Shop);
        break;
      case "starsStatus":
        setSelectedStar(e.detail.value);
        router.push(Routes.StarsStatusTable);
        break;
      case "starsTransaction":
        setSelectedStar(e.detail.value);
        router.push(Routes.StarsTransaction);
        break;
        // case "cashOut":
        //   setSelectedStar(e.detail.value)
        //   router.push(Routes.CashOut);
        //   break;
      default:
        setSelectedStar("");
        break;
    }
  };

  const setItemAsActive = (routeName: string) => {
    return `${activeRoute === routeName ? "active" : ""}`;
  };

  useEffect(() => {
    const unlisten = history.listen(() => {
      if (selectedStar) {
        setSelectedStar("");
      }
    });

    return () => {
      unlisten();
    };
  }, [history, selectedStar]);

  const dispatch = useDispatch();

  return (
      <>
        <IonItem
            routerLink={Routes.Home}
            className={setItemAsActive(Routes.Home)}
            // routerDirection="back"
            lines={lines.current}
        >
          <IonLabel>{t("nav.home")}</IonLabel>
        </IonItem>

        <IonItem
            href={"https://b2b.one2all.tv/"}
            className={setItemAsActive(Routes.About)}
            lines={lines.current}
        >
          <IonLabel>{t("nav.about")}</IonLabel>
        </IonItem>

        {/* <IonItem routerLink={Routes.Shop} routerDirection="back" lines={lines}>
          <IonLabel color={setItemColor(Routes.Shop)}>{t('nav.shop')}</IonLabel>
        </IonItem> */}

        <IonItem
            routerLink={Routes.Downloads}
            className={setItemAsActive(Routes.Downloads)}
            // routerDirection="back"
            lines={lines.current}
        >
          <IonLabel>{t("nav.downloads")}</IonLabel>
        </IonItem>

        <IonItem
            routerLink={Routes.News}
            className={setItemAsActive(Routes.News)}
            // routerDirection="back"
            lines={lines.current}
        >
          <IonLabel>{t("nav.news")}</IonLabel>
        </IonItem>

        {/* {profile.jwt && !profile.isAnonymous && <IonItem lines={lines.current} data-id="stars" className="stars-item">
        <IonLabel>{t('nav.stars')}</IonLabel>
        <IonSelect
          value={selectedStar}
          // selectedText={selectedStar}
          onIonChange={selectStars}
          interface="popover"
          data-id="language"
        >
          {Object.keys(starsObj).map((key) => (
            <IonSelectOption key={key} value={key}>
              {starsObj[key]}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>} */}

        {/* billing: */}
        {profile.jwt && !profile.isAnonymous && (
            <IonItem
                routerLink={Routes.Premium}
                className={setItemAsActive(Routes.Premium)}
                // routerDirection="back"
                lines={lines.current}
            >
              <IonLabel>{t("nav.premium")}</IonLabel>
            </IonItem>
        )}

        <IonItem
            routerLink={Routes.Support}
            className={setItemAsActive(Routes.Support)}
            // routerDirection="back"
            lines={lines.current}
        >
          <IonLabel>{t("nav.support")}</IonLabel>
        </IonItem>

        <HeaderSearchbar />

        <IonItem
            lines={lines.current}
            data-id="language"
            className="language-item"
        >
          <IonIcon icon={globeOutline} color="dark" data-id="language" />
          <IonSelect
              value={language.key}
              selectedText={language.initial}
              onIonChange={manageLanguageChange}
              interface="popover"
              data-id="language"
          >
            {LANGUAGES.map(({ key, name }: ILanguage) => (
                <IonSelectOption key={key} value={key}>
                  {name}
                </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        {profile.jwt ? (
            <IonItem
                lines="none"
                className="profile-button"
                button
                onClick={onProfileClick}
                data-id="profile"
            >
              {profile.avatar ? (
                  <IonAvatar slot="start" data-id="profile">
                    <img alt="" src={`${profile.avatar}`} data-id="profile" />
                  </IonAvatar>
              ) : (
                  <IonIcon
                      icon={personCircleOutline}
                      color="dark"
                      data-id="profile"
                  />
              )}

              <IonLabel data-id="profile">
                {profile.isAnonymous
                    ? "User"
                    : profile.nickname
                        ? profile.nickname
                        : (!!profile.email && profile.email.includes("@12all.anon"))
                            ? profile.phoneNumber
                            : profile.email}
              </IonLabel>
            </IonItem>
        ) : (
            <IonItem
                routerLink={Routes.Login}
                className={`login-item ${setItemAsActive(Routes.Login)}`}
                // routerDirection="back"
                lines="none"
            >
              <IonIcon icon={personCircleOutline} color="dark" />
              <IonLabel>{t("nav.login")}</IonLabel>
            </IonItem>
        )}

        {/* billing: */}
        <IonItem
            lines={lines.current}
            data-id="stars"
            className="star-balance-display stars-item"
        >
          <IonImg src={redSharpStar} />
          <IonLabel>{`${ profile.jwt &&
          !profile.isAnonymous &&
          ((!!profile?.email && !profile?.email.includes("@skiplogin.com")) || profile?.email === null) ? starsBalance : "Stars"}`}</IonLabel>
          <IonSelect
              value={selectedStar}
              onIonChange={selectStars}
              interface="popover"
              data-id="language"
          >
            {Object.keys(starsObj).map((key) =>
                profile.jwt &&
                !profile.isAnonymous &&
                ((!!profile?.email && !profile?.email.includes("@skiplogin.com")) || profile?.email === null)
                 ? (
                    <IonSelectOption key={key} value={key}>
                      {starsObj[key]}
                    </IonSelectOption>
                ) : (
                    starsObjAuthVisible[key] === false && (
                        <IonSelectOption key={key} value={key}>
                          {starsObj[key]}
                        </IonSelectOption>
                    )
                )
            )}
          </IonSelect>
        </IonItem>
      </>
  );
};

const Header: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const language = useSelector(({ language }: ReduxSelectors) => language);
  const menuRef = useRef<HTMLIonMenuElement>(null);

  const [profilePopover, setProfilePopover] = useState<{
    showPopover: boolean;
    event?: Event;
  }>({ showPopover: false });

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const handleChangeLanguage = useCallback(
      (lng: ILanguage) => {
        document.documentElement.dir = lng.dir;
        i18n.changeLanguage(lng.key).then();
        dispatch(setLanguage(lng));
      },
      [dispatch]
  );

  useEffect(() => {
    const value = appStorage.getItem(APP_LNG);
    if (value) {
      const lng = LANGUAGES.find((l) => l.key === value);
      if (lng) {
        handleChangeLanguage(lng);
      }
    }
  }, [handleChangeLanguage]);

  const onWindowResize = () => {
    if (window.innerWidth > 992 && menuRef.current) {
      menuRef.current.close().then();
    }
  };

  const menuDidOpen = () => {
    window.addEventListener("resize", onWindowResize);
  };

  const menuDidClose = () => {
    window.removeEventListener("resize", onWindowResize);
  };

  const logout = () => {
    dispatch(setLogout());
    appStorage.removeItem(StorageKey.Login);
    setProfilePopover({ showPopover: false });
    // delay preventing error on redirect
    history.replace(Routes.Login);
    setTimeout(() => {
      dispatch(setInfoToast("logout.logoutSuccess"));
    }, 500);
  };

  const anonymousLogoutLogin = () => {
    dispatch(setLogout());
    appStorage.removeItem(StorageKey.Login);
    setProfilePopover({ showPopover: false });

    history.replace(Routes.Login);
  };

  const handleProfileClick = (event: any) => {
    event.persist();
    setProfilePopover({ showPopover: true, event });
  };

  const handleMenuListClick = (e: React.MouseEvent<HTMLIonListElement>) => {
    // @ts-ignore
    if (!e.target.dataset.id) {
      menuRef.current?.close();
    }
  };

  return (
      <>
        <IonHeader className="app-header">
          <IonToolbar className="header-toolbar">
            <IonItem className="app-header-toggle-menu" lines="none">
              <IonMenuButton
                  color="primary"
                  onClick={() => menuRef.current?.toggle()}
                  autoHide={false}
              />
              <Logo />
            </IonItem>
            <IonItemGroup className="nav-container p-2">
              <Logo />
              <IonItemGroup>
                <MenuItems
                    inToolbar
                    onChangeLanguage={handleChangeLanguage}
                    onProfileClick={handleProfileClick}
                />
              </IonItemGroup>
            </IonItemGroup>
          </IonToolbar>

          <IonPopover
              event={profilePopover.event}
              isOpen={profilePopover.showPopover}
              onDidDismiss={() => setProfilePopover({ showPopover: false })}
          >
            <IonList>
              {profile.jwt &&
              !profile.isAnonymous &&
              ((!!profile?.email && !profile?.email.includes("@skiplogin.com")) || profile?.email === null) ? (
                  <>
                    <IonItem
                        routerLink={Routes.MyProfile}
                        onClick={() => setProfilePopover({ showPopover: false })}
                        // routerDirection="back"
                        lines="none"
                    >
                      {t("nav.myProfile")}
                    </IonItem>

                    <IonItem
                        routerLink={Routes.MyVoD}
                        onClick={() => setProfilePopover({ showPopover: false })}
                        // routerDirection="back"
                        lines="none"
                    >
                      <svg width="24" height="24" viewBox="0 0 717 717" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M358.333 691.667C542.428 691.667 691.667 542.428 691.667 358.333C691.667 174.238 542.428 25 358.333 25C174.238 25 25 174.238 25 358.333C25 542.428 174.238 691.667 358.333 691.667Z" stroke="white" strokeWidth="50"/>
                        <path d="M544.123 323.033C570.18 338.42 570.18 378.247 544.123 393.633L386.783 486.527C361.457 501.48 330.333 482.017 330.333 451.227V265.439C330.333 234.649 361.457 215.187 386.783 230.14L544.123 323.033Z" stroke="white" strokeWidth="50"/>
                        <path d="M153 358.666C153 377.963 168.703 393.666 188 393.666C207.297 393.666 223 377.963 223 358.666C223 339.37 207.297 323.667 188 323.667C168.703 323.667 153 339.37 153 358.666Z" fill="white"/>
                        <path d="M153 475.333C153 494.63 168.703 510.333 188 510.333C207.297 510.333 223 494.63 223 475.333C223 456.037 207.297 440.333 188 440.333C168.703 440.333 153 456.037 153 475.333Z" fill="white"/>
                        <path d="M153 242C153 261.297 168.703 277 188 277C207.297 277 223 261.297 223 242C223 222.703 207.297 207 188 207C168.703 207 153 222.703 153 242Z" fill="white"/>
                      </svg> &nbsp;&nbsp;
                      MY VIDEOS
                    </IonItem>

                    <IonItem
                        routerLink={Routes.resetCode}
                        onClick={() => setProfilePopover({ showPopover: false })}
                        lines="none"
                    >
                      {t("nav.resetPassword")}
                    </IonItem>

                    {/* billing: */}
                    <IonItem
                        routerLink={Routes.AccountStatus}
                        onClick={() => {
                          setProfilePopover({ showPopover: false });
                          // history.replace(Routes.AccountStatus);
                        }}
                        // routerDirection="back"
                        lines="none"
                    >
                      {t("nav.accountStatus")}
                    </IonItem>
                  </>
              ) : <IonItem
                  button
                  onClick={() => {
                    setProfilePopover({ showPopover: false });
                    history.replace(Routes.Login + "?action=register")
                  }}
                  lines="none"
              >
                REGISTER USER
              </IonItem>}
              <IonItem
                  button
                  onClick={profile?.isAnonymous ? anonymousLogoutLogin : logout}
              >
                {profile?.isAnonymous ? t("nav.login") : t("nav.logout")}
              </IonItem>
                {/* <IonItem
                  lines="none"
                >
                V {process.env.REACT_APP_VERSION || '0.0.0'}
                </IonItem> */}
            </IonList>
          </IonPopover>
        </IonHeader>
        <IonMenu
            contentId={MAIN_CONTENT_ID}
            class="app-menu"
            type="overlay"
            ref={menuRef}
            side={language.dir === "ltr" ? "start" : "end"}
            onIonDidOpen={menuDidOpen}
            onIonDidClose={menuDidClose}
            swipeGesture={false}
        >
          <IonContent>
            <IonList onClick={handleMenuListClick}>
              <MenuItems
                  onChangeLanguage={handleChangeLanguage}
                  onProfileClick={handleProfileClick}
              />
            </IonList>
          </IonContent>
        </IonMenu>
      </>
  );
};

export default Header;
