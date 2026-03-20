import { useEffect } from "react";
import { AdMob } from "@capacitor-community/admob";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";

const useInitAdmob = () => {
  const { ownedProduct } = useSelector(
    ({ inAppProduct }: ReduxSelectors) => inAppProduct
  );
  const { premium } = useSelector(({ profile }: ReduxSelectors) => profile);

  useEffect(() => {
    if (!ownedProduct && !premium) {
      const init = async () => {
        await AdMob.initialize({
          // initializeForTesting: true
        });
      };

      init().catch((err) => {
        console.error(err);
      });
    }
  }, [ownedProduct, premium]);
};

export default useInitAdmob;
