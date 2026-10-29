import React, { useState } from 'react';
import { Student, Lesson, ArchivedStudentRecord, ArchivedLessonRecord } from '../../types';
import {
  UserPlus,
  Search,
  Filter,
  FileText,
  Archive,
  RotateCcw,
  BookOpen,
  CalendarCheck,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  ChevronDown,
  UserX,
  GraduationCap,
  Sparkles,
  Check,
  Hourglass,
  XCircle,
  Eye,
} from 'lucide-react';
import { formatDateArabic, formatTimeArabic, formatDurationArabic } from '../../utils/dateUtils';
import { calculateStudentDebt, calculateStudentPaid, calculateStudentExpected } from '../../utils/financeUtils';

interface StudentsTabProps {
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  lessonArchive: ArchivedLessonRecord[];
  onOpenAddStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onArchiveStudent: (student: Student) => void;
  onRestoreStudent: (recordId: number) => void;
  onOpenStudentDetails: (student: Student) => void;
  onOpenReportModal: (student: Student) => void;
  onOpenAllReports: () => void;
  onOpenEditLesson: (studentId: number, lesson: Lesson) => void;
  onDeleteLesson: (studentId: number, lessonId: number) => void;
  onUpdateLessonStatus: (studentId: number, lessonId: number, status: 'تم' | 'انتظار' | 'لم تتم') => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  archivedStudents,
  lessonArchive,
  onOpenAddStudent,
  onOpenEditStudent,
  onArchiveStudent,
  onRestoreStudent,
  onOpenStudentDetails,
  onOpenReportModal,
  onOpenAllReports,
  onOpenEditLesson,
  onDeleteLesson,
  onUpdateLessonStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Accordion states
  const [lessonsLedgerOpen, setLessonsLedgerOpen] = useState(false);
  const [studentArchiveOpen, setStudentArchiveOpen] = useState(false);
  const [lessonArchiveOpen, setLessonArchiveOpen] = useState(false);

  // Filtered active students
  const filteredStudents = students.filter((st) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      st.name.toLowerCase().includes(q) ||
      st.grade.toLowerCase().includes(q) ||
      (st.subjectName || '').toLowerCase().includes(q) ||
      st.subjectType.toLowerCase().includes(q) ||
      st.phone.includes(q) ||
      st.guardianPhone.includes(q);

    const matchesStage = !stageFilter || st.stage === stageFilter;
    const matchesCourse = !courseFilter || st.courseType === courseFilter;

    return matchesSearch && matchesStage && matchesCourse;
  });

  // All pending & missed lessons across students
  const activeLessons: { student: Student; lesson: Lesson }[] = [];
  students.forEach((st) => {
    (st.lessons || []).forEach((l) => {
      if (l.status !== 'تم') {
        activeLessons.push({ student: st, lesson: l });
      }
    });
  });

  activeLessons.sort((a, b) => `${a.lesson.date}T${a.lesson.time}`.localeCompare(`${b.lesson.date}T${b.lesson.time}`));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">سجل الطلاب</h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة بيانات الطلاب التعليمية، متابعة الحصص والدفعات، والأرشيف
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAllReports}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 font-bold text-xs shadow transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>تقارير الطلاب الشاملة</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddStudent}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-[#121f35] border border-white/10 shadow-lg flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، الصف، المادة، أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-white font-medium text-xs outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-white font-bold text-xs outline-none focus:border-teal-500"
          >
            <option value="">جميع المراحل</option>
            <option value="ابتدائي">ابتدائي</option>
            <option value="متوسط">متوسط</option>
            <option value="ثانوي">ثانوي</option>
            <option value="جامعي">جامعي</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-2xl text-white font-bold text-xs outline-none focus:border-teal-500"
          >
            <option value="">جميع الأنواع</option>
            <option value="حضوري">حضوري</option>
            <option value="أونلاين">أونلاين</option>
            <option value="مختلط">مختلط</option>
          </select>
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-3xl bg-slate-900/40 border border-white/5 text-slate-400">
            <UserX className="w-10 h-10 mx-auto mb-2 text-slate-500" />
            <p className="text-sm font-bold text-slate-300">لا يوجد طلاب يطابقون خيارات البحث</p>
            <p className="text-xs text-slate-500 mt-1">تأكد من كتابة الاسم بالشكل الصحيح أو أضف طالباً جديداً</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const debt = calculateStudentDebt(student);
            const paid = calculateStudentPaid(student);
            return (
              <div
                key={student.id}
                className="p-4 rounded-3xl bg-[#14233c] border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-white">{student.name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {student.stage} · {student.grade}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenEditStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        title="تعديل بيانات الطالب"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchiveStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10"
                        title="أرشفة الطالب"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {student.subjectType} {student.subjectName ? `(${student.subjectName})` : ''}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {student.courseType}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {student.price} ر.س / ساعة
                    </span>
                  </div>

                  {/* Balance details */}
                  <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">الرصيد المالي:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{paid} ر.س تم دفعه</span>
                      {debt > 0 ? (
                        <span className="text-rose-400 font-black">({debt} دين)</span>
                      ) : (
                        <span className="text-slate-500">(خالص)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3.5 mt-3.5 border-t border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStudentDetails(student)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض الملف والسجل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenReportModal(student)}
                    className="py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold transition-colors"
                    title="التقرير الأكاديمي الشامل"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Global Lessons Ledger (All Pending / Missed Lessons) */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setLessonsLedgerOpen((prev) => !prev)}
          className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-right hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">سجل الحصص العام (غير المكتملة)</h3>
              <p className="text-xs text-slate-400">جميع الحصص القادمة وقيد الانتظار لمتابعتها وتحديثها</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black">
              {activeLessons.length} حصة
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${lessonsLedgerOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {lessonsLedgerOpen && (
          <div className="p-4 border-t border-white/10 space-y-2.5">
            {activeLessons.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                لا توجد حصص في قائمة الانتظار حالياً
              </div>
            ) : (
              activeLessons.map(({ student, lesson }) => (
                <div
                  key={`${student.id}-${lesson.id}`}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-white">{student.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {student.stage}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                        {student.subjectType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span>{formatDateArabic(lesson.date)}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-teal-400 font-bold">{formatTimeArabic(lesson.time)}</span>
                      <span className="text-slate-500">·</span>
                      <span>{formatDurationArabic(lesson.duration)}</span>
                      {lesson.notes && (
                        <>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{lesson.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Status switch */}
                    <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => onUpdateLessonStatus(student.id, lesson.id, 'تم')}
                        className={`p-1.5 rounded-md ${
                          lesson.status === 'تم'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="تمت الحصة"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateLessonStatus(student.id, lesson.id, 'انتظار')}
                        className={`p-1.5 rounded-md ${
                          lesson.status === 'انتظار'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="في الانتظار"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateLessonStatus(student.id, lesson.id, 'لم تتم')}
                        className={`p-1.5 rounded-md ${
                          lesson.status === 'لم تتم'
                            ? 'bg-rose-500 text-white font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="اعتذار / لم تتم"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenEditLesson(student.id, lesson)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="تعديل الحصة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل تريد بالتأكيد حذف حصة الطالب ${student.name}؟`)) {
                          onDeleteLesson(student.id, lesson.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="حذف الحصة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Student Archive Accordion */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setStudentArchiveOpen((prev) => !prev)}
          className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-right hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">أرشيف الطلاب</h3>
              <p className="text-xs text-slate-400">الطلاب المؤرشفون مع سجل حصصهم وملخصهم المالي وإمكانية الاسترجاع</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
              {archivedStudents.length} طالب
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${studentArchiveOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {studentArchiveOpen && (
          <div className="p-4 border-t border-white/10 space-y-2.5">
            {archivedStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">لا يوجد طلاب في الأرشيف حالياً</div>
            ) : (
              archivedStudents.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-slate-800/40 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">{rec.student.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        مؤرشف
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 mt-2">
                      <div>حصص: {rec.stats.lessonCount}</div>
                      <div>مدفوع: {rec.stats.paid} ر.س</div>
                      <div>دين: {rec.stats.debt} ر.س</div>
                      <div>أول حصة: {rec.stats.firstLessonAt || '—'}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRestoreStudent(rec.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/30 text-xs font-bold self-start md:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إلغاء الأرشفة واستعادة</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Completed Lessons Archive Accordion */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setLessonArchiveOpen((prev) => !prev)}
          className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-right hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">أرشيف الحصص المكتملة</h3>
              <p className="text-xs text-slate-400">سجل بجميع الحصص المنتهية المعتمدة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
              {lessonArchive.length} حصة
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${lessonArchiveOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {lessonArchiveOpen && (
          <div className="p-4 border-t border-white/10 space-y-2">
            {lessonArchive.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">لا توجد حصص في أرشيف الحصص المنتهية</div>
            ) : (
              lessonArchive
                .sort((a, b) => (b.lesson?.date || '').localeCompare(a.lesson?.date || ''))
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{rec.studentName}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300">{formatDateArabic(rec.lesson.date)}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-teal-400">{formatTimeArabic(rec.lesson.time)}</span>
                      {rec.lesson.notes && (
                        <>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{rec.lesson.notes}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      مكتملة
                    </span>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
