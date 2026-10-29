import React, { useState, useEffect } from 'react';
import { Lesson, Student, LessonStatus } from '../../types';
import { X, Calendar, Clock, Check, Hourglass, XCircle, FileText, User } from 'lucide-react';
import { getTodayISO, parse12hTo24h, parse24hTo12h } from '../../utils/dateUtils';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: number, lessonData: Omit<Lesson, 'id'>, lessonId?: number) => void;
  students: Student[];
  initialStudentId?: number;
  initialDate?: string;
  editingLesson?: { studentId: number; lesson: Lesson } | null;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  initialStudentId,
  initialDate,
  editingLesson,
}) => {
  const [studentId, setStudentId] = useState<number>(initialStudentId || (students[0]?.id ?? 0));
  const [date, setDate] = useState<string>(initialDate || getTodayISO());
  const [hour, setHour] = useState<string>('05');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [duration, setDuration] = useState<number>(1);
  const [status, setStatus] = useState<LessonStatus>('انتظار');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingLesson) {
      setStudentId(editingLesson.studentId);
      setDate(editingLesson.lesson.date || getTodayISO());
      const parsedTime = parse24hTo12h(editingLesson.lesson.time || '17:00');
      setHour(parsedTime.hour);
      setMinute(parsedTime.minute);
      setPeriod(parsedTime.period);
      setDuration(editingLesson.lesson.duration || 1);
      setStatus(editingLesson.lesson.status || 'انتظار');
      setNotes(editingLesson.lesson.notes || '');
    } else {
      if (initialStudentId) setStudentId(initialStudentId);
      else if (students[0]) setStudentId(students[0].id);
      setDate(initialDate || getTodayISO());
      setHour('05');
      setMinute('00');
      setPeriod('PM');
      setDuration(1);
      setStatus('انتظار');
      setNotes('');
    }
  }, [editingLesson, initialStudentId, initialDate, isOpen, students]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert('يرجى اختيار الطالب');
      return;
    }
    if (!date) {
      alert('يرجى اختيار تاريخ الحصة');
      return;
    }

    const time24 = parse12hTo24h(hour, minute, period);
    onSave(
      studentId,
      {
        date,
        time: time24,
        duration: Math.max(0.25, Number(duration) || 1),
        status,
        notes: notes.trim(),
      },
      editingLesson?.lesson.id
    );
    onClose();
  };

  const DURATION_PRESETS = [
    { label: 'نصف ساعة', value: 0.5 },
    { label: '45 دقيقة', value: 0.75 },
    { label: 'ساعة', value: 1 },
    { label: 'ساعة وربع', value: 1.25 },
    { label: 'ساعة ونصف', value: 1.5 },
    { label: 'ساعتان', value: 2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#14233c] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {editingLesson ? 'تعديل بيانات الحصة' : 'إضافة حصة جديدة'}
              </h3>
              <p className="text-xs text-slate-400">حدد التاريخ والتوقيت والمدة والملاحظات</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Student Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>الطالب</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(Number(e.target.value))}
              required
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500 text-sm"
            >
              <option value="" disabled>-- اختر الطالب --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.stage} - {st.subjectType})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>تاريخ الحصة</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Time Picker (12-hour: Hour / Minute / Period) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>وقت البدء (نظام 12 ساعة)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
              >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
                className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
              >
                <option value="PM">م (مساءً)</option>
                <option value="AM">ص (صباحاً)</option>
              </select>
            </div>
          </div>

          {/* Duration in Hours & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">مدة الحصة بالساعات</label>
              <span className="text-teal-400 font-extrabold">{duration} ساعة</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDuration(p.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    duration === p.value
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="12"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
              required
              className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              placeholder="مثال: 1.5"
            />
          </div>

          {/* Status switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">حالة الحصة</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setStatus('تم')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'تم'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>تمت</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('انتظار')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'انتظار'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5" />
                <span>انتظار</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('لم تتم')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'لم تتم'
                    ? 'bg-rose-500 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>اعتذار</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات الحصة / الدرس</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: شرح درس التفاضل، مراجعة أسئلة الواجب"
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-extrabold shadow-lg shadow-blue-500/25 transition-all"
            >
              {editingLesson ? 'حفظ التعديلات' : 'إضافة الحصة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
