import React, { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { caretDown } from "ionicons/icons";
import AppSearchbar from "../../../components/AppSearchbar";
import SelectToolbar from "../../../components/SelectToolbar";

export class BroadcastSelect {
  name: string;
  id?: number;
  checked: boolean = false;
  show: boolean = true;

  constructor(name: string, id?: number) {
    this.name = name;
    if (id !== undefined) {
      this.id = id;
    }
  }
}

type Props = {
  titleText: string;
  icon: string;
  label: string;
  filters: BroadcastSelect[];
  onClose: () => void;
  onClear: () => void;
  onDismiss: (values: BroadcastSelect[]) => void;
};

const BroadcastFilter: FC<Props> = ({
  titleText,
  icon,
  label,
  filters,
  onClose,
  onClear,
  onDismiss,
}: Props) => {
  const { t } = useTranslation();
  const filtersOnOpen = useRef<BroadcastSelect[]>([]);
  const searchText = useRef<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filteredBySearch, setFilteredBySearch] = useState<BroadcastSelect[]>(
    []
  );
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (searchText.current) {
      const insensitive = searchText.current.toLowerCase();
      setFilteredBySearch(
        filters.filter(({ name }) => name.toLowerCase().startsWith(insensitive))
      );
    } else {
      setFilteredBySearch(filters);
    }
  }, [filters]);

  const handleOpen = () => {
    setOpenModal(true);
    filtersOnOpen.current = filters.map((f) => ({ ...f }));
  };

  const handleClose = () => {
    searchText.current = "";
    setOpenModal(false);
  };

  const handleOk = () => {
    const checked = filters.filter(({ checked }) => checked);
    setSelected(checked.map(({ name }) => name));
    onClose();
    handleClose();
  };

  const handleDismiss = () => {
    onDismiss(filtersOnOpen.current.map((f) => ({ ...f })));
    handleClose();
  };

  const handleSearchChange = (value: string) => {
    searchText.current = value;
    const insensitive = value.toLowerCase();
    setFilteredBySearch(
      filters.filter(({ name }) => name.toLowerCase().startsWith(insensitive))
    );
  };

  return (
    <>
      <IonItem onClick={handleOpen} lines="none" className="filter-item">
        <IonIcon icon={icon} slot="start" />
        <IonLabel
          color="dark"
          position={selected.length > 0 ? "floating" : "fixed"}
        >
          {t(label)}
        </IonLabel>
        <IonInput value={selected.join(", ")} readonly />
        <IonIcon icon={caretDown} slot="end" className="caret-icon" />
      </IonItem>

      <IonModal
        isOpen={openModal}
        onDidDismiss={handleClose}
        className="searchable-filter-modal"
      >
        <SelectToolbar
          titleText={titleText}
          onOk={handleOk}
          onDismiss={handleDismiss}
        />

        <AppSearchbar
          value={searchText.current}
          onSearchChange={handleSearchChange}
        />

        <main className="filters-container">
          {filteredBySearch.map((filter: BroadcastSelect) => (
            <IonItem
              key={filter.name}
              style={{ display: filter.show ? "block" : "none" }}
              color="light"
            >
              <IonCheckbox
                checked={filter.checked}
                onIonChange={(e) => (filter.checked = e.detail.checked)}
                slot="start"
              />
              <IonLabel>{filter.name}</IonLabel>
            </IonItem>
          ))}
        </main>

        <IonToolbar color="light">
          <IonButtons slot="end">
            <IonButton onClick={onClear}>{t("filter.clear")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonModal>
    </>
  );
};

export default BroadcastFilter;
