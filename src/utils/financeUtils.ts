import { Student, Lesson, Payment, ArchivedStudentRecord } from '../types';

/**
 * Calculates the fee for a single lesson based on the student's hourly rate and lesson duration.
 */
export function calculateLessonCharge(hourlyRate: number, durationHours: number = 1): number {
  const rate = Math.max(0, Number(hourlyRate) || 0);
  const dur = Math.max(0, Number(durationHours) || 1);
  return Number((rate * dur).toFixed(2));
}

/**
 * Calculates total expected income from a student (only completed lessons: status === 'تم').
 */
export function calculateStudentExpected(student: Student): number {
  if (!student || !Array.isArray(student.lessons)) return 0;
  const total = student.lessons
    .filter((lesson) => lesson.status === 'تم')
    .reduce((sum, lesson) => sum + calculateLessonCharge(student.price, lesson.duration), 0);
  return Number(total.toFixed(2));
}

/**
 * Calculates total paid amount by a student across all recorded payments.
 */
export function calculateStudentPaid(student: Student): number {
  if (!student || !Array.isArray(student.payments)) return 0;
  const total = student.payments.reduce(
    (sum, payment) => sum + Math.max(0, Number(payment.amount) || 0),
    0
  );
  return Number(total.toFixed(2));
}

/**
 * Calculates the current remaining debt of a student (Expected - Paid, min 0).
 */
export function calculateStudentDebt(student: Student): number {
  const expected = calculateStudentExpected(student);
  const paid = calculateStudentPaid(student);
  return Math.max(0, Number((expected - paid).toFixed(2)));
}

/**
 * Calculates the count of completed lessons for a student.
 */
export function calculateCompletedLessonsCount(student: Student): number {
  if (!student || !Array.isArray(student.lessons)) return 0;
  return student.lessons.filter((l) => l.status === 'تم').length;
}

/**
 * Calculates how many completed lessons remain unpaid based on payments credited.
 */
export function calculatePendingLessonsCount(student: Student): number {
  if (!student || !Array.isArray(student.lessons)) return 0;
  const completed = student.lessons
    .filter((lesson) => lesson.status === 'تم')
    .map((lesson) => calculateLessonCharge(student.price, lesson.duration));

  let credit = calculateStudentPaid(student);
  let unpaidCount = 0;

  for (const charge of completed) {
    if (credit + 0.009 >= charge) {
      credit = Math.max(0, credit - charge);
    } else {
      unpaidCount++;
      credit = 0;
    }
  }

  return unpaidCount;
}

/**
 * Gathers all active + archived students into a unified list.
 */
export function getAllStudentsList(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): Student[] {
  const list: Student[] = [...students];
  archivedStudents.forEach((rec) => {
    if (rec && rec.student) {
      list.push(rec.student);
    }
  });
  return list;
}

/**
 * Calculates grand total collected income across all students.
 */
export function getTotalIncome(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): number {
  const all = getAllStudentsList(students, archivedStudents);
  const sum = all.reduce((acc, student) => acc + calculateStudentPaid(student), 0);
  return Number(sum.toFixed(2));
}

/**
 * Calculates grand total expected/earned income from completed lessons across all students.
 */
export function getExpectedIncome(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): number {
  const all = getAllStudentsList(students, archivedStudents);
  const sum = all.reduce((acc, student) => acc + calculateStudentExpected(student), 0);
  return Number(sum.toFixed(2));
}

/**
 * Calculates total outstanding debts across all students.
 */
export function getTotalDebts(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): number {
  const all = getAllStudentsList(students, archivedStudents);
  const sum = all.reduce((acc, student) => acc + calculateStudentDebt(student), 0);
  return Number(sum.toFixed(2));
}

export interface FlattenedTransaction extends Payment {
  studentId: number;
  studentName: string;
  archived?: boolean;
}

/**
 * Returns all payment transactions flattened and sorted by date descending.
 */
export function getAllTransactions(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): FlattenedTransaction[] {
  const list: FlattenedTransaction[] = [];

  students.forEach((student) => {
    (student.payments || []).forEach((p) => {
      list.push({
        ...p,
        studentId: student.id,
        studentName: student.name || 'بدون اسم',
        archived: false,
      });
    });
  });

  archivedStudents.forEach((rec) => {
    if (rec?.student) {
      (rec.student.payments || []).forEach((p) => {
        list.push({
          ...p,
          studentId: rec.student.id,
          studentName: rec.student.name || 'طالب مؤرشف',
          archived: true,
        });
      });
    }
  });

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const ACADEMIC_MONTH_LABELS = [
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
];

/**
 * Calculates 12-month income distribution for the academic year (July to June).
 */
export function getAcademicMonthlyIncome(
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): { labels: string[]; values: number[] } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const transactions = getAllTransactions(students, archivedStudents);

  // Month indices: [6 (Jul), 7 (Aug), 8 (Sep), 9 (Oct), 10 (Nov), 11 (Dec), 0 (Jan), 1 (Feb), 2 (Mar), 3 (Apr), 4 (May), 5 (Jun)]
  const monthIndices = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

  const values = monthIndices.map((monthIndex, position) => {
    // July-Dec belong to academic start year; Jan-Jun belong to next calendar year
    const yr = position < 6 ? currentYear : currentYear + 1;
    return transactions
      .filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === yr && d.getMonth() === monthIndex;
      })
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  });

  return {
    labels: ACADEMIC_MONTH_LABELS,
    values,
  };
}

export const CALENDAR_MONTH_LABELS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/**
 * Calculates calendar year monthly income for a given year.
 */
export function getCalendarYearMonthlyIncome(
  year: number,
  students: Student[] = [],
  archivedStudents: ArchivedStudentRecord[] = []
): { labels: string[]; values: number[] } {
  const transactions = getAllTransactions(students, archivedStudents);
  const values = Array.from({ length: 12 }, (_, monthIndex) => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      })
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  });

  return {
    labels: CALENDAR_MONTH_LABELS,
    values,
  };
}
