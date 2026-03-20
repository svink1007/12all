import BaseService from "./BaseService";
import { RoomLayout } from "../shared/types";

export class RoomLayoutService extends BaseService {
  static getLayouts() {
    return this.get<RoomLayout[]>("/room-layouts");
  }

  static getDefaultLayout() {
    return this.get<RoomLayout>("/default-room-layout");
  }
}
