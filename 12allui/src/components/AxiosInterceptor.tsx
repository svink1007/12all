import {FC, useEffect} from 'react';
import axios, {AxiosResponse} from 'axios';
import {useHistory} from 'react-router-dom';
import {Routes} from '../shared/routes';
import {useDispatch} from 'react-redux';
import {setErrorToast} from '../redux/actions/toastActions';
import {setLogout} from '../redux/actions/profileActions';
import appStorage, {StorageKey} from '../shared/appStorage';

const AxiosInterceptor: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error?.response?.status === 401) {
          history.replace(Routes.Login);
          dispatch(setErrorToast('login.sessionExpired'));
          dispatch(setLogout());
          appStorage.removeItem(StorageKey.Login);
        }
        return Promise.reject(error);
      }
    );
  }, [dispatch, history]);

  return null;
};

export default AxiosInterceptor;
