// hooks/useVodNavigation.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { ReduxSelectors } from '../redux/shared/types';
import { Routes } from '../shared/routes';
import { BillingServices } from '../services';
import { setErrorToast } from '../redux/actions/toastActions';
import { setEnableRewardPopup, setOpenChannelDirectStream } from '../redux/actions/billingRewardActions';

interface VodNavigationParams {
  vodId: number;
  vodStarsAmount: number;
}

export const useVodNavigation = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { isAnonymous, jwt, id: userId } = profile;

  const validateProfile = useCallback(() => {
    if (!profile.nickname && !profile.phoneNumber) {
      dispatch(setErrorToast("Nickname or Phone Number is required"));
      return false;
    }
    
    if (!profile.nickname && (profile.phoneNumber && !profile.hasConfirmedPhoneNumber)) {
      dispatch(setErrorToast("Phone Number must be confirmed"));
      return false;
    }
    
    return profile.nickname || (profile.phoneNumber && profile.hasConfirmedPhoneNumber);
  }, [profile, dispatch]);

  const handleBillingCheck = useCallback(async (vodId: number, vodStarsAmount: number) => {
    try {
      const result = await BillingServices.isRoomPaid(userId, vodId.toString()+'_vod');
      
      if (!result.data.result?.paid) {
        if (isAnonymous || !jwt) {
          dispatch(setEnableRewardPopup({
            openPaidStreamAnon: true,
          }));
        } else {
          dispatch(setOpenChannelDirectStream({
            enablePopup: { openChannelDirectStream: true },
            channelCostDescription: {
              channelCost: vodStarsAmount.toString(),
              streamId: 0,
              vodId: vodId
            },
          }));
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking room payment status:", error);
      return false;
    }
  }, [userId, isAnonymous, jwt, dispatch]);

  const navigateToVod = useCallback(async ({ vodId, vodStarsAmount }: VodNavigationParams) => {

    // If the content is paid, check the payment status
    if (vodStarsAmount > 0) {
      const isPaid = await handleBillingCheck(vodId, vodStarsAmount);
      
      // If the user has paid and is not anonymous, redirect to the stream
      if (isPaid && jwt && !isAnonymous) {
        history.push(`${Routes.VodChannel}/vod/${vodId}`);
      }
    }else{
      history.push(`${Routes.VodChannel}/vod/${vodId}`);
    }
  }, [history, handleBillingCheck, jwt, isAnonymous]);

  const handleVodRedirection = useCallback(async ({ vodId, vodStarsAmount }: VodNavigationParams) => {
    if (userId === 0 || isAnonymous || validateProfile()) {
      await navigateToVod({ vodId, vodStarsAmount });
    }
  }, [userId, isAnonymous, validateProfile, navigateToVod]);

  return {
    // Navigation
    handleVodRedirection,
    validateProfile,
    // Profile data
    profile,
    isAnonymous,
    jwt,
    userId
  };
};
