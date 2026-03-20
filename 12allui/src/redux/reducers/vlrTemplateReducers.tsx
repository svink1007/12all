import {
  ADD_VLR_TEMPLATE,
  PATCH_SELECTED_VLR_TEMPLATE,
  PATCH_SELECTED_VLR_TEMPLATE_SCHEDULE,
  RESET_SELECTED_VLR_TEMPLATE,
  SET_SELECTED_VLR_TEMPLATE,
  SET_VLR_TEMPLATES
} from '../shared/constants';
import {Action, VlrTemplateRedux} from '../shared/types';
import {SelectedVlrTemplate, VlrTemplate, VlrTemplateSchedule} from '../../shared/types';
import {API_URL} from '../../shared/constants';
import {LivingRoomMode} from '../../pages/WatchParty/enums';

const ONE_HOUR_IN_MS = 3600000;

const selectedInitial: SelectedVlrTemplate = {
  id: 0,
  channelName: '',
  customStreamUrl: null,
  description: null,
  genre: null,
  language: null,
  logoUrl: null,
  mode: LivingRoomMode.Public,
  share: null,
  showCustomStream: false,
  streamId: null,
  streamUrl: null,
  useMedia: false,
  roomResolution: null,
  logo: null,
  room: {
    id: 0,
    publicId: '',
    roomId: ''
  },
  schedule: {
    show: false,
    date: null,
    participants: [],
    duration: ONE_HOUR_IN_MS
  }
};

const INITIAL: VlrTemplateRedux = {
  templates: [],
  selected: selectedInitial
};

export default function reducer(state = INITIAL, {
  type,
  payload
}: Action<VlrTemplate | VlrTemplate[] | SelectedVlrTemplate | VlrTemplateSchedule>): VlrTemplateRedux {
  switch (type) {
    case SET_VLR_TEMPLATES:
      return {
        ...state,
        templates: (payload as VlrTemplate[]).map(p => ({...p}))
      };
    case ADD_VLR_TEMPLATE:
      return {
        ...state,
        templates: [(payload as VlrTemplate), ...state.templates]
      };
    case SET_SELECTED_VLR_TEMPLATE:
      const {
        id,
        channel_name,
        description,
        genre,
        language,
        use_media,
        mode,
        custom_stream_url,
        show_custom_stream,
        share,
        logo,
        stream,
        vlr,
        room_resolution,
        show_schedule,
        schedule_date,
        schedule_participants,
        schedule_duration
      } = payload as VlrTemplate;

      return {
        ...state,
        selected: {
          id,
          channelName: channel_name,
          description,
          genre,
          language,
          useMedia: use_media || false,
          mode,
          customStreamUrl: custom_stream_url,
          showCustomStream: show_custom_stream || false,
          share,
          logo,
          logoUrl: logo?.url ? `${API_URL}${logo.url}` : null,
          streamId: stream?.id || null,
          streamUrl: stream?.url || null,
          roomResolution: room_resolution,
          room: {
            id: vlr.id,
            publicId: vlr.public_id,
            roomId: vlr.room_id
          },
          schedule: {
            show: show_schedule || false,
            participants: schedule_participants ? schedule_participants.split(',') : [],
            date: schedule_date,
            duration: schedule_duration || ONE_HOUR_IN_MS
          }
        }
      };
    case PATCH_SELECTED_VLR_TEMPLATE:
      return {
        ...state,
        selected: {...state.selected, ...payload}
      };
    case PATCH_SELECTED_VLR_TEMPLATE_SCHEDULE:
      return {
        ...state,
        selected: {
          ...state.selected,
          schedule: {
            ...state.selected.schedule,
            ...(payload as VlrTemplateSchedule),
            duration: (payload as VlrTemplateSchedule).duration || ONE_HOUR_IN_MS
          }
        }
      };
    case RESET_SELECTED_VLR_TEMPLATE:
      return {
        ...state,
        selected: selectedInitial
      };
    default:
      return state;
  }
}
