import { nanoid } from "nanoid";
import appStorage, { StorageKey } from "../shared/appStorage";

export interface SkipLoginData {
  uniqueToken: string;
  nickname: string;
}

export const generateUniqueToken = (): string => {
  return nanoid(32); // Generate a 32-character unique token
};

export const getStoredSkipLoginData = async (): Promise<SkipLoginData | null> => {
  try {
    const data = await appStorage.getObject(StorageKey.SkipLogin);
    return data as SkipLoginData | null;
  } catch (error) {
    console.error('Error getting stored skip login data:', error);
    return null;
  }
};

export const storeSkipLoginData = async (data: SkipLoginData): Promise<void> => {
  try {
    await appStorage.setObject(StorageKey.SkipLogin, data);
  } catch (error) {
    console.error('Error storing skip login data:', error);
  }
};

export const clearSkipLoginData = async (): Promise<void> => {
  try {
    await appStorage.removeItem(StorageKey.SkipLogin);
  } catch (error) {
    console.error('Error clearing skip login data:', error);
  }
};
