import React, { useState } from 'react';
import { Student, Lesson, TeacherProfile } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Bolt,
  Phone,
  MessageCircle,
  Check,
  Hourglass,
  XCircle,
  Coffee,
  Sparkles,
} from 'lucide-react';
import {
  getTodayISO,
  formatDateArabic,
  formatTimeArabic,
  formatDurationArabic,
  getWeekDays,
  getMonthCalendarCells,
  getMonthLabelArabic,
  isLessonOverdue,
  DaySchedule,
  MonthCalendarCell,
} from '../../utils/dateUtils';
import { generateICSContent, downloadICSFile } from '../../utils/icsExport';

interface FlattenedLesson {
  studentId: number;
  studentName: string;
  subjectType: string;
  courseType: string;
  stage: string;
  phone: string;
  location: string;
  price: number;
  lesson: Lesson;
}

interface DashboardTabProps {
  students: Student[];
  teacher: TeacherProfile;
  onOpenAddLesson: (presetDate?: string) => void;
  onOpenEditLesson: (studentId: number, lesson: Lesson) => void;
  onUpdateLessonStatus: (studentId: number, lessonId: number, status: 'تم' | 'انتظار' | 'لم تتم') => void;
  onOpenDayModal: (date: string, lessons: FlattenedLesson[]) => void;
  onOpenStudentDetails: (student: Student) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  teacher,
  onOpenAddLesson,
  onOpenEditLesson,
  onUpdateLessonStatus,
  onOpenDayModal,
  onOpenStudentDetails,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const todayISO = getTodayISO();

  // Flatten all lessons across all active students
  const allLessons: FlattenedLesson[] = [];
  students.forEach((st) => {
    (st.lessons || []).forEach((lesson) => {
      allLessons.push({
        studentId: st.id,
        studentName: st.name,
        subjectType: st.subjectType,
        courseType: st.courseType,
        stage: st.stage,
        phone: st.phone || st.guardianPhone || '',
        location: st.location || '',
        price: st.price,
        lesson,
      });
    });
  });

  // Today's lessons
  const todayLessons = allLessons
    .filter((item) => item.lesson.date === todayISO)
    .sort((a, b) => a.lesson.time.localeCompare(b.lesson.time));

  // Upcoming lessons sorted chronologically
  const nowDateTime = new Date();
  const upcomingLessons = allLessons
    .filter((item) => {
      if (item.lesson.status === 'تم') return false;
      const lessonDate = new Date(`${item.lesson.date}T${item.lesson.time || '00:00'}:00`);
      return lessonDate >= nowDateTime;
    })
    .sort((a, b) => `${a.lesson.date}T${a.lesson.time}`.localeCompare(`${b.lesson.date}T${b.lesson.time}`));

  const nextLesson = upcomingLessons[0] || null;

  // Week days calculation
  const weekDays = getWeekDays(weekOffset);

  // Month cells calculation
  const monthCells = getMonthCalendarCells(monthOffset);
  const currentMonthLabel = getMonthLabelArabic(monthOffset);

  // Group lessons by date for quick calendar lookups
  const lessonsByDate = allLessons.reduce<Record<string, FlattenedLesson[]>>((acc, item) => {
    if (!item.lesson.date) return acc;
    if (!acc[item.lesson.date]) acc[item.lesson.date] = [];
    acc[item.lesson.date].push(item);
    return acc;
  }, {});

  // Distinct color palettes for student badges on calendar
  const STUDENT_COLORS = [
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-teal-500/20 text-teal-300 border-teal-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ];

  const getStudentColorClass = (studentId: number) => {
    const idx = students.findIndex((s) => s.id === studentId);
    return STUDENT_COLORS[(idx >= 0 ? idx : studentId) % STUDENT_COLORS.length];
  };

  // Export current displayed month to ICS
  const handleExportMonthToICS = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    const targetYear = d.getFullYear();
    const targetMonth = d.getMonth() + 1;

    const monthItems = allLessons.filter((item) => {
      if (!item.lesson.date) return false;
      const [y, m] = item.lesson.date.split('-').map(Number);
      return y === targetYear && m === targetMonth;
    });

    if (monthItems.length === 0) {
      alert('لا توجد حصص في هذا الشهر لتصديرها');
      return;
    }

    const icsContent = generateICSContent(
      `حصص ${currentMonthLabel} - ${teacher.name}`,
      monthItems.map((item) => ({
        lesson: item.lesson,
        studentName: item.studentName,
        stage: item.stage,
        subject: item.subjectType,
        location: item.location,
      }))
    );

    downloadICSFile(`جدول_حصص_${currentMonthLabel.replace(/\s+/g, '_')}`, icsContent);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-900/60 via-slate-900/80 to-[#121c2e] border border-white/10 p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 leading-relaxed">
              <span>مرحباً بك، {teacher.name}</span>
              <span className="text-2xl">👋</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              إليك ملخص يومك التدريسي وجدول حصصك القادمة ومتابعة المواعيد
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onOpenAddLesson()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة حصة سريعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards Row: Next Lesson (50%) + Quick Stats (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next Lesson Card */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-blue-950/80 border border-blue-500/20 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
              <Bolt className="w-3.5 h-3.5" />
              <span>أقرب حصة قادمة</span>
            </div>

            {nextLesson && (
              <span className="text-[11px] font-bold text-slate-400">
                {formatDateArabic(nextLesson.lesson.date)}
              </span>
            )}
          </div>

          {nextLesson ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white">
                    {nextLesson.studentName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="font-extrabold text-teal-400">
                      {formatTimeArabic(nextLesson.lesson.time)}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>{formatDurationArabic(nextLesson.lesson.duration)}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-blue-300 font-bold">{nextLesson.subjectType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {nextLesson.phone && (
                    <a
                      href={`https://wa.me/${nextLesson.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      title="مراسلة واتساب"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  {nextLesson.phone && (
                    <a
                      href={`tel:${nextLesson.phone.replace(/[^0-9]/g, '')}`}
                      className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      title="اتصال هاتفياً"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Status Switcher for Next Lesson */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                <span className="text-xs text-slate-400 font-bold">تحديد الحالة:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateLessonStatus(nextLesson.studentId, nextLesson.lesson.id, 'تم')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تمت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateLessonStatus(nextLesson.studentId, nextLesson.lesson.id, 'لم تتم')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>اعتذار</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Coffee className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-xs font-bold text-slate-300">لا توجد حصص قادمة مجدولة حالياً</p>
              <p className="text-[11px] text-slate-500 mt-0.5">يمكنك إضافة حصة جديدة في أي وقت</p>
            </div>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-[#14233c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">حصص اليوم</span>
              <strong className="text-2xl font-black text-amber-400 tabular-nums">
                {todayLessons.length}
              </strong>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#14233c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي الحصص</span>
              <strong className="text-2xl font-black text-blue-400 tabular-nums">
                {allLessons.length}
              </strong>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#14233c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">حصص مكتملة</span>
              <strong className="text-2xl font-black text-emerald-400 tabular-nums">
                {allLessons.filter((i) => i.lesson.status === 'تم').length}
              </strong>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#14233c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">الطلاب المسجلين</span>
              <strong className="text-2xl font-black text-teal-400 tabular-nums">
                {students.length}
              </strong>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Lessons List */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">حصص اليوم</h3>
              <p className="text-[11px] text-slate-400">{formatDateArabic(todayISO)}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
            {todayLessons.length} حصة
          </span>
        </div>

        <div className="p-4">
          {todayLessons.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Coffee className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-xs font-bold text-slate-300">لا توجد حصص مجدولة لهذا اليوم</p>
              <p className="text-[11px] text-slate-500 mt-0.5">استمتع بيومك أو أضف موعداً جديداً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayLessons.map((item) => (
                <div
                  key={`${item.studentId}-${item.lesson.id}`}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white truncate">{item.studentName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {item.subjectType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span className="font-extrabold text-teal-400">
                        {formatTimeArabic(item.lesson.time)}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span>{formatDurationArabic(item.lesson.duration)}</span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateLessonStatus(item.studentId, item.lesson.id, 'تم')}
                      className={`p-2 rounded-lg transition-colors ${
                        item.lesson.status === 'تم'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="تمت الحصة"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateLessonStatus(item.studentId, item.lesson.id, 'انتظار')}
                      className={`p-2 rounded-lg transition-colors ${
                        item.lesson.status === 'انتظار'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="في الانتظار"
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateLessonStatus(item.studentId, item.lesson.id, 'لم تتم')}
                      className={`p-2 rounded-lg transition-colors ${
                        item.lesson.status === 'لم تتم'
                          ? 'bg-rose-500 text-white font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="اعتذار / لم تتم"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Schedule (Saturday to Friday) */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">تقويم الأسبوع</h3>
              <p className="text-[11px] text-slate-400">السبت إلى الجمعة · اضغط على أي يوم لعرض حصصه</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="الأسبوع السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/30"
              >
                اليوم
              </button>
            )}

            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="الأسبوع التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Days Grid / Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {weekDays.map((day) => {
            const dayLessons = lessonsByDate[day.date] || [];
            return (
              <div
                key={day.date}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDayModal(day.date, dayLessons)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenDayModal(day.date, dayLessons);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  day.isToday
                    ? 'bg-blue-600/25 border-blue-400/50 shadow-md ring-1 ring-blue-400/30'
                    : dayLessons.length > 0
                    ? 'bg-slate-800/70 border-white/10 hover:border-teal-500/40'
                    : 'bg-slate-900/40 border-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <span className={`text-xs font-black ${day.isToday ? 'text-blue-300' : 'text-white'}`}>
                      {day.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{day.dateLabel}</span>
                  </div>

                  {/* Lessons Chips */}
                  <div className="space-y-1.5">
                    {dayLessons.slice(0, 3).map((item) => (
                      <div
                        key={`${item.studentId}-${item.lesson.id}`}
                        className="px-2 py-1 rounded-lg bg-slate-900/90 border border-white/5 text-[10px] flex items-center justify-between gap-1"
                      >
                        <span className="font-extrabold text-white truncate max-w-[70px]">
                          {item.studentName}
                        </span>
                        <span className="font-bold text-teal-400 shrink-0">
                          {formatTimeArabic(item.lesson.time)}
                        </span>
                      </div>
                    ))}
                    {dayLessons.length > 3 && (
                      <span className="text-[9px] text-teal-400 font-bold block text-center">
                        + {dayLessons.length - 3} حصص أخرى
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                  <span>{dayLessons.length} حصة</span>
                  <span className="text-teal-400 hover:underline">عرض</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 md:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">تقويم الشهر ({currentMonthLabel})</h3>
              <p className="text-[11px] text-slate-400">شبكة الأيام الكاملة · اضغط على اليوم لإدارته</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMonthToICS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/30 font-bold text-xs transition-colors"
              title="تصدير حصص الشهر إلى تطبيق التقويم"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير إلى التقويم (.ics)</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {monthOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setMonthOffset(0)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-teal-400"
                >
                  اليوم
                </button>
              )}

              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-column Calendar Header */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-black text-slate-400">
            {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((name) => (
              <div key={name} className="py-1">
                {name}
              </div>
            ))}
          </div>

          {/* Cells Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {monthCells.map((cell) => {
              const dayLessons = cell.date ? lessonsByDate[cell.date] || [] : [];
              return (
                <div
                  key={cell.key}
                  role="button"
                  tabIndex={cell.outside ? -1 : 0}
                  onClick={() => {
                    if (!cell.outside && cell.date) {
                      onOpenDayModal(cell.date, dayLessons);
                    }
                  }}
                  className={`min-h-[85px] md:min-h-[105px] p-1.5 md:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    cell.outside
                      ? 'bg-transparent border-transparent opacity-30 pointer-events-none'
                      : cell.isToday
                      ? 'bg-blue-600/20 border-blue-400/50 shadow-md ring-1 ring-blue-400/40 cursor-pointer'
                      : dayLessons.length > 0
                      ? 'bg-slate-800/70 border-white/10 hover:border-teal-500/50 cursor-pointer'
                      : 'bg-slate-900/30 border-white/5 hover:border-white/15 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                        cell.isToday
                          ? 'bg-blue-500 text-white'
                          : dayLessons.length > 0
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayLessons.length > 0 && (
                      <span className="text-[10px] text-teal-400 font-extrabold hidden sm:inline">
                        {dayLessons.length}
                      </span>
                    )}
                  </div>

                  {/* Student event chips inside cell */}
                  <div className="space-y-1 overflow-hidden">
                    {dayLessons.slice(0, 2).map((item) => (
                      <div
                        key={`${item.studentId}-${item.lesson.id}`}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border truncate ${getStudentColorClass(
                          item.studentId
                        )}`}
                        title={`${item.studentName} - ${formatTimeArabic(item.lesson.time)}`}
                      >
                        {item.studentName}
                      </div>
                    ))}
                    {dayLessons.length > 2 && (
                      <span className="text-[8px] text-slate-400 font-bold block text-center">
                        + {dayLessons.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
