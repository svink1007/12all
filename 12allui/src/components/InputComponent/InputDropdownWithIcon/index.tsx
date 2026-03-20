import React, { FC } from "react";
import { IonImg, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { TextFieldTypes } from "@ionic/core"
import "./styles.scss";
import { StarPackages } from "../../../shared/types";

type Props = {
  className?: string;
  icon: string;
  inputLabel: string;
  type: TextFieldTypes;
  name: string;
  starPackages: StarPackages[];
  handlePackageSelect: (value: number) => void;
}

const InputDropdownWithIcon: FC<Props> = ({ className, inputLabel, icon, type, name, starPackages, handlePackageSelect }) => {

  return (
    <div className="icon-input-dropdown-container">
      <IonLabel className="icon-input-dropdown-label">{inputLabel}</IonLabel>
      <div className={`icon-input-dropdown-field ${className}`}>
        <IonImg src={icon} />
        <IonSelect
          interface="popover"
          className="input-dropdown-select"
          interfaceOptions={{cssClass: 'icon-input-dropdown-select'}}
          onIonChange={(e) => handlePackageSelect(e.detail.value)}
          
        >
          {starPackages && starPackages?.map((packages, index) => {
            return (
              <IonSelectOption
                value={packages.id}
                key={index}
                className="icon-input-dropdown"
              >
                {`${packages.name} (${packages.stars} ★)`}
              </IonSelectOption>
            )
          })
          }
        </IonSelect>
      </div>
    </div>
  )
}

export default InputDropdownWithIcon

