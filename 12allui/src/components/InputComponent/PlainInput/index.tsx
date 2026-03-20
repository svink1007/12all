import React, { FC } from "react";
import { IonInput, IonLabel } from "@ionic/react";
import { TextFieldTypes } from "@ionic/core"
import "./styles.scss";

type Props = {
  className?: string;
  label?: string;
  type: TextFieldTypes;
  name: string;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InputWithLabel: FC<Props> = ({ className, label, type, name, value, setValue, disabled, placeholder }) => {

  return (
    <div className={`input-field ${className}`}>
      <IonLabel>
        {label}
      </IonLabel>
      <IonInput
        type={type}
        name={name}
        // autocomplete="off"
        autocomplete="new-password"
        required
        value={value}
        onIonChange={({ detail: { value } }) =>
          setValue(value ? value.trim() : '')
        }
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  )
}

export default InputWithLabel

