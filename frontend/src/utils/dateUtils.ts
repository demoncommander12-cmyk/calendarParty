import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameWeek, parseISO } from 'date-fns';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get the start of the week (Sunday) for a given date
export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
};

// Format date as YYYY-MM-DD
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get all dates in a week starting from Sunday
export const getWeekDates = (weekStart: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i));
  }
  return dates;
};

// Get the next week's start date
export const getNextWeek = (currentWeekStart: Date): Date => {
  return addWeeks(currentWeekStart, 1);
};

// Get the previous week's start date
export const getPreviousWeek = (currentWeekStart: Date): Date => {
  return subWeeks(currentWeekStart, 1);
};

// Check if a date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
};

// Format time for display (remove seconds if present)
export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM
};

// Format date for display
export const formatDateDisplay = (date: Date): string => {
  return format(date, 'MMM dd');
};

// Format month and year for display
export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

// Parse date string to Date object
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

// Check if two dates are in the same week
export const isSameWeekAs = (date1: Date, date2: Date): boolean => {
  return isSameWeek(date1, date2, { weekStartsOn: 0 });
};