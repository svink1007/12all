import React, {FC, FormEvent, useState} from 'react';
import './styles.scss';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';
import {useDispatch} from 'react-redux';
import {Routes} from '../../shared/routes';
import {setErrorToast, setInfoToast} from '../../redux/actions/toastActions';
import {AuthService} from '../../services';

const BACKGROUND_COLOR = 'secondary';

const ResetPasswordPage: FC<RouteComponentProps> = ({history, location}: RouteComponentProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [password, setPassword] = useState<string>();
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = new URLSearchParams(location.search).get('code');

    if (!code) {
      dispatch(setErrorToast('resetPassword.invalidCode'));
      return;
    }

    if (!password || !passwordConfirmation || password !== passwordConfirmation) {
      dispatch(setErrorToast('resetPassword.invalidPasswords'));
      return;
    }

    setSubmitting(true);

    AuthService.resetPassword({code, password, passwordConfirmation})
      .then(() => {
        dispatch(setInfoToast('resetPassword.passwordReset'));
        setSubmitting(false);
        history.replace(Routes.Login);
      })
      .catch((error: any) => {
        if (error.response.data?.data?.length && error.response.data.data[0].messages.length) {
          let toastError = 'unexpectedError';
          switch (error.response.data.data[0].messages[0].id) {
            case 'Auth.form.error.code.provide':
              toastError = 'invalidCode';
              break;
            case 'Auth.form.error.password.matching':
              toastError = 'invalidPasswords';
              break;
            case 'Auth.form.error.params.provide':
              toastError = 'invalidParams';
              break;
          }

          dispatch(setErrorToast(`resetPassword.${toastError}`));
          setSubmitting(false);
        }
      });
  };

  return (
    <Layout className="center">
      <IonCard color={BACKGROUND_COLOR} className="reset-password-container">
        <IonCardHeader>
          <IonCardTitle>{t('resetPassword.header')}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <form noValidate onSubmit={handleSubmit}>
            <IonItem color={BACKGROUND_COLOR}>
              <IonLabel position="stacked">
                {t('resetPassword.newPassword')}
              </IonLabel>
              <IonInput
                type="password"
                name="password"
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                required
                value={password}
                onIonChange={({detail: {value}}) =>
                  setPassword(value ? value.trim() : '')
                }
              />
            </IonItem>
            <IonItem color={BACKGROUND_COLOR}>
              <IonLabel position="stacked">
                {t('resetPassword.confirmPassword')}
              </IonLabel>
              <IonInput
                type="password"
                name="passwordConfirmation"
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                required
                value={passwordConfirmation}
                onIonChange={({detail: {value}}) =>
                  setPasswordConfirmation(value ? value.trim() : '')
                }
              />
            </IonItem>

            <IonButton
              type="submit"
              disabled={!password || !passwordConfirmation || password !== passwordConfirmation || submitting}
            >
              {t('common.submit')}
            </IonButton>
            <IonButton type="button" color="dark" onClick={() => history.replace(Routes.Home)}>
              {t('common.cancel')}
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>
    </Layout>
  );
};

export default ResetPasswordPage;
