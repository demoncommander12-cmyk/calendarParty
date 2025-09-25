import { Slot, SlotWithDate, CreateSlotRequest, UpdateSlotRequest } from './types';
export declare class SchedulerService {
    getSlotsForWeek(weekStart: string): Promise<SlotWithDate[]>;
    createSlot(slotData: CreateSlotRequest): Promise<Slot>;
    updateSlotForDate(slotId: number, date: string, updateData: UpdateSlotRequest): Promise<void>;
    deleteSlotForDate(slotId: number, date: string): Promise<void>;
    deleteSlot(slotId: number): Promise<void>;
}
//# sourceMappingURL=schedulerService.d.ts.map