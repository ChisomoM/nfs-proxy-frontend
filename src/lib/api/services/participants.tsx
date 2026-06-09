import type { CreateParticipantInput, Participant } from "@/types/participant";
import { list, post, remove, retrieve, update } from "../crud";

// Participant Service (Admin)
export const ParticipantService = {
  // Get all participants
  async getParticipants(): Promise<Participant[]> {
    const response = await list("LIST_PARTICIPANTS");
    return response.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // Get single participant
  async getParticipant(id: string): Promise<Participant> {
    const p = await retrieve("GET_PARTICIPANT", { id });
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    };
  },

  // Create participant
  async createParticipant(input: CreateParticipantInput): Promise<Participant> {
    const response = await post("CREATE_PARTICIPANT", input);
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      participant_id: response.participant_id,
      logo: response.logo,
      is_active: response.is_active,
      created_at: response.created_at,
    };
  },

  // Update participant
  async updateParticipant(id: string, input: Partial<CreateParticipantInput>): Promise<Participant> {
    const response = await update("UPDATE_PARTICIPANT", input, { id });
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      participant_id: response.participant_id,
      logo: response.logo,
      is_active: response.is_active,
      created_at: response.created_at,
    };
  },

  // Archive participant
  async archiveParticipant(id: string): Promise<void> {
    await remove("ARCHIVE_PARTICIPANT", { id });
  },
};

// App Participant Service (Merchant)
export const AppParticipantService = {
  // List all active participants available system-wide
  async listAllParticipants(): Promise<Participant[]> {
    const response = await retrieve("LIST_AVAILABLE_PARTICIPANTS");
    return (response.participants || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // List participants for an app
  async listAppParticipants(appId: string): Promise<Participant[]> {
    const response = await retrieve("LIST_APP_PARTICIPANTS", { app_id: appId });
    return response.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // Add participant to app
  async addParticipant(appId: string, participantId: string): Promise<void> {
    await post("ADD_APP_PARTICIPANT", { participant_id: participantId }, { app_id: appId });
  },

  // Remove participant from app
  async removeParticipant(appId: string, participantId: string): Promise<void> {
    await remove("REMOVE_APP_PARTICIPANT", { app_id: appId, participant_id: participantId });
  },
};