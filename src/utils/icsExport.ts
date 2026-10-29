/**
 * Utility for exporting lessons to standard RFC-5545 iCalendar (.ics) files.
 */

import { Lesson } from '../types';

function icsEscape(value: string | number = ''): string {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function formatICSDate(dateStr: string, timeStr: string = '00:00'): string {
  const cleanDate = dateStr.replace(/[^0-9]/g, '');
  const [hh, mm] = timeStr.split(':').map((x) => String(parseInt(x || '0', 10)).padStart(2, '0'));
  return `${cleanDate}T${hh || '00'}${mm || '00'}00`;
}

export interface LessonExportItem {
  lesson: Lesson;
  studentName: string;
  stage?: string;
  subject?: string;
  location?: string;
}

export function generateICSContent(
  calendarTitle: string,
  items: LessonExportItem[]
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//دفتر المعلم//Teacher Notebook//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calendarTitle)}`,
    'X-WR-TIMEZONE:Asia/Riyadh',
  ];

  const nowUTC = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  items.forEach((item, index) => {
    const { lesson, studentName, stage, subject, location } = item;
    if (!lesson.date) return;

    const startDT = formatICSDate(lesson.date, lesson.time || '17:00');
    const durHours = Number(lesson.duration) || 1;

    // Calculate end datetime
    const startDate = new Date(
      `${lesson.date}T${String(lesson.time || '17:00').slice(0, 5)}:00`
    );
    const endDate = new Date(startDate.getTime() + durHours * 3600000);
    const endISO = endDate.toISOString().slice(0, 10).replace(/-/g, '');
    const endHH = String(endDate.getHours()).padStart(2, '0');
    const endMM = String(endDate.getMinutes()).padStart(2, '0');
    const endDT = `${endISO}T${endHH}${endMM}00`;

    const uid = `lesson-${lesson.id || index}-${lesson.date}@teachernotebook`;
    const summary = `حصة: ${studentName}${subject ? ` (${subject})` : ''}`;

    const descParts = [
      `الطالب: ${studentName}`,
      stage ? `المرحلة: ${stage}` : '',
      `مدة الحصة: ${durHours} ساعة`,
      lesson.status ? `الحالة: ${lesson.status}` : '',
      lesson.notes ? `ملاحظات: ${lesson.notes}` : '',
    ].filter(Boolean);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(uid)}`,
      `DTSTAMP:${nowUTC}`,
      `DTSTART;TZID=Asia/Riyadh:${startDT}`,
      `DTEND;TZID=Asia/Riyadh:${endDT}`,
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${icsEscape(descParts.join(' | '))}`,
      location ? `LOCATION:${icsEscape(location)}` : 'LOCATION:',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export function downloadICSFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
