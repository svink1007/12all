import BaseService from "./BaseService";
import { CountryResponse } from "../shared/types";

export default class CountryService extends BaseService {
  static getCountries() {
    return this.get<CountryResponse[]>("/countries");
  }
}
