import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLessonCharge,
  calculateStudentExpected,
  calculateStudentPaid,
  calculateStudentDebt,
  calculateCompletedLessonsCount,
  calculatePendingLessonsCount,
  getTotalIncome,
  getExpectedIncome,
  getTotalDebts,
} from './financeUtils';
import { Student } from '../types';

test('calculateLessonCharge correctly computes cost with fractional hours', () => {
  assert.equal(calculateLessonCharge(100, 1), 100);
  assert.equal(calculateLessonCharge(120, 1.5), 180);
  assert.equal(calculateLessonCharge(80, 0.5), 40);
  assert.equal(calculateLessonCharge(100, 1.25), 125);
  assert.equal(calculateLessonCharge(0, 1), 0);
});

test('calculateStudentExpected only counts completed lessons', () => {
  const mockStudent: Student = {
    id: 1,
    name: 'أحمد محمود',
    stage: 'ثانوي',
    grade: 'ثالث ثانوي',
    courseType: 'حضوري',
    subjectType: 'منهج',
    price: 100,
    phone: '0501112233',
    guardianPhone: '0509998877',
    guardianRelation: 'أب',
    location: 'الرياض - حي النرجس',
    lessons: [
      { id: 101, date: '2026-10-01', time: '17:00', duration: 1, status: 'تم' },
      { id: 102, date: '2026-10-05', time: '17:00', duration: 1.5, status: 'تم' },
      { id: 103, date: '2026-10-10', time: '17:00', duration: 1, status: 'انتظار' },
      { id: 104, date: '2026-10-15', time: '17:00', duration: 1, status: 'لم تتم' },
    ],
    payments: [],
  };

  // Lesson 101 = 100 * 1 = 100
  // Lesson 102 = 100 * 1.5 = 150
  // Total expected = 250
  assert.equal(calculateStudentExpected(mockStudent), 250);
  assert.equal(calculateCompletedLessonsCount(mockStudent), 2);
});

test('calculateStudentDebt subtracts payments correctly and floors at 0', () => {
  const student: Student = {
    id: 2,
    name: 'سارة خالد',
    stage: 'متوسط',
    grade: 'ثاني متوسط',
    courseType: 'أونلاين',
    subjectType: 'قدرات',
    price: 80,
    phone: '0551234567',
    guardianPhone: '0557654321',
    guardianRelation: 'أم',
    location: 'جدة',
    lessons: [
      { id: 201, date: '2026-10-02', time: '16:00', duration: 1, status: 'تم' },
      { id: 202, date: '2026-10-09', time: '16:00', duration: 1, status: 'تم' },
    ],
    payments: [
      { id: 901, date: '2026-10-02', amount: 50 },
    ],
  };

  // Expected = 80 + 80 = 160
  // Paid = 50
  // Debt = 110
  assert.equal(calculateStudentExpected(student), 160);
  assert.equal(calculateStudentPaid(student), 50);
  assert.equal(calculateStudentDebt(student), 110);
  assert.equal(calculatePendingLessonsCount(student), 2); // 50 < 80, so first lesson not fully paid
});

test('calculatePendingLessonsCount correctly tracks completed unpaid lessons', () => {
  const student: Student = {
    id: 3,
    name: 'عمر',
    stage: 'ثانوي',
    grade: 'أول ثانوي',
    courseType: 'حضوري',
    subjectType: 'منهج',
    price: 100,
    phone: '',
    guardianPhone: '',
    guardianRelation: '',
    location: '',
    lessons: [
      { id: 301, date: '2026-10-01', time: '18:00', duration: 1, status: 'تم' }, // 100
      { id: 302, date: '2026-10-03', time: '18:00', duration: 1, status: 'تم' }, // 100
      { id: 303, date: '2026-10-05', time: '18:00', duration: 1, status: 'تم' }, // 100
    ],
    payments: [
      { id: 911, date: '2026-10-02', amount: 200 }, // Covers 301 and 302
    ],
  };

  assert.equal(calculatePendingLessonsCount(student), 1);
  assert.equal(calculateStudentDebt(student), 100);
});

test('aggregate functions calculate totals properly across students', () => {
  const s1: Student = {
    id: 1,
    name: 'طالب 1',
    stage: 'ثانوي',
    grade: 'ثالث ثانوي',
    courseType: 'حضوري',
    subjectType: 'منهج',
    price: 100,
    phone: '',
    guardianPhone: '',
    guardianRelation: '',
    location: '',
    lessons: [{ id: 1, date: '2026-10-01', time: '17:00', duration: 1, status: 'تم' }],
    payments: [{ id: 1, date: '2026-10-01', amount: 100 }],
  };
  const s2: Student = {
    id: 2,
    name: 'طالب 2',
    stage: 'متوسط',
    grade: 'أول متوسط',
    courseType: 'حضوري',
    subjectType: 'منهج',
    price: 80,
    phone: '',
    guardianPhone: '',
    guardianRelation: '',
    location: '',
    lessons: [{ id: 2, date: '2026-10-02', time: '18:00', duration: 2, status: 'تم' }], // 160
    payments: [{ id: 2, date: '2026-10-02', amount: 60 }],
  };

  assert.equal(getTotalIncome([s1, s2]), 160);
  assert.equal(getExpectedIncome([s1, s2]), 260);
  assert.equal(getTotalDebts([s1, s2]), 100);
});
