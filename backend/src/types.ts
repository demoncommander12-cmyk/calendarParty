export interface Slot {
  id: number;
  weekday: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Exception {
  id: number;
  slot_id: number;
  exception_date: string; // YYYY-MM-DD format
  type: 'update' | 'delete';
  start_time?: string;
  end_time?: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SlotWithDate {
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