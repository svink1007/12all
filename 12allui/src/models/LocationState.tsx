type LocationStateParams = {
  redirectTo: string;
}

export default class LocationState {
  redirectTo: string;

  constructor({redirectTo}: LocationStateParams) {
    this.redirectTo = redirectTo;
  }
}
