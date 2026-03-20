import React, { FC, useCallback, useState } from "react";
import "./styles.scss";
import { RouteComponentProps } from "react-router";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";
import ContactService from "../../services/ContactService";
import Layout from "../../components/Layout";
import { useTranslation } from "react-i18next";
import { syncOutline } from "ionicons/icons";
import { ContactPayload } from "@capacitor-community/contacts/dist/esm/definitions";
import axios, { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { setErrorToast } from "../../redux/actions/toastActions";

const ShowContact: FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState<ContactPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getCommonContacts = useCallback(() => {
    setLoading(true);
    ContactService.verifyContactsFromServer()
      .then(setContacts)
      .catch((error: any | AxiosError) => {
        if (axios.isAxiosError(error)) {
          dispatch(
            setErrorToast(
              `${t("contacts.errorGettingContacts")} ${error.response ? `(${error.response.status})` : ""}`
            )
          );
        } else {
          dispatch(
            setErrorToast(error.message || "notifications.unexpectedError")
          );
        }
      })
      .finally(() => setLoading(false));
  }, [t, dispatch]);

  useIonViewWillEnter(() => {
    getCommonContacts();
  }, [getCommonContacts]);

  return (
    <Layout showGoBack showMenuBtn cssContent="contacts-page">
      <IonItem className="update-contacts" lines="none" color="light">
        <IonButton slot="end" onClick={getCommonContacts} disabled={loading}>
          {loading ? (
            <IonSpinner slot="start" />
          ) : (
            <IonIcon icon={syncOutline} />
          )}{" "}
          <IonText>{t("contacts.updateContacts")}</IonText>
        </IonButton>
      </IonItem>

      {contacts.length > 0 ? (
        <IonList>
          {contacts.map(({ name, phones, contactId }: ContactPayload) => (
            <IonItem key={contactId}>
              <IonLabel>
                <h2>{name?.display}</h2>
                <h3>{phones && phones[0].number}</h3>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <IonItem lines="none">
          <IonText>{t("contacts.noCommonContacts")}</IonText>
        </IonItem>
      )}
    </Layout>
  );
};

export default ShowContact;
