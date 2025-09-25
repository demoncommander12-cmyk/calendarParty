import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Trash2, Home, Calendar } from 'lucide-react';
import { Slot, CreateSlotRequest, UpdateSlotRequest } from '../types';
import { slotsApi } from '../api';
import {
  getWeekStart,
  formatDateForAPI,
  getWeekDates,
  getNextWeek,
  getPreviousWeek,
  isToday,
  formatTime,
  formatDateDisplay,
  formatMonthYear,
  WEEKDAYS,
  WEEKDAYS_FULL,
} from '../utils/dateUtils';

interface SchedulerProps {}

const Scheduler: React.FC<SchedulerProps> = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [weeks, setWeeks] = useState<Date[]>([getWeekStart(new Date())]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ slotId: number; date: string } | null>(null);
  const [editForm, setEditForm] = useState({ start_time: '', end_time: '', title: '' });

  // Load slots for all weeks
  const loadAllSlots = useCallback(async (weeksList: Date[]) => {
    setLoading(true);
    setError(null);
    try {
      const allSlots: Slot[] = [];
      for (const weekStart of weeksList) {
        const weekStartStr = formatDateForAPI(weekStart);
        const fetchedSlots = await slotsApi.getSlotsForWeek(weekStartStr);
        allSlots.push(...fetchedSlots);
      }
      setSlots(allSlots);
    } catch (err) {
      setError('Failed to load slots');
      console.error('Error loading slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load slots for a single week (for infinite scroll)
  const loadMoreSlots = useCallback(async (weekStart: Date) => {
    setLoadingMore(true);
    try {
      const weekStartStr = formatDateForAPI(weekStart);
      const fetchedSlots = await slotsApi.getSlotsForWeek(weekStartStr);
      setSlots(prev => [...prev, ...fetchedSlots]);
    } catch (err) {
      console.error('Error loading more slots:', err);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // Load more weeks for infinite scroll
  const loadMoreWeeks = useCallback(() => {
    const lastWeek = weeks[weeks.length - 1];
    const nextWeek = getNextWeek(lastWeek);
    setWeeks(prev => [...prev, nextWeek]);
    loadMoreSlots(nextWeek);
  }, [weeks, loadMoreSlots]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (loadingMore) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Load more when user is near the bottom (within 200px)
    if (scrollTop + windowHeight >= documentHeight - 200) {
      loadMoreWeeks();
    }
  }, [loadMoreWeeks, loadingMore]);

  // Load slots when weeks change
  useEffect(() => {
    loadAllSlots(weeks);
  }, [weeks, loadAllSlots]);

  // Add scroll listener for infinite scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = getNextWeek(currentWeekStart);
    setCurrentWeekStart(nextWeek);
    
    // Add the week to the list if it's not already there
    if (!weeks.some(week => week.getTime() === nextWeek.getTime())) {
      setWeeks(prev => [...prev, nextWeek]);
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(prevWeek);
    
    // Add the week to the beginning of the list if it's not already there
    if (!weeks.some(week => week.getTime() === prevWeek.getTime())) {
      setWeeks(prev => [prevWeek, ...prev]);
    }
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: string): Slot[] => {
    return slots.filter(slot => slot.date === date);
  };

  // Handle adding a new slot
  const handleAddSlot = async (date: string, weekday: number) => {
    const dateSlots = getSlotsForDate(date);
    if (dateSlots.length >= 2) {
      alert('Maximum 2 slots allowed per day');
      return;
    }

    try {
      const newSlot: CreateSlotRequest = {
        weekday,
        start_time: '09:00',
        end_time: '10:00',
        title: 'New Slot'
      };

      // Optimistic update
      const optimisticSlot: Slot = {
        id: Date.now(), // temporary ID
        date,
        weekday,
        start_time: '09:00',
        end_time: '10:00',
        title: 'New Slot',
        is_exception: false
      };
      setSlots(prev => [...prev, optimisticSlot]);

      // Create slot on server
      await slotsApi.createSlot(newSlot);
      
      // Reload to get the actual slot with correct ID
      await loadAllSlots(weeks);
    } catch (err) {
      setError('Failed to create slot');
      console.error('Error creating slot:', err);
      // Revert optimistic update
      setSlots(prev => prev.filter(s => s.id !== Date.now()));
    }
  };

  // Handle editing a slot
  const handleEditSlot = (slot: Slot) => {
    setEditingSlot({ slotId: slot.id, date: slot.date });
    setEditForm({
      start_time: formatTime(slot.start_time),
      end_time: formatTime(slot.end_time),
      title: slot.title || ''
    });
  };

  // Handle saving edited slot
  const handleSaveEdit = async () => {
    if (!editingSlot) return;

    try {
      const updateData: UpdateSlotRequest = {
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        title: editForm.title || undefined
      };

      // Optimistic update
      setSlots(prev => prev.map(slot => 
        slot.id === editingSlot.slotId && slot.date === editingSlot.date
          ? { ...slot, ...updateData, is_exception: true }
          : slot
      ));

      // Update on server
      await slotsApi.updateSlotForDate(editingSlot.slotId, editingSlot.date, updateData);
      
      setEditingSlot(null);
      setEditForm({ start_time: '', end_time: '', title: '' });
    } catch (err) {
      setError('Failed to update slot');
      console.error('Error updating slot:', err);
      // Revert optimistic update
      await loadAllSlots(weeks);
    }
  };

  // Handle deleting a slot
  const handleDeleteSlot = async (slot: Slot) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      // Optimistic update
      setSlots(prev => prev.filter(s => !(s.id === slot.id && s.date === slot.date)));

      // Delete on server
      await slotsApi.deleteSlotForDate(slot.id, slot.date);
    } catch (err) {
      setError('Failed to delete slot');
      console.error('Error deleting slot:', err);
      // Revert optimistic update
      await loadAllSlots(weeks);
    }
  };

  const currentMonth = formatMonthYear(currentWeekStart);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button className="p-2">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Your Schedule</h1>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium">{currentMonth}</span>
            <ChevronDown className="w-5 h-5" />
          </div>
          
          <button 
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronDown className="w-5 h-5 -rotate-90" />
          </button>
        </div>

        {/* Current Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {getWeekDates(currentWeekStart).map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{WEEKDAYS[index]}</div>
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                isToday(date) 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700'
              }`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slots List - All Weeks */}
      <div className="max-w-md mx-auto px-4 pb-20">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {weeks.map((weekStart, weekIndex) => {
          const weekDates = getWeekDates(weekStart);
          const weekMonth = formatMonthYear(weekStart);
          
          return (
            <div key={weekStart.getTime()} className="mb-8">
              {/* Week Header */}
              {weekIndex > 0 && (
                <div className="text-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">{weekMonth}</h2>
                </div>
              )}
              
              {weekDates.map((date, dayIndex) => {
          const dateStr = formatDateForAPI(date);
          const daySlots = getSlotsForDate(dateStr);
          const dayName = WEEKDAYS_FULL[dayIndex];
          const isCurrentDay = isToday(date);

          return (
            <div key={dateStr} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                    {dayName.substring(0, 3)}, {formatDateDisplay(date)}
                  </h3>
                  {isCurrentDay && (
                    <span className="text-xs text-blue-600 font-medium">(Today)</span>
                  )}
                </div>
              </div>

              {/* Existing slots */}
              {daySlots.map((slot) => (
                <div key={`${slot.id}-${slot.date}`} className="mb-3">
                  {editingSlot?.slotId === slot.id && editingSlot?.date === slot.date ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="time"
                            value={editForm.start_time}
                            onChange={(e) => setEditForm(prev => ({ ...prev, start_time: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="py-2 text-gray-500">–</span>
                          <input
                            type="time"
                            value={editForm.end_time}
                            onChange={(e) => setEditForm(prev => ({ ...prev, end_time: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Slot title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSlot(null)}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </div>
                          {slot.title && (
                            <div className="text-sm text-gray-600 mt-1">{slot.title}</div>
                          )}
                          {slot.is_exception && (
                            <div className="text-xs text-orange-600 mt-1">Modified</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="p-2 text-gray-400 hover:text-blue-500 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add new slot button */}
              {daySlots.length < 2 && (
                <button
                  onClick={() => handleAddSlot(dateStr, dayIndex)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">00:00 – 00:00</div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              )}
            </div>
          );
        })}
            </div>
          );
        })}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="text-center py-4">
            <div className="text-gray-500 text-sm">Loading more weeks...</div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center py-2 px-4">
              <Home className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center py-2 px-4">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-blue-500 mt-1">Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;