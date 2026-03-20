import BaseService from './BaseService';
import {CreateVlrSchedule, VlrScheduleDTO, VlrScheduleDuration} from '../shared/types';

export class VlrScheduleService extends BaseService {
  static getScheduledRooms() {
    return this.getWithAuth<VlrScheduleDTO[]>('/vlr-schedules');
  }

  static createScheduledRoom(data: CreateVlrSchedule) {
    return this.postWithAuth<VlrScheduleDTO>('/vlr-schedules', data);
  }

  static updateScheduledRoom(id: number, data: CreateVlrSchedule) {
    return this.putWithAuth<VlrScheduleDTO>(`/vlr-schedules/${id}`, data);
  }

  static removeScheduledRoom(id: number) {
    return this.deleteWithAuth<VlrScheduleDTO>(`/vlr-schedules/${id}`);
  }

  static getDurations() {
    return this.get<VlrScheduleDuration[]>('/vlr-schedule-durations');
  }
}
