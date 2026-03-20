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
import {RouteComponentProps} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {Routes} from '../../shared/routes';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {AuthService, UserManagementService} from '../../services';
import crossIcon from "../../images/icons/cross.svg";
import {key, personCircleOutline} from "ionicons/icons";
import GoogleRecaptchaV3 from "../../components/RecaptchaV3";
import SelectCountryCode from "../Login_v2/SelectInputCountry";
import {ReduxSelectors} from "../../redux/shared/types";
import { useLocation } from "react-router-dom";

const BACKGROUND_COLOR = 'secondary-new';

const ResetCodePage: FC<RouteComponentProps> = ({history, location}: RouteComponentProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const isResend = searchParams.get("resend");

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!isRecaptchaVerified || !recaptchaToken) {
    //   dispatch(setErrorToast("Please check the recaptcha"));
    //   return;
    // }
    setSubmitting(true);

    let status = await UserManagementService.sendConfirmationCode(profile.phoneNumber, recaptchaToken, false);
    if (status.data.status === "ok") {
      setCountryCode("");
      setInputData({ ...inputData, identifier: "" });
      history.replace(Routes.changePassword);
    }
    else{
      dispatch(setErrorToast("phoneNumberValidation.invalidNumber"));
    }

    setSubmitting(false);
  };

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isRecaptchaVerified, setIsRecaptchaVerified] =
      useState<boolean>(false);

  const [countryCode, setCountryCode] = useState("");
  const [inputData, setInputData] = useState({
    identifier: "",
  });

  const onChange = (e: any) => {
    if (e.target.name === "phoneNumber") {
      setInputData({ ...inputData, identifier: e.target.value });
    } else {
      setInputData({ ...inputData, [e.target.name]: e.target.value });
    }
  };

  return (
    <Layout className="center">
      <IonCard color={BACKGROUND_COLOR} className="change-password-container">

        <IonButton
            color="transparent"
            className="ion-transparent-button"
            onClick={() => {
              history.goBack();
            }}
        >
          <IonIcon slot="icon-only" color="white" icon={crossIcon} />
        </IonButton>

        <IonCardHeader>
          <IonCardTitle><b className={"text-white"}>{t('resetPassword.title')}</b></IonCardTitle>
        </IonCardHeader>

        <IonCardContent>

          <div className={"icon-block"}>
            <IonIcon icon={key} color="dark"/>
          </div>

          <form noValidate onSubmit={handleSubmit}>

            <div className="flex text-center flex-col gap-1.5 my-4">
              An OTP Code will be sent on this number <b className={"text-white"}>+{profile.phoneNumber}</b> to reset your password
            </div>

            <div className="flex justify-center my-6">
              {/*<GoogleRecaptchaV3*/}
              {/*    setIsRecaptchaVerified={setIsRecaptchaVerified}*/}
              {/*    setRecaptchaToken={setRecaptchaToken}*/}
              {/*/>*/}

              {/*<span className={"mt-4 text-[#ff0000]"}>{(!isRecaptchaVerified) ? "Recaptcha Code Expired" : ""}</span>*/}
            </div>

            <IonLoading isOpen={submitting}/>

            <div className="flex justify-center my-6">
              <IonButton
                  type="submit"
                  // disabled={!recaptchaToken || submitting}
                  disabled={submitting}
              >
                {isResend ? "Resend OTP Code" : "Get OTP Code"}
              </IonButton>
              <IonButton type="button" color="dark" onClick={() => history.replace(Routes.Home)}>
                {t('common.cancel')}
              </IonButton>
            </div>

          </form>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default ResetCodePage;
