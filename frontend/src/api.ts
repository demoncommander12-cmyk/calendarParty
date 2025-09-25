import axios from 'axios';
import { Slot, CreateSlotRequest, UpdateSlotRequest } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const slotsApi = {
  // Get slots for a specific week
  getSlotsForWeek: async (weekStart: string): Promise<Slot[]> => {
    const response = await api.get(`/slots?weekStart=${weekStart}`);
    return response.data;
  },

  // Create a new recurring slot
  createSlot: async (slotData: CreateSlotRequest): Promise<Slot> => {
    const response = await api.post('/slots', slotData);
    return response.data;
  },

  // Update a slot for a specific date
  updateSlotForDate: async (slotId: number, date: string, updateData: UpdateSlotRequest): Promise<void> => {
    await api.put(`/slots/${slotId}?date=${date}`, updateData);
  },

  // Delete a slot for a specific date
  deleteSlotForDate: async (slotId: number, date: string): Promise<void> => {
    await api.delete(`/slots/${slotId}?date=${date}`);
  },

  // Delete entire recurring slot
  deleteSlot: async (slotId: number): Promise<void> => {
    await api.delete(`/slots/${slotId}`);
  },
};

export default api;