import appStorage, { StorageKey } from "../shared/appStorage";
import BaseService from "../services/BaseService";

export const checkIfLoggedIn = async () => {
  try {
    const authData = await appStorage.getObject(StorageKey.Login);
    return (
      authData && authData.jwtToken && !BaseService.isExpired(authData.jwtToken)
    );
  } catch (error) {
    console.error("Error checking login status", error);
    return false;
  }
};
