import BaseService from "./BaseService";
import { GenreDb } from "../shared/types";

export default class GenreService extends BaseService {
  static getGenres() {
    return this.get<GenreDb[]>("/genres");
  }
}
