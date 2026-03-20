import React, { FC } from "react";
import { IonInput, IonLabel } from "@ionic/react";
import { TextFieldTypes } from "@ionic/core"
import "./styles.scss";
// import { useTranslation } from "react-i18next";

type Props = {
  className?: string;
  currencyLabel: string;
  inputLabel: string;
  type: TextFieldTypes;
  name: string;
  value: string | null;
  setValue: (value: number) => void;
  disabled?: boolean;
}

const InputWithCurrency: FC<Props> = ({ className, inputLabel, currencyLabel, type, name, value, setValue, disabled }) => {
  // const { t } = useTranslation()

  return (
    <div className="currency-input-container">
      <IonLabel className="currency-input-label">{inputLabel}</IonLabel>
      <div className={`currency-input-field ${className}`}>
        <IonLabel>{currencyLabel}</IonLabel>
        <IonInput
          className="cost-input"
          type={type}
          name={name}
          value={value}
          onIonChange={({ detail: { value } }) =>
            setValue(value ? Number(value.trim()) : 0)
          }
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default InputWithCurrency

