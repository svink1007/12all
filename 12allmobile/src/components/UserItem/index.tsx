import React from "react";
import { IonImg } from "@ionic/react";

import DefaultUser from "../../images/users/default_user.png";
import Star from "../../images/users/star.svg";
import Bronze from "../../images/users/bronze.png";
import Silver from "../../images/users/silver.png";
import Gold from "../../images/users/gold.png";
import Diamond from "../../images/users/diamond.png";
import Tick from "../../images/users/tick.svg";
import "./styles.scss";

export type UserItemProps = {
  avatar?: string;
  username: string;
  stars?: number;
  league?: string;
  namespace: string;
  selected: boolean;
};

const UserItem: React.FC<UserItemProps & { onSelect: () => void }> = (
  props
) => {
  const { avatar, username, namespace, onSelect, selected } = props;

  function convertToInternationalCurrencySystem(labelValue: number) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e9
      ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
      : // Six Zeroes for Millions
        Math.abs(Number(labelValue)) >= 1.0e6
        ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
        : // Three Zeroes for Thousands
          Math.abs(Number(labelValue)) >= 1.0e3
          ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
          : Math.abs(Number(labelValue));
  }

  return (
    <div className="user-item-container">
      <div className="avatar-content">
        <IonImg src={avatar ?? DefaultUser} className="avatar" />

        <div className="content-container">
          <p className="username">{username}</p>
          <div className="user-status">
            {props.stars && (
              <div className="star">
                <IonImg src={Star} class="starImg" />
                {convertToInternationalCurrencySystem(props.stars)}
              </div>
            )}

            {props?.league === "bronze" ? (
              <IonImg src={Bronze} className="league" />
            ) : props?.league === "silver" ? (
              <IonImg src={Silver} className="league" />
            ) : props?.league === "gold" ? (
              <IonImg src={Gold} className="league" />
            ) : props?.league === "diamond" ? (
              <IonImg src={Diamond} className="league" />
            ) : (
              <></>
            )}

            <div className="namespace">{namespace}</div>
          </div>
        </div>
      </div>
      <div
        className={`checkbox ${selected ? "checked" : ""}`}
        onClick={onSelect}
      >
        {selected && <IonImg src={Tick} className="checkedImg" />}
      </div>
    </div>
  );
};

export default UserItem;
