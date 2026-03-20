import { IonImg, IonItem } from "@ionic/react";
import React from "react";
import "./styles.scss";

type FilterTypeProps = {
  icon: string;
  text: string;
  onClick: Function;
  selected?: Boolean;
};

const FilterType: React.FC<FilterTypeProps> = (props) => {
  return (
    <div className="filter-type" onClick={() => props.onClick(props.text)}>
      <div
        className={`filter-type-container ${props.selected ? "active-back" : "deactive-back"}`}
      >
        <IonImg src={props.icon} className="filter-type-icon" />
        <p className="filter-type-text">{props.text}</p>
      </div>
    </div>
  );
};

export default FilterType;
