import VertoSession from "../../verto/VertoSession";
import {Vlr} from "../../shared/types";
import {Participant} from "../../verto/models";

export const VERTOSESSION = 'UPDATE_VERTO';

export const setupVerto = (payload: Partial<{ session: VertoSession; vlr: string; participants: Participant[] }>) => ({
    type: VERTOSESSION,
    payload,
});


