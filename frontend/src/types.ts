export interface Slot {
  id: number;
  date: string; // YYYY-MM-DD format
  weekday: number;
  start_time: string;
  end_time: string;
  title?: string;
  is_exception: boolean;
  original_slot_id?: number;
}

export interface CreateSlotRequest {
  weekday: number;
  start_time: string;
  end_time: string;
  title?: string;
}

export interface UpdateSlotRequest {
  start_time?: string;
  end_time?: string;
  title?: string;
}