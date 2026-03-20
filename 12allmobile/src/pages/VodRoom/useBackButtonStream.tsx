import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";

const useBackButtonStream = (listener: () => void) => {
  useIonViewWillEnter(() => {
    document.addEventListener("ionBackButton", listener);
  }, [listener]);

  useIonViewWillLeave(() => {
    document.addEventListener("ionBackButton", listener);
  }, [listener]);
};

export default useBackButtonStream;
