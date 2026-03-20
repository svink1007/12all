import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, useHistory } from "react-router";
import {
  countries as countryListCountries,
  languages as countryListLanguages,
} from "countries-list";
import { PartnerService } from "../../services/PartnerService";

import "./styles.scss";

import { BroadcastSelect } from "./BroadcastFilter";
import SideBar from "../SideBar";

import SideBarIcon from "../../images/channel_page/sidebar.svg";
import Close2 from "../../images/channel_page/close_2.svg";
import logo from "../../images/12all-logo-header.svg";
import CreateRoom from "../../images/channel_page/create_room.svg";
import JoinRoom from "../../images/create-room/join_room.svg";
import RoomsModal from "../../images/broadcast/rooms-modal.svg";
import ChannelsModal from "../../images/broadcast/channels-modal.svg";
import OtherMediaModal from "../../images/broadcast/other-media-modal.svg";
import SharedVodModal from "../../images/broadcast/shared-vod-modal.svg";

import GenreService from "../../services/GenreService";
import { chevronForward } from "ionicons/icons";
import BroadcastData from "./BroadcastData";
import { Routes } from "../../shared/routes";
import SearchInput from "../../components/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { setChannelsSearch } from "../../redux/actions/channelsSearchActions";
import {
  setSidebarClose,
  setSidebarOpen,
} from "../../redux/actions/sidebarActions";
import { ReduxSelectors } from "../../redux/types";
import BaseService from "../../services/BaseService";
import Gdpr from "../../components/Gdpr";
import { checkIfLoggedIn } from "../../utils/authUtils";
import SafeAreaView from "../../components/SafeAreaView";
import GoogleAdStream from "../../components/GoogleAdStream";
import { UserManagementService } from "../../services";
import { setProfile } from "../../redux/actions/profileActions";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { set } from "react-ga";

type SelectModalProps = {
  data: BroadcastSelect[];
  title: string;
  onDismiss: () => void;
  onOk: () => void;
};

type TypeSelectModalProps = {
  data?: string[];
  onDismiss: () => void;
  onOk: () => void;
  type: string;
  setType: any;
};

type FilterTagProps = {
  data: string;
  setData: any;
};

type FilterTagsProps = {
  data: Array<BroadcastSelect | string>;
  allData: Array<BroadcastSelect>;
  setAllData: any;
};

const SelectModal: React.FC<SelectModalProps> = (props) => {
  const { t } = useTranslation();

  return (
    <div className="channel-page-modal">
      <IonImg
        src={Close2}
        className="channel-page-modal-close-btn"
        onClick={props.onDismiss}
      />
      <p className="channel-page-modal-title">{props.title}</p>
      <hr className="channel-page-hr" />
      <div className="channel-page-checkbox-group">
        {props.data &&
          props?.data.map((item, index) => {
            return (
              <div key={"channel-page-checkbox" + item.name + index}>
                {item.show && (
                  <IonCheckbox
                    justify="start"
                    labelPlacement="end"
                    checked={item.checked}
                    onIonChange={(e) => (item.checked = e.detail.checked)}
                  >
                    {item.name}
                  </IonCheckbox>
                )}
              </div>
            );
          })}
      </div>
      <hr className="channel-page-hr" />
      <div className="channel-page-ok-btn-wrapper">
        <IonButton onClick={props.onOk}>{t("selectFilter.ok")}</IonButton>
      </div>
    </div>
  );
};

const SelectOwnerModal: React.FC<SelectModalProps> = (props) => {
  const { t } = useTranslation();

  // State to track the selected radio button
  const [selectedValue, setSelectedValue] = React.useState<string | null>(
    props.data.find(item => item.checked)?.name || null
  );

  const handleRadioChange = (e: CustomEvent) => {
    const selectedName = e.detail.value as string;
    setSelectedValue(selectedName);
    // Update the checked property of the selected item
    props.data.forEach(item => {
      item.checked = item.name === selectedName;
    });
  };

  return (
    <div className="channel-page-modal">
      <IonImg
        src={Close2}
        className="channel-page-modal-close-btn"
        onClick={props.onDismiss}
      />
      <p className="channel-page-modal-title">{props.title}</p>
      <hr className="channel-page-hr" />
      <div className="channel-page-checkbox-group">
        <IonRadioGroup value={selectedValue} onIonChange={handleRadioChange}>
          {props.data &&
            props?.data.map((item, index) => {
              return (
                <div key={"channel-page-radio" + item.name + index}>
                  {item.show && (
                    <IonRadio
                      value={item.name}
                      labelPlacement="end"
                    >
                      {item.name}
                    </IonRadio>
                  )}
                </div>
              );
            })}
        </IonRadioGroup>
      </div>
      <hr className="channel-page-hr" />
      <div className="channel-page-ok-btn-wrapper">
        <IonButton onClick={props.onOk}>{t("selectFilter.ok")}</IonButton>
      </div>
    </div>
  );
};

const TypeSelectModal: React.FC<TypeSelectModalProps> = (props) => {
  const { t } = useTranslation();
  const [alternativeVal, setAlternativeVal] = React.useState(props.type);

  const handleItemClick = (value: string) => {
    // props.setType(value);
    setAlternativeVal(value);
  };

  return (
    <div className="channel-page-modal">
      <IonImg
        src={Close2}
        className="channel-page-modal-close-btn"
        onClick={() => {
          props.onDismiss();
          // props.setType("");
          setAlternativeVal("");
        }}
      />
      <p className="channel-page-modal-title">{t("selectFilter.selectType")}</p>
      <IonRadioGroup
        className="type-modal-body-items"
        value={alternativeVal}
        onIonChange={(e) => {
          setAlternativeVal(e.detail.value);
        }}
      >
        <IonItem
          lines="none"
          onClick={() => handleItemClick(t("selectFilter.rooms"))}
        >
          <IonRadio value={t("selectFilter.rooms")} slot="start"></IonRadio>
          <div className="type-modal-body-item">
            <IonImg src={RoomsModal}></IonImg>
            <p>{t("selectFilter.rooms")}</p>
          </div>
        </IonItem>
        <IonItem
          lines="none"
          onClick={() => handleItemClick(t("selectFilter.channels"))}
        >
          <IonRadio value={t("selectFilter.channels")} slot="start"></IonRadio>
          <div className="type-modal-body-item">
            <IonImg src={ChannelsModal}></IonImg>
            <p>{t("selectFilter.channels")}</p>
          </div>
        </IonItem>
        <IonItem
          lines="none"
          onClick={() => handleItemClick(t("selectFilter.otherMedia"))}
        >
          <IonRadio
            value={t("selectFilter.otherMedia")}
            slot="start"
          ></IonRadio>
          <div className="type-modal-body-item">
            <IonImg src={OtherMediaModal}></IonImg>
            <p>{t("selectFilter.otherMedia")}</p>
          </div>
        </IonItem>
        <IonItem lines="none" onClick={() => handleItemClick("Shared VOD")}>
          <IonRadio value="Shared VOD" slot="start"></IonRadio>
          <div className="type-modal-body-item">
            <IonImg src={SharedVodModal}></IonImg>
            <p>Shared VOD</p>
          </div>
        </IonItem>
      </IonRadioGroup>
      <div className="channel-page-ok-btn-wrapper">
        <IonButton
          onClick={() => {
            props.setType(alternativeVal);
            props.onOk();
          }}
        >
          {t("selectFilter.ok")}
        </IonButton>
      </div>
    </div>
  );
};

const FilterTag: React.FC<FilterTagProps> = (props) => {
  const { data, setData } = props;

  const onTagClick = () => {
    setData("");
  };

  return (
    <>
      <div className="channel-page-selected-tag">
        <span>{data}</span>
        <IonIcon
          src={Close2}
          onClick={() => {
            onTagClick();
          }}
        />
      </div>
    </>
  );
};

const FilterTags: React.FC<FilterTagsProps> = (props) => {
  const { data, allData, setAllData } = props;

  const onTagClick = (
    data: BroadcastSelect[],
    setData: any,
    currentVal: string
  ) => {
    let updatedData = data.map((item) => {
      if (item.name.toLowerCase() !== currentVal.toLowerCase()) {
        return item;
      } else {
        return { ...item, checked: false };
      }
    });

    setData(updatedData);
  };

  return (
    <>
      {data.map((item: any, index) => (
        <div className="channel-page-selected-tag" key={item + index}>
          <span>{item}</span>
          <IonIcon
            src={Close2}
            onClick={() => {
              onTagClick(allData, setAllData, item);
            }}
          />
        </div>
      ))}
    </>
  );
};

const BroadcastsPage: React.FC<RouteComponentProps> = (props) => {
  const { history, location, match } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const type = [
    t("selectFilter.room"),
    t("selectFilter.channels"),
    t("selectFilter.otherMedia"),
    "Shared VOD",
  ];

  const { isOpen } = useSelector(({ sidebar }: ReduxSelectors) => sidebar);
  const { jwtToken, isAnonymous } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const { prevUrl } = useSelector(({ route }: ReduxSelectors) => route);

  const [filterTypes, setFilterType] = React.useState(["All"]);

  const [languages, setLanguages] = React.useState<BroadcastSelect[]>([]);
  const [countries, setCountries] = React.useState<BroadcastSelect[]>([]);
  const [genres, setGenres] = React.useState<BroadcastSelect[]>([]);
  const [owners, setOwners] = React.useState<BroadcastSelect[]>([]);

  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = React.useState<{ id?: number; name: string }[]>([]);
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    []
  );
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>(
    []
  );
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [showModal, setShowModal] = React.useState<string>("");
  const [isInputFocused, setIsInputFocused] = React.useState<boolean>(false);
  const [searchInputText, setSearchInputText] = React.useState<string>("");
  const [showGModal, setShowGModal] = React.useState<boolean>(false);

  useEffect(() => {
    (async function () {
      const isLoggedIn = await checkIfLoggedIn();
      if (isLoggedIn && localStorage.getItem("gaConsent") === null) {
        setShowGModal(true);
      }
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
    })();
  }, [profile.isAuthenticated, profile.email]);

  useEffect(() => {
      PartnerService.getPartners().then(({ data }) => {
        const ownersFilter: BroadcastSelect[] = [];
        data.forEach((owner) =>
          ownersFilter.push(new BroadcastSelect(owner.name, owner.id))
        );
        setOwners(ownersFilter);
      });
  }, []);

  useEffect(() => {
    (async function () {
      const parseData = (data: { name: string }[]) =>
        data
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name }) => new BroadcastSelect(name));

      const languagesFilter = parseData(Object.values(countryListLanguages));
      setLanguages(languagesFilter);

      const countriesMapped = parseData(Object.values(countryListCountries));
      setCountries(countriesMapped);

      GenreService.getGenres().then(({ data }) => {
        const genresFilter: BroadcastSelect[] = [];
        data.forEach((genre) =>
          genresFilter.push(new BroadcastSelect(genre.name))
        );
        setGenres(genresFilter);
      });
    })();
  }, []);

  useEffect(() => {
    handleFilteredQuery();
  }, [languages, genres, countries, owners]);

  useEffect(() => {
    dispatch(setChannelsSearch(searchInputText));
  }, [searchInputText]);

  const handleFilteredQuery = () => {
    const parseFilter = (filter: BroadcastSelect[]) =>
      filter.filter((g) => g.checked).map((g) => g.name.toLowerCase());
      // For owners, return both id and name
    const parseOwnerFilter = (filter: BroadcastSelect[]) =>
      filter
        .filter((g) => g.checked)
        .map((g) => ({ id: g.id, name: g.name }));
    setSelectedGenres(parseFilter(genres));
    setSelectedLanguages(parseFilter(languages));
    setSelectedCountries(parseFilter(countries));
    setSelectedOwners(parseOwnerFilter(owners));
    setShowModal("");
  };

  const onDismiss = () => {
    setShowModal("");
  };

  const onRemoveFilterTagClick = (tagToRemove: string) => {
    const newFilterTypes = filterTypes.filter((tag) => tag !== tagToRemove);
    setFilterType(newFilterTypes.length > 0 ? newFilterTypes : ["All"]);
    setSearchInputText("");
    setGenres([]);
    setLanguages([]);
    setCountries([]);
    setSelectedType("");
  };

  const onSearchTypeItemClick = (item: string) => {
    setFilterType([item]);
  };

  const onSidebarClick = () => {
    if (!isOpen) {
      dispatch(setSidebarOpen());
    } else {
      dispatch(setSidebarClose());
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleInputKeyDown = (event: any) => {
    if (event.key === "Enter") {
      setIsInputFocused(false);
      setSearchInputText(event.target.value);
    }
  };

  const handleInputChange = (event: any) => {
    setSearchInputText(event.target.value);
  };

  const isAuthenticated = () => {
    return jwtToken && !BaseService.isExpired(jwtToken) && !isAnonymous;
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div
            className={`channel-page-container ${
              showModal ? "blur-background" : ""
            }`}
          >
            <div className="channel-page-sticky">
              <div className="channel-page-header">
                <IonImg src={SideBarIcon} onClick={onSidebarClick} />
                <div className="logo">
                  <IonImg src={logo} className="h-10" />
                </div>
                {/* <IonImg src={People} /> */}
              </div>
              <div className="channel-page-filter">
                <SearchInput
                  filterTypes={filterTypes}
                  onRemoveFilterTagClick={onRemoveFilterTagClick}
                  onSearchTypeItemClick={onSearchTypeItemClick}
                  isFocused={isInputFocused}
                  handleFocus={handleInputFocus}
                  handleLoseFocus={handleInputBlur}
                  handleKeyDown={handleInputKeyDown}
                  onChange={handleInputChange}
                  value={searchInputText}
                />
                {!isInputFocused && (
                  <>
                    <div className="channel-page-button-group">
                      <div className="filter-container">
                        <IonButton
                          size="small"
                          shape="round"
                          className="channel-page-button"
                          onClick={() =>
                            setShowModal(t("selectFilter.selectLanguage"))
                          }
                        >
                          {t("search.language")}
                        </IonButton>
                        <IonButton
                          size="small"
                          shape="round"
                          className="channel-page-button"
                          onClick={() =>
                            setShowModal(t("selectFilter.selectGenre"))
                          }
                        >
                          {t("search.genre")}
                        </IonButton>
                        <IonButton
                          size="small"
                          shape="round"
                          className="channel-page-button"
                          onClick={() =>
                            setShowModal(t("selectFilter.selectOrigin"))
                          }
                        >
                          {t("search.country")}
                        </IonButton>
                        <IonButton
                          size="small"
                          shape="round"
                          className="channel-page-button"
                          onClick={() =>
                            setShowModal(t("selectFilter.selectOwner"))
                          }
                        >
                          {t("search.owner")}
                        </IonButton>
                      </div>
                      <IonButton
                        size="small"
                        shape="round"
                        className="search-type-button"
                        onClick={() =>
                          setShowModal(t("selectFilter.selectType"))
                        }
                      >
                        {t("search.type")}
                      </IonButton>
                    </div>
                    <div className="channel-page-selected-tags-container">
                      <div className="channel-page-selected-tag-title-container">
                        <p className="channel-page-selected-tag-title">
                          {t("home.selection")}
                        </p>
                        <IonIcon
                          icon={chevronForward}
                          className="channel-page-selected-tag-icon"
                        />
                      </div>
                      <div className="channel-page-selected-tag-group">
                        {(selectedLanguages.length > 0 ||
                          selectedGenres.length > 0 ||
                          selectedCountries.length > 0 ||
                          type) && (
                          <>
                            {selectedLanguages.length > 0 && (
                              <>
                                <FilterTags
                                  data={selectedLanguages}
                                  allData={languages}
                                  setAllData={setLanguages}
                                />
                              </>
                            )}

                            {selectedGenres.length > 0 && (
                              <>
                                <FilterTags
                                  data={selectedGenres}
                                  allData={genres}
                                  setAllData={setGenres}
                                />
                              </>
                            )}

                            {selectedOwners.length > 0 && (
                              <>
                                <FilterTags
                                  data={selectedOwners.map(o => o.name)}
                                  allData={owners}
                                  setAllData={setOwners}
                                />
                              </>
                            )}

                            {selectedCountries.length > 0 && (
                              <>
                                <FilterTags
                                  data={selectedCountries}
                                  allData={countries}
                                  setAllData={setCountries}
                                />
                              </>
                            )}

                            {selectedType && (
                              <>
                                <FilterTag
                                  data={selectedType}
                                  setData={setSelectedType}
                                />
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {isInputFocused && (
              <div className="channel-page-filter-result"></div>
            )}
            {!isInputFocused && (
              <BroadcastData
                countries={selectedCountries}
                languages={selectedLanguages}
                genres={selectedGenres}
                owners={selectedOwners}
                channelType={selectedType}
                location={location}
                history={history}
                match={match}
              />
            )}
          </div>
          {isAuthenticated() && (
            <IonItem
              className="channel-page-create-room-button mb-5"
              lines="none"
              button
              routerLink={`${Routes.ProtectedCreateRoom}`}
              detail={false}
            >
              <IonImg src={CreateRoom} />
            </IonItem>
          )}
          {jwtToken && (
            <div
              className="channel-page-join-room-button mb-5"
              role="button" // Accessibility improvement
              tabIndex={0} // Accessibility improvement
              onClick={() => history.push(Routes.WatchPartyJoin)}
            >
              <IonImg src={JoinRoom} />
            </div>
          )}
        </SafeAreaView>
      </IonContent>
      {showGModal && (
        <Gdpr showGModal={showGModal} setShowGModal={setShowGModal} />
      )}
      {isOpen && <SideBar onClose={onSidebarClick} />}
      {showModal === t("selectFilter.selectGenre") && (
        <SelectModal
          title={t("selectFilter.selectGenre")}
          data={genres}
          onDismiss={onDismiss}
          onOk={handleFilteredQuery}
        />
      )}
      {showModal === t("selectFilter.selectLanguage") && (
        <SelectModal
          title={t("selectFilter.selectLanguage")}
          data={languages}
          onDismiss={onDismiss}
          onOk={handleFilteredQuery}
        />
      )}
      {showModal === t("selectFilter.selectOrigin") && (
        <SelectModal
          title={t("selectFilter.selectOrigin")}
          data={countries}
          onDismiss={onDismiss}
          onOk={handleFilteredQuery}
        />
      )}
      {showModal === t("selectFilter.selectOwner") && (
        <SelectOwnerModal
          title={t("selectFilter.selectOwner")}
          data={owners}
          onDismiss={onDismiss}
          onOk={handleFilteredQuery}
        />
      )}
      {showModal === t("selectFilter.selectType") && (
        <TypeSelectModal
          data={type}
          onDismiss={onDismiss}
          onOk={handleFilteredQuery}
          type={selectedType}
          setType={setSelectedType}
        />
      )}
    </IonPage>
  );
};

export default BroadcastsPage;
