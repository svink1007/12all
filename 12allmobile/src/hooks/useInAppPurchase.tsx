import { useEffect, useRef } from "react";
import {
  IAPError,
  IAPProduct,
  IAPProductOptions,
  InAppPurchase2 as Store,
} from "@ionic-native/in-app-purchase-2";
import { setErrorToast, setInfoToast } from "../redux/actions/toastActions";
import InAppService from "../services/InAppService";
import { useDispatch } from "react-redux";
import {
  removeInAppOwner,
  setInAppProducts,
  updateInAppOwner,
  updateInAppProduct,
} from "../redux/actions/inAppProductActions";
import { StorageData } from "../shared/types";
import { DEBUG_MODE, MOBILE_VIEW } from "../shared/constants";
import { useTranslation } from "react-i18next";

const useInAppPurchase = (storageData: StorageData | null) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (!storageData || (DEBUG_MODE && !MOBILE_VIEW)) {
      return;
    }

    // Store.verbosity = Store.DEBUG;

    Store.validator = (product, callback) => {
      InAppService.verifyTransaction(product as IAPProduct)
        .then(({ data: { ok, data, error } }) => {
          if (ok) {
            callback(true, data);
          } else {
            callback(false, {
              ...data,
              ...error,
            });
          }
        })
        .catch((error: any) => {
          dispatch(setErrorToast(`Failed to purchase: ${error.message}`));
        });
    };
    // Store.validator = 'https://validator.fovea.cc/v1/validate?appName=hub.tv.m12all&apiKey=965f1633-32f8-4d5a-b272-8f2c8de34e97';

    let ownedProduct: IAPProduct | null = null;

    const errorHandler = (error: IAPError) => {
      dispatch(setErrorToast(`Failed to purchase: ${error.message}`));
    };
    const approvedHandler = (product: IAPProduct) => {
      product.verify();
    };
    const verifiedHandler = (product: IAPProduct) => {
      product.finish();
    };
    const updateHandler = (product: IAPProduct) => {
      dispatch(updateInAppProduct(product));
    };
    const ownedHandler = (product: IAPProduct) => {
      ownedProduct = product;
      dispatch(updateInAppOwner(product));
    };
    const handleExpiration = (product: IAPProduct, message: string) => {
      if (ownedProduct?.id === product.id) {
        dispatch(removeInAppOwner());
        dispatch(setInfoToast(message));
        ownedProduct = null;
      }
    };
    const expiredHandler = (product: IAPProduct) => {
      handleExpiration(
        product,
        `${product.title} ${t("premium.expiredNotification")}`
      );
    };
    const cancelledHandler = (product: IAPProduct) => {
      handleExpiration(
        product,
        `${product.title} ${t("premium.cancelledNotification")}`
      );
    };
    const readyHandler = () => {
      const products = Store.products.filter((p) => p.state !== Store.INVALID);
      dispatch(setInAppProducts(products));
    };

    Store.when("product")
      .error(errorHandler)
      .approved(approvedHandler)
      .verified(verifiedHandler)
      .updated(updateHandler)
      .owned(ownedHandler)
      .expired(expiredHandler)
      .cancelled(cancelledHandler);
    Store.ready(readyHandler);

    const init = async () => {
      const { data } = await InAppService.getRegistry();
      const products: IAPProductOptions[] = data.map(
        ({ product_id, code_type }) => ({ id: product_id, type: code_type })
      );
      isRegistered.current = true;
      Store.register(products);
      Store.refresh();
    };

    if (!isRegistered.current) {
      init().catch();
    }

    return () => {
      Store.off(errorHandler);
      Store.off(approvedHandler);
      Store.off(verifiedHandler);
      Store.off(updateHandler);
      Store.off(ownedHandler);
      Store.off(expiredHandler);
      Store.off(cancelledHandler);
      Store.off(readyHandler);
    };
  }, [dispatch, storageData, t]);
};

export default useInAppPurchase;
