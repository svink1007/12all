export enum StorageKey {
  Login = 'login'
}

const appStorage = {
  setObject(key: string, obj: Object) {
    localStorage.setItem(key, JSON.stringify(obj));
  },
  getObject(key: string) {
    const ret = localStorage.getItem(key);
    return ret === null ? null : JSON.parse(ret);
  },
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  getItem(key: string) {
    return localStorage.getItem(key);
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}

export default appStorage;
