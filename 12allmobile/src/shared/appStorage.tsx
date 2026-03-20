import { Preferences } from "@capacitor/preferences";

export enum StorageKey {
  Login = "login",
  Token = "token",
  SkipLogin = "skipLogin",
}

const appStorage = {
  async setObject(key: string, obj: Object) {
    await Preferences.set({
      key,
      value: JSON.stringify(obj),
    });
  },
  async getObject(key: string) {
    const ret = await Preferences.get({ key });
    if (ret.value === null) return null;
    return JSON.parse(ret.value);
  },
  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  },
  async getItem(key: string) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async removeItem(key: string) {
    await Preferences.remove({ key });
  },
  async keys() {
    const { keys } = await Preferences.keys();
    return keys;
  },
  async clear() {
    await Preferences.clear();
  },
};

export default appStorage;
