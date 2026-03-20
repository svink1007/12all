import React, {FC, FormEvent, useState} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, IonIcon,
  IonInput,
  IonItem,
  IonLabel, IonLoading, IonTitle
} from '@ionic/react';
import {RouteComponentProps, useParams} from 'react-router';
import {useDispatch} from 'react-redux';
import {Routes} from '../../shared/routes';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {AuthService, BillingServices, SkipLogin, UserManagementService} from '../../services';
import crossIcon from "../../images/icons/cross.svg";
import {key, person, personCircleOutline} from "ionicons/icons";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";
import SelectCountryCode from "../Login_v2/SelectInputCountry";
import {Profile} from "../../redux/shared/types";
import {setLogin} from "../../redux/actions/profileActions";
import appStorage, {StorageKey} from "../../shared/appStorage";
import LocationState from "../../models/LocationState";
import {setDailyVisitReward, setEnableRewardPopup, setTotalStarBalance} from "../../redux/actions/billingRewardActions";
import {updateStarsBalance} from "../../shared/helpers";

const BACKGROUND_COLOR = 'secondary-new';

type RouteParams = {
  next: string;
};

const ResetCodePage: FC<RouteComponentProps> = ({history, location}: RouteComponentProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [submitting, setSubmitting] = useState<boolean>(false);

  const saveProfile = ({ data }: any) => {
    const loginData: Profile = {
      jwt: data.response.jwt,
      id: data.response.user.id,
      email: data.response.user.email,
      nickname: data.response.user.nickname || data.response.user.username,
      firstName: data.response.user.first_name,
      lastName: data.response.user.last_name,
      phoneNumber: data.response.user.phone_number,
      preferredLanguage: data.response.user.preferred_language,
      preferredGenre: data.response.user.preferred_genre,
      isOverEighteen: data.response.user.has_confirmed_is_over_eighteen,
      hasConfirmedPhoneNumber: data.response.user.has_confirmed_phone_number,
      showDebugInfo: data.response.user.show_debug_info || false,
      isAnonymous: data.response.user.isAnonymous || false,
      avatar: data.response.user.avatar,
    };

    dispatch(setLogin(loginData));
    appStorage.setObject(StorageKey.Login, { jwt: data.response.jwt });
    const state = location.state as LocationState | undefined;

    // billing:
    const currClientDate = new Date().toJSON();
    const eventType = "site.opened";

    if (!loginData.isAnonymous && loginData.jwt) {
      BillingServices.billingEvent(
          currClientDate,
          loginData.id,
          eventType
      ).then(async ({ data: { result } }) => {
        dispatch(setDailyVisitReward(result));
        if (result.billingReward.creditedStars) {
          const starsBalance = await updateStarsBalance(loginData.id);
          dispatch(setTotalStarBalance(starsBalance));
          dispatch(setEnableRewardPopup({ dailyVisitReward: true }));
        }
      });
    }

    if (next) {
      history.replace(next);
    } else {
      history.replace(Routes.Home);
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get('next');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nickname) {
      dispatch(setErrorToast("Please provide a nickname"));
      return;
    }

    try {
      setSubmitting(true);
      const response = await SkipLogin.getLogin(nickname);
      if (response.data.status === "ok") {
        saveProfile(response);
      }
      else{
        dispatch(setErrorToast(response.data.message));
      }
    } catch (err) {
      dispatch(setErrorToast("login.invalid"));
    }

    setSubmitting(false);
  };

  const [nickname, setNickname] = useState("");

  return (
      <Layout className="center">
        <IonCard color={BACKGROUND_COLOR} className="skip-container">

          <IonButton
              color="transparent"
              className="ion-transparent-button"
              onClick={() => {
                history.replace(Routes.Login);
              }}
          >
            <IonIcon slot="icon-only" color="white" icon={crossIcon} />
          </IonButton>

          <IonCardHeader>
            <IonCardTitle>{t('login.set_nickname_title')}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>

            <div className={"icon-block"}>
              <IonIcon icon={person} color="dark"/>
            </div>

            <form noValidate onSubmit={handleSubmit}>

              <div className="flex flex-col my-6 gap-1.5">
                <p className="text-sm">{t('login.nickname')}</p>
                <div className="flex items-center justify-center h-[50px] gap-2">
                  <input
                      className="flex-1 h-12 bg-white border text-[#a5a5a5] rounded pl-2"
                      name="phoneNumber"
                      onChange={(e) => setNickname(e.target.value)}
                      value={nickname}
                  />
                </div>
              </div>

              <IonLoading isOpen={submitting} />

              <IonButton
                  type="submit"
                  style={{ width: '100%', height: '50px', marginBottom: '5px' }}
                  disabled={!nickname  || submitting}
              >
                {t('common.submit')}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </Layout>
  );
};

export default ResetCodePage;
