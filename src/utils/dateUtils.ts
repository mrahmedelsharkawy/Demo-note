/**
 * Date and time formatting utilities in Arabic using the Gregorian calendar.
 */

export function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTime24(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateArabic(
  dateString?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(
      'ar-SA-u-ca-gregory',
      Object.assign(
        {
          calendar: 'gregory',
          numberingSystem: 'latn',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
        options || {}
      )
    ).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDateArabic(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      calendar: 'gregory',
      numberingSystem: 'latn',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatWeekdayArabic(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      calendar: 'gregory',
      weekday: 'long',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatTimeArabic(timeString?: string): string {
  if (!timeString) return '—';
  const parts = String(timeString).split(':');
  if (parts.length < 2) return timeString;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return timeString;

  const period = hour >= 12 ? 'م' : 'ص';
  let h12 = hour % 12;
  if (h12 === 0) h12 = 12;
  const mStr = String(minute).padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}

export function formatDurationArabic(durationHours?: number): string {
  const value = Number(durationHours) || 1;
  if (value === 0.5) return 'نصف ساعة';
  if (value === 0.75) return '45 دقيقة';
  if (value === 1) return 'ساعة واحدة';
  if (value === 1.25) return 'ساعة و15 دقيقة';
  if (value === 1.5) return 'ساعة ونصف';
  if (value === 1.75) return 'ساعة و45 دقيقة';
  if (value === 2) return 'ساعتان';

  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);

  if (hours === 0 && minutes > 0) return `${minutes} دقيقة`;
  if (minutes === 0) return `${hours} ساعات`;
  return `${hours} ساعة و${minutes} دقيقة`;
}

export function calculateEndTime(
  dateString?: string,
  timeString?: string,
  durationHours?: number
): string {
  if (!dateString || !timeString) return '—';
  const parts = String(timeString).split(':').map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return '—';
  const dur = Number(durationHours) || 1;
  const d = new Date(
    `${dateString}T${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}:00`
  );
  if (Number.isNaN(d.getTime())) return '—';
  d.setMinutes(d.getMinutes() + Math.round(dur * 60));
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function parse24hTo12h(time24: string = '17:00'): {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
} {
  const parts = String(time24).split(':');
  let hour = parseInt(parts[0] || '17', 10);
  const minute = String(parts[1] || '00').padStart(2, '0');
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return {
    hour: String(hour).padStart(2, '0'),
    minute,
    period,
  };
}

export function parse12hTo24h(
  hour12: string | number,
  minute: string | number,
  period: 'AM' | 'PM'
): string {
  let h = parseInt(String(hour12 || '12'), 10);
  const m = String(minute || '00').padStart(2, '0');
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

export function isLessonOverdue(dateString?: string, timeString?: string): boolean {
  if (!dateString || !timeString) return false;
  try {
    const lessonDate = new Date(`${dateString}T${timeString}:00`);
    if (Number.isNaN(lessonDate.getTime())) return false;
    return lessonDate < new Date();
  } catch {
    return false;
  }
}

export interface DaySchedule {
  date: string;
  name: string;
  dayNumber: number;
  dateLabel: string;
  isToday: boolean;
}

export const ARABIC_WEEKDAYS = [
  'السبت',
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

export function getWeekDays(weekOffset: number = 0): DaySchedule[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const jsDay = today.getDay(); // 0 is Sunday, 6 is Saturday
  // In Saudi week (starts Saturday):
  // Saturday (6) -> 0 days from Saturday
  // Sunday (0)   -> 1 day from Saturday
  // Monday (1)   -> 2 days
  // Tuesday (2)  -> 3 days
  // Wednesday (3)-> 4 days
  // Thursday (4) -> 5 days
  // Friday (5)   -> 6 days
  const daysFromSaturday = (jsDay + 1) % 7;

  const saturday = new Date(today);
  saturday.setDate(today.getDate() - daysFromSaturday + weekOffset * 7);

  const todayISO = getTodayISO();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;

    return {
      date: iso,
      name: ARABIC_WEEKDAYS[i],
      dayNumber: d.getDate(),
      dateLabel: formatShortDateArabic(iso),
      isToday: iso === todayISO,
    };
  });
}

export interface MonthCalendarCell {
  key: string;
  date: string;
  dayNumber: number;
  outside: boolean;
  isToday: boolean;
}

export function getMonthCalendarCells(monthOffset: number = 0): MonthCalendarCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewDate = new Date(
    today.getFullYear(),
    today.getMonth() + Number(monthOffset || 0),
    1
  );
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Week starts Saturday
  const leading = (first.getDay() + 1) % 7;
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;
  const todayISO = getTodayISO();

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leading + 1;
    const outside = dayNumber < 1 || dayNumber > last.getDate();

    if (outside) {
      const adjacentDayNumber =
        dayNumber < 1
          ? new Date(year, month, 0).getDate() + dayNumber
          : dayNumber - last.getDate();
      return {
        key: `blank-${year}-${month}-${index}`,
        date: '',
        dayNumber: adjacentDayNumber,
        outside: true,
        isToday: false,
      };
    }

    const cellDate = new Date(year, month, dayNumber);
    const iso =
      cellDate.getFullYear() +
      '-' +
      String(cellDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(cellDate.getDate()).padStart(2, '0');

    return {
      key: `${iso}-${index}`,
      date: iso,
      dayNumber,
      outside: false,
      isToday: iso === todayISO,
    };
  });
}

export function getMonthLabelArabic(monthOffset: number = 0): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    calendar: 'gregory',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
