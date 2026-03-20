import React, { FC, useRef } from "react";
import "./styles.scss";
import { IonButton, IonIcon } from "@ionic/react";
import { call } from "ionicons/icons";
import { useDispatch } from "react-redux";
import setPrevRoute from "../../redux/actions/routeActions";

type Props = {
  onExit: () => void;
};

const ExitButton: FC<Props> = ({ onExit }) => {
  const dispatch = useDispatch();
  const exiting = useRef(false);

  const handleExit = () => {
    if (!exiting.current) {
      exiting.current = true;
      dispatch(setPrevRoute(""));
      onExit();
    }
    setTimeout(() => {
      exiting.current = false; // Reset flag to allow future button clicks to trigger the exit
    }, 1000); // Adjust time as needed
  };
  return (
    <IonButton
      onClick={handleExit}
      className="exit-room-button"
      fill="solid"
      color="tertiary"
    >
      <IonIcon slot="icon-only" color="dark" icon={call} />
    </IonButton>
  );
};
export default ExitButton;
