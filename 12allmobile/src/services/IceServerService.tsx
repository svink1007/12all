import BaseService from "./BaseService";
import { IceServer } from "../shared/types";

export class IceServerService extends BaseService {
  static getIceServers() {
    return this.get<IceServer[]>("/ice-servers");
  }
}
