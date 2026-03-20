import React, { FC, useEffect, useRef } from "react";
import { IonSearchbar } from "@ionic/react";
import addSmartlookShow from "../../shared/methods/addSmartlookShow";

type Props = {
  value?: string | null;
  onSearchChange: (value: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
};

const AppSearchbar: FC<Props> = ({
  value,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
}: Props) => {
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  useEffect(() => {
    searchRef.current?.getInputElement().then(addSmartlookShow);
  }, []);

  useEffect(() => {
    const search = searchRef.current;
    let inputElement: HTMLInputElement | null = null;
    search?.getInputElement().then((el) => (inputElement = el));
    const keyUpListener = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputElement) {
        inputElement.blur();
      }
    };

    search?.addEventListener("keyup", keyUpListener);

    return () => {
      search?.removeEventListener("keyup", keyUpListener);
    };
  }, [onSearchChange]);

  return value ? (
    <IonSearchbar
      ref={searchRef}
      value={value}
      debounce={500}
      onIonChange={(e) => onSearchChange(e.detail.value || "")}
      onIonFocus={onSearchFocus}
      onIonBlur={onSearchBlur}
      className="app-searchbar"
    />
  ) : (
    <IonSearchbar
      ref={searchRef}
      debounce={500}
      onIonChange={(e) => onSearchChange(e.detail.value || "")}
      onIonFocus={onSearchFocus}
      onIonBlur={onSearchBlur}
      className="app-searchbar"
    />
  );
};

export default AppSearchbar;
