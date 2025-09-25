import db from './database';
import { Slot, Exception, SlotWithDate, CreateSlotRequest, UpdateSlotRequest } from './types';

export class SchedulerService {
  // Get all slots for a given week
  async getSlotsForWeek(weekStart: string): Promise<SlotWithDate[]> {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Get all recurring slots
    const slots = await db<Slot>('slots').select('*');
    
    // Get all exceptions for this week
    const exceptions = await db<Exception>('exceptions')
      .select('*')
      .whereBetween('exception_date', [weekStart, weekEndDate.toISOString().split('T')[0]]);

    const result: SlotWithDate[] = [];

    // Generate slots for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const weekday = currentDate.getDay();

      // Find recurring slots for this weekday
      const daySlots = slots.filter(slot => slot.weekday === weekday);

      for (const slot of daySlots) {
        // Check if there's an exception for this slot on this date
        const exception = exceptions.find(e => 
          e.slot_id === slot.id && e.exception_date === dateStr
        );

        if (exception) {
          if (exception.type === 'update') {
            // Add the updated slot
            result.push({
              id: slot.id,
              date: dateStr,
              weekday: weekday,
              start_time: exception.start_time!,
              end_time: exception.end_time!,
              title: exception.title || slot.title,
              is_exception: true,
              original_slot_id: slot.id
            });
          }
          // If type is 'delete', don't add the slot
        } else {
          // Add the regular recurring slot
          result.push({
            id: slot.id,
            date: dateStr,
            weekday: weekday,
            start_time: slot.start_time,
            end_time: slot.end_time,
            title: slot.title,
            is_exception: false
          });
        }
      }
    }

    return result.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start_time.localeCompare(b.start_time);
    });
  }

  // Create a new recurring slot
  async createSlot(slotData: CreateSlotRequest): Promise<Slot> {
    // Check if there are already 2 slots for this weekday
    const existingSlots = await db<Slot>('slots')
      .where('weekday', slotData.weekday)
      .count('* as count');
    
    const count = parseInt((existingSlots[0] as any).count);
    if (count >= 2) {
      throw new Error('Maximum 2 slots allowed per weekday');
    }

    const [slot] = await db<Slot>('slots')
      .insert(slotData)
      .returning('*');
    
    return slot;
  }

  // Update a slot for a specific date (creates an exception)
  async updateSlotForDate(slotId: number, date: string, updateData: UpdateSlotRequest): Promise<void> {
    // Verify the slot exists
    const slot = await db<Slot>('slots').where('id', slotId).first();
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Check if there's already an exception for this date
    const existingException = await db<Exception>('exceptions')
      .where('slot_id', slotId)
      .where('exception_date', date)
      .first();

    if (existingException) {
      // Update existing exception
      await db<Exception>('exceptions')
        .where('id', existingException.id)
        .update({
          type: 'update',
          start_time: updateData.start_time || existingException.start_time,
          end_time: updateData.end_time || existingException.end_time,
          title: updateData.title !== undefined ? updateData.title : existingException.title,
          updated_at: new Date()
        });
    } else {
      // Create new exception
      await db<Exception>('exceptions').insert({
        slot_id: slotId,
        exception_date: date,
        type: 'update',
        start_time: updateData.start_time || slot.start_time,
        end_time: updateData.end_time || slot.end_time,
        title: updateData.title !== undefined ? updateData.title : slot.title
      });
    }
  }

  // Delete a slot for a specific date (creates an exception)
  async deleteSlotForDate(slotId: number, date: string): Promise<void> {
    // Verify the slot exists
    const slot = await db<Slot>('slots').where('id', slotId).first();
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Check if there's already an exception for this date
    const existingException = await db<Exception>('exceptions')
      .where('slot_id', slotId)
      .where('exception_date', date)
      .first();

    if (existingException) {
      // Update existing exception to delete
      await db<Exception>('exceptions')
        .where('id', existingException.id)
        .update({
          type: 'delete',
          start_time: undefined,
          end_time: undefined,
          title: undefined,
          updated_at: new Date()
        });
    } else {
      // Create new delete exception
      await db<Exception>('exceptions').insert({
        slot_id: slotId,
        exception_date: date,
        type: 'delete'
      });
    }
  }

  // Delete a recurring slot entirely
  async deleteSlot(slotId: number): Promise<void> {
    const slot = await db<Slot>('slots').where('id', slotId).first();
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Delete the slot (exceptions will be cascade deleted)
    await db<Slot>('slots').where('id', slotId).del();
  }
}