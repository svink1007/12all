import { NetworkConfig } from "../redux/types";
import BaseService from "./BaseService";

export default class NetworkService extends BaseService {
  static getNetworkConfig() {
    return this.get<NetworkConfig>("/network-configs");
  }

  static getNetworkUploadSpeed(data: string) {
    return this.post<NetworkConfig>("/network/up-speed", { data });
  }
}
