import React, { FC } from "react";
import { IonLabel, IonTextarea } from "@ionic/react";
// import { TextFieldTypes } from "@ionic/core"
import "./styles.scss";

type Props = {
  className?: string;
  label: string;
  name: string;
  value: string;
  setValue: (value: string) => void;
}

const TextAreaIonInput: FC<Props> = ({className, label, name, value, setValue }) => {

  return (
    <div className={`input-field ${className}`}>
      <IonLabel>
        {label}
      </IonLabel>
      <IonTextarea
        // type={type}
        name={name}
        // autocomplete="off"
        required
        value={value}
        onIonChange={({ detail: { value } }) =>
          setValue(value ? value.trim() : '')
        }
      />
    </div>
  )
}

export default TextAreaIonInput

