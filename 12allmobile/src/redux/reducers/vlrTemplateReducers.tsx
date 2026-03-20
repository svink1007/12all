import {
  ADD_VLR_TEMPLATE,
  PATCH_SELECTED_VLR_TEMPLATE,
  RESET_SELECTED_VLR_TEMPLATE,
  SET_SELECTED_VLR_TEMPLATE,
  SET_VLR_TEMPLATES,
} from "../types/types";
import {
  LivingRoomMode,
  SelectedVlrTemplate,
  VlrTemplate,
} from "../../shared/types";
import { API_URL } from "../../shared/constants";
import { Action, VlrTemplateRedux } from "../types";

const selectedInitial: SelectedVlrTemplate = {
  id: 0,
  channelName: "",
  customStreamUrl: null,
  description: null,
  genre: null,
  language: null,
  logoUrl: null,
  mode: LivingRoomMode.Public,
  share: null,
  showCustomStream: false,
  streamId: null,
  useMedia: false,
  roomResolution: null,
  logo: null,
  room: {
    id: 0,
    publicId: "",
    roomId: "",
  },
};

const INITIAL: VlrTemplateRedux = {
  templates: [],
  selected: selectedInitial,
};

export default function reducer(
  state = INITIAL,
  { type, payload }: Action<VlrTemplate | VlrTemplate[] | SelectedVlrTemplate>
): VlrTemplateRedux {
  switch (type) {
    case SET_VLR_TEMPLATES:
      return {
        ...state,
        templates: (payload as VlrTemplate[]).map((p) => ({ ...p })),
      };
    case ADD_VLR_TEMPLATE:
      return {
        ...state,
        templates: [payload as VlrTemplate, ...state.templates],
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
          roomResolution: room_resolution,
          room: {
            id: vlr.id,
            publicId: vlr.public_id,
            roomId: vlr.room_id,
          },
        },
      };
    case PATCH_SELECTED_VLR_TEMPLATE:
      return {
        ...state,
        selected: { ...state.selected, ...payload },
      };
    case RESET_SELECTED_VLR_TEMPLATE:
      return {
        ...state,
        selected: selectedInitial,
      };
    default:
      return state;
  }
}
