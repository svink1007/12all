import React, { FC } from "react";
import { IonImg, IonInput, IonLabel } from "@ionic/react";
import { TextFieldTypes } from "@ionic/core"
import "./styles.scss";
// import { useTranslation } from "react-i18next";

type Props = {
  className?: string;
  icon: string;
  inputLabel: string;
  type: TextFieldTypes;
  name: string;
  value: string | null;
  setValue: (value: string) => void;
}

const InputWithIcon: FC<Props> = ({ className, inputLabel, icon, type, name, value, setValue }) => {
  // const { t } = useTranslation()

  return (
    <div className="icon-input-container">
      <IonLabel className="icon-input-label">{inputLabel}</IonLabel>
      <div className={`icon-input-field ${className}`}>
        <IonImg src={icon} />
        <IonInput
          className="icon-input"
          type={type}
          name={name}
          value={value}
          onIonChange={({ detail: { value } }) =>
            setValue(value ? value.trim() : '')
          }
        />
      </div>
    </div>
  )
}

export default InputWithIcon

