import BaseService from "./BaseService";
import { StreamSnapshot } from "../shared/types";

export class StreamSnapshotService extends BaseService {
  static getSnapshots(id: (number | string)[]) {
    return this.get<StreamSnapshot[]>(`/shared-streams-snapshots?id=${id}`);
  }
}
