import React, { useRef } from "react";
import { IonImg } from "@ionic/react";

import "./styles.scss";

import Search from "../../images/channel_page/search.svg";
import Close from "../../images/channel_page/close.svg";
// import Favorites from "../../images/search-input/favorites.svg";
// import Users from "../../images/search-input/users.svg";
// import Rooms from "../../images/search-input/rooms.svg";
// import Channels from "../../images/search-input/channels.svg";
// import Language from "../../images/search-input/language.svg";
// import Countries from "../../images/search-input/countries.svg";
import { useTranslation } from "react-i18next";

interface ISearchInputProps {
  filterTypes: Array<string>;
  onRemoveFilterTagClick: (tagToRemove: string) => void;
  onSearchTypeItemClick: (item: string) => void;
  isFocused: boolean;
  handleFocus: () => void;
  handleLoseFocus: () => void;
  handleKeyDown: (event: any) => void;
  onChange: (event: any) => void;
  value: string;
}

interface ISearchTypeItemProps {
  src: string;
  text: string;
  onClick: (item: string) => void;
  isActive: boolean;
}

const SearchTypeItem: React.FC<ISearchTypeItemProps> = (props) => {
  const { src, text, onClick, isActive } = props;

  return (
    <div
      className={`search-type-item-container ${isActive ? "active" : ""}`}
      onClick={() => onClick(text)}
    >
      <IonImg src={src} className="item-img" />
      <p>{text}</p>
    </div>
  );
};

const SearchInput: React.FC<ISearchInputProps> = (props) => {
  const { t } = useTranslation();
  const {
    filterTypes,
    onRemoveFilterTagClick,
    onSearchTypeItemClick,
    handleFocus,
    handleLoseFocus,
    isFocused,
    handleKeyDown,
    onChange,
    value,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className={`custom-input-container ${isFocused ? "focused" : ""}`}>
        {filterTypes.length > 0 &&
          filterTypes.map((tag, index) => (
            <div key={"custom-input-tag" + index}>
              <div className="custom-input-tag">
                <span>{tag}</span>
                <button
                  className="close-btn"
                  onClick={() => onRemoveFilterTagClick(tag)}
                >
                  <IonImg src={Close} className="close-btn-icon" />
                </button>
              </div>
            </div>
          ))}
        <input
          type="text"
          placeholder="search channel, user, language, country ..."
          ref={inputRef}
          className="search-input"
          onFocus={handleFocus}
          onBlur={handleLoseFocus}
          onKeyDown={handleKeyDown}
          onChange={onChange}
          value={value}
        />
        <div className="search-icon">
          <IonImg src={Search} />
        </div>
      </div>
      {/* {!isFocused && (
                <div className="search-type-items-container">
                    <SearchTypeItem
                        src={Favorites}
                        text={t("searchInput.favorites")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(
                            t("searchInput.favorites")
                        )}
                    />
                    <SearchTypeItem
                        src={Users}
                        text={t("searchInput.users")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(t("searchInput.users"))}
                    />
                    <SearchTypeItem
                        src={Rooms}
                        text={t("searchInput.rooms")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(t("searchInput.rooms"))}
                    />
                    <SearchTypeItem
                        src={Channels}
                        text={t("searchInput.channels")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(
                            t("searchInput.channels")
                        )}
                    />
                    <SearchTypeItem
                        src={Language}
                        text={t("searchInput.language")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(
                            t("searchInput.language")
                        )}
                    />
                    <SearchTypeItem
                        src={Countries}
                        text={t("searchInput.countries")}
                        onClick={onSearchTypeItemClick}
                        isActive={filterTypes.includes(
                            t("searchInput.countries")
                        )}
                    />
                </div>
            )} */}
    </div>
  );
};

export default SearchInput;
