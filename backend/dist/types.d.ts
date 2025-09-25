export interface Slot {
    id: number;
    weekday: number;
    start_time: string;
    end_time: string;
    title?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Exception {
    id: number;
    slot_id: number;
    exception_date: string;
    type: 'update' | 'delete';
    start_time?: string;
    end_time?: string;
    title?: string;
    created_at: Date;
    updated_at: Date;
}
export interface SlotWithDate {
    id: number;
    date: string;
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
//# sourceMappingURL=types.d.ts.map