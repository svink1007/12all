import { BillingServices } from "../services/BillingServices";
import { PAYMENT_BACKEND_URL, PAYMENT_URL } from "./constants";

export const callPaymentMethod = (config: any) => {
  const modifyConfig = {
    ...config,
    backendUrl: `${PAYMENT_BACKEND_URL}/backend`,
    logoUrl: "https://12all.tv/assets/icon/12all-header.png",
    itemImgUrl: "https://12all.tv/assets/icon/stars.png",
    cssUrl: "https://12all.tv/assets/css/styles.css",
  };

  console.log("modifyConfig", modifyConfig);

  const jsonString = JSON.stringify(modifyConfig);
  const encodedData = encodeURIComponent(jsonString);
  const url = `${PAYMENT_URL}/payment?config=${encodedData}`;

  console.log("url", url);

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.click();
};

export const callCashoutMethod = (config: any) => {
  const modifyConfig = {
    ...config,
    backendUrl: `${PAYMENT_BACKEND_URL}/backend`,
    logoUrl: "https://12all.tv/assets/icon/12all-header.png",
    itemImgUrl: "https://12all.tv/assets/icon/stars.png",
  };

  console.log("modifyConfig cashout", modifyConfig);

  const jsonString = JSON.stringify(modifyConfig);
  const encodedData = encodeURIComponent(jsonString);
  const url = `${PAYMENT_URL}/cash-out?config=${encodedData}`;

  console.log("url", url);

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.click();
};

export const updateStarsBalance = (userId: number) => {
  const result = BillingServices.billingStarBalance(userId).then(({ data }) => {
    return data;
  });

  return result;
};
