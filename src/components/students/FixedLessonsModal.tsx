import React, { useState } from 'react';
import { Student, Lesson } from '../../types';
import { X, Repeat, Calendar, Clock, Sparkles } from 'lucide-react';
import { parse12hTo24h, ARABIC_WEEKDAYS, getTodayISO } from '../../utils/dateUtils';

interface FixedLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onAddLessons: (studentId: number, newLessons: Omit<Lesson, 'id'>[]) => void;
}

export const FixedLessonsModal: React.FC<FixedLessonsModalProps> = ({
  isOpen,
  onClose,
  student,
  onAddLessons,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const firstDay = `${year}-${month}-01`;
  const lastDayObj = new Date(year, today.getMonth() + 1, 0);
  const lastDay = `${lastDayObj.getFullYear()}-${String(lastDayObj.getMonth() + 1).padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 2]); // Saturday (0) & Monday (2) by default
  const [hour, setHour] = useState('05');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [duration, setDuration] = useState<number>(1.5);
  const [notes, setNotes] = useState('حصة ثابتة أسبوعياً');

  if (!isOpen) return null;

  const toggleWeekday = (index: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('يرجى تحديد تاريخ البداية والنهاية');
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    if (start > end) {
      alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }

    if (selectedWeekdays.length === 0) {
      alert('يرجى اختيار يوم واحد على الأقل من أيام الأسبوع');
      return;
    }

    const time24 = parse12hTo24h(hour, minute, period);
    const existingLessons = student.lessons || [];

    const generated: Omit<Lesson, 'id'>[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      // JavaScript getDay(): 0 is Sunday, 6 is Saturday
      // In our Saudi index (ARABIC_WEEKDAYS):
      // 0: السبت (Sat, 6)
      // 1: الأحد (Sun, 0)
      // 2: الإثنين (Mon, 1)
      // 3: الثلاثاء (Tue, 2)
      // 4: الأربعاء (Wed, 3)
      // 5: الخميس (Thu, 4)
      // 6: الجمعة (Fri, 5)
      const jsDay = cursor.getDay();
      const arabicDayIndex = (jsDay + 1) % 7;

      if (selectedWeekdays.includes(arabicDayIndex)) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const isoDate = `${y}-${m}-${d}`;

        // Avoid adding duplicate on same date and time
        const alreadyExists = existingLessons.some(
          (l) => l.date === isoDate && l.time === time24
        );

        if (!alreadyExists) {
          generated.push({
            date: isoDate,
            time: time24,
            duration,
            status: 'انتظار',
            notes,
          });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (generated.length === 0) {
      alert('لم يتم إنشاء أي حصص جديدة (قد تكون جميع الحصص مسجلة بالفعل في هذه التواريخ والأوقات)');
      return;
    }

    onAddLessons(student.id, generated);
    alert(`تم إنشاء ${generated.length} حصة بنجاح وتوزيعها على التقويم!`);
    onClose();
  };

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
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">تكرار حصص ثابتة طوال الشهر</h3>
              <p className="text-xs text-slate-400">للطالب: {student.name}</p>
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
        <form onSubmit={handleGenerate} className="p-5 space-y-4 text-xs">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>بداية الحصص</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>نهاية الحصص</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>
          </div>

          {/* Weekdays Checkbox Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              أيام الأسبوع المحددة للحصة:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ARABIC_WEEKDAYS.map((day, idx) => {
                const isSelected = selectedWeekdays.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(idx)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                      isSelected
                        ? 'bg-purple-600/90 text-white border-purple-400 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>وقت الحصة الموحد</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
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
                className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
                className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-center text-sm"
              >
                <option value="PM">م (مساءً)</option>
                <option value="AM">ص (صباحاً)</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              مدة الحصة بالساعات
            </label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              max="6"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
              required
              className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات الحصص</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>إنشاء الحصص في التقويم</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
