import { FC, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, useParams } from "react-router";
import { IonImg, IonInput, IonItem, IonLabel, IonPage } from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";

import "./JoinWatchPartyPage.scss";
import PrevIcon from "../../images/join-room/prev.svg";
import { ReduxSelectors } from "../../redux/types";
import appStorage from "../../shared/appStorage";
import validateVlr from "../../shared/validateVlr";
import { Routes } from "../../shared/routes";
import { setErrorToast } from "../../redux/actions/toastActions";

const JoinWatchPartyPage: FC<RouteComponentProps> = ({
  history,
  location,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const canEnter = useRef<boolean>(false);
  const loading = useRef<boolean>(false);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const [roomId, setRoomId] = useState<string>(id);

  const validate = useCallback(
    (roomId: string) => {
      loading.current = true;
      validateVlr(roomId, dispatch)
        .then(({ streamId, streamCamera }) => {
          if (streamId) {
            history.push(`${Routes.ProtectedStream}/${streamId}/${roomId}`);
          } else if (streamCamera) {
            history.push(`${Routes.ProtectedStreamCamera}/${roomId}`);
          } else {
            history.push(`${Routes.ProtectedWatchPartyRoom}/${roomId}`);
          }
        })
        .catch((err) => dispatch(setErrorToast(err.message)))
        .finally(() => (loading.current = false));
    },
    [dispatch, history]
  );

  useEffect(() => {
    console.log("ID:", id);
    appStorage.getItem("wpRoomId").then((data) => {
      if (data && !id) {
        setRoomId(data);
        canEnter.current && validate(data);
      }
    });
  }, [id, validate]);

  useEffect(() => {
    canEnter.current = !!new URLSearchParams(location.search).get("enter");
  }, [location.search]);

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("called");

    if (!roomId || loading.current) {
      return;
    }

    // if (!profile.isAuthenticated && !canEnter.current) {
    //   appStorage.setItem("wpRoomId", roomId).then();
    //   // history.push(Routes.ProtectedWatchPartyJoin);
    //   return;
    // }

    validate(roomId);
  };

  return (
    <IonPage>
      <div>
        <div className="mt-4 w-full flex justify-center">
          <IonImg
            src={PrevIcon}
            className="absolute left-6"
            onClick={() => history.goBack()}
          />
          <p>JOIN THE PARTY</p>
        </div>
        <form onSubmit={handleOnSubmit}>
          <IonItem className="mt-20 px-3">
            <IonLabel position="stacked">{t("joinScreen.roomId")}</IonLabel>
            <IonInput
              placeholder={t("joinScreen.typeRoomId")}
              value={roomId}
              onIonChange={(e) =>
                setRoomId(e.detail.value ? e.detail.value.trim() : "")
              }
            />
          </IonItem>
          <button
            className="fixed bottom-4 right-8 w-20 h-20  bg-[#e0007a] border-2 border-solid border-white flex justify-center items-center rounded-full"
            type="submit"
          >
            {t("joinScreen.join")}
          </button>
        </form>
      </div>
    </IonPage>
  );
};

export default JoinWatchPartyPage;
