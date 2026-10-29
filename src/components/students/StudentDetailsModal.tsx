import React, { useState } from 'react';
import { Student, Lesson, Payment } from '../../types';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Plus,
  Repeat,
  FileText,
  Share2,
  Trash2,
  Edit2,
  Check,
  Hourglass,
  XCircle,
  Building,
  GraduationCap,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import {
  formatDateArabic,
  formatTimeArabic,
  formatDurationArabic,
  formatShortDateArabic,
} from '../../utils/dateUtils';
import {
  calculateLessonCharge,
  calculateStudentDebt,
  calculateStudentExpected,
  calculateStudentPaid,
  calculatePendingLessonsCount,
} from '../../utils/financeUtils';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onOpenReport: (student: Student) => void;
  onOpenAddLesson: (studentId: number) => void;
  onOpenEditLesson: (studentId: number, lesson: Lesson) => void;
  onDeleteLesson: (studentId: number, lessonId: number) => void;
  onUpdateLessonStatus: (studentId: number, lessonId: number, status: 'تم' | 'انتظار' | 'لم تتم') => void;
  onOpenAddPayment: (studentId: number) => void;
  onDeletePayment: (studentId: number, paymentId: number) => void;
  onOpenFixedLessons: (studentId: number) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenReport,
  onOpenAddLesson,
  onOpenEditLesson,
  onDeleteLesson,
  onUpdateLessonStatus,
  onOpenAddPayment,
  onDeletePayment,
  onOpenFixedLessons,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'payments'>('lessons');
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const expectedIncome = calculateStudentExpected(student);
  const totalPaid = calculateStudentPaid(student);
  const debt = calculateStudentDebt(student);
  const pendingCount = calculatePendingLessonsCount(student);

  // Group lessons by month (YYYY-MM)
  const groupedLessons = (student.lessons || []).reduce<Record<string, Lesson[]>>((acc, lesson) => {
    const key = lesson.date ? lesson.date.slice(0, 7) : 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(lesson);
    return acc;
  }, {});

  const sortedMonthKeys = Object.keys(groupedLessons).sort((a, b) => b.localeCompare(a));

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121f35] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg text-white">{student.name}</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {student.stage}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {student.grade}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {student.subjectType} {student.subjectName ? `(${student.subjectName})` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                سعر الساعة: <span className="font-bold text-teal-400">{student.price} ر.س</span> · {student.courseType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenReport(student)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:brightness-110 transition-all"
              title="فتح تقرير الطالب الشامل"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">التقرير الشامل</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Balance & Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">إجمالي المستحق</span>
              <strong className="text-sm md:text-base font-black text-blue-400 tabular-nums">
                {expectedIncome} ر.س
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">تم دفعه</span>
              <strong className="text-sm md:text-base font-black text-emerald-400 tabular-nums">
                {totalPaid} ر.س
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">المتبقي (الدين)</span>
              <strong
                className={`text-sm md:text-base font-black tabular-nums ${
                  debt > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {debt} ر.س
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">حصص مكتملة غير مسددة</span>
              <strong className="text-sm md:text-base font-black text-amber-400 tabular-nums">
                {pendingCount} حصة
              </strong>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Student Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block">جوال الطالب</span>
                  <span className="text-xs font-bold text-white tracking-wider" dir="ltr">
                    {student.phone || 'غير مسجل'}
                  </span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cleanPhone(student.phone)}`}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      title="اتصال هاتفياً"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone(student.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      title="مراسلة واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Guardian Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    ولي الأمر ({student.guardianRelation || 'أب'})
                  </span>
                  <span className="text-xs font-bold text-white tracking-wider" dir="ltr">
                    {student.guardianPhone || 'غير مسجل'}
                  </span>
                </div>
                {student.guardianPhone && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cleanPhone(student.guardianPhone)}`}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      title="اتصال بولي الأمر"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone(student.guardianPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      title="مراسلة ولي الأمر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Building */}
            {(student.location || student.buildingDetails) && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{student.location || 'العنوان غير محدد'}</span>
                  </div>
                  {student.buildingDetails && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{student.buildingDetails}</span>
                    </div>
                  )}
                </div>
                {student.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(student.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-bold shrink-0 inline-flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>الخريطة</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Subtabs Selector: Lessons vs Payments */}
          <div className="flex border-b border-white/10 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className={`py-2.5 px-4 font-extrabold text-xs transition-colors border-b-2 ${
                activeTab === 'lessons'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              سجل الحصص ({(student.lessons || []).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`py-2.5 px-4 font-extrabold text-xs transition-colors border-b-2 ${
                activeTab === 'payments'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              الدفعات المالية ({(student.payments || []).length})
            </button>
          </div>

          {/* Tab 1: Lessons */}
          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">الحصص مقسمة بالأشهر</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAddLesson(student.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة حصة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenFixedLessons(student.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>حصص ثابتة شهرياً</span>
                  </button>
                </div>
              </div>

              {sortedMonthKeys.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">لا توجد حصص مسجلة لهذا الطالب حتى الآن</p>
                </div>
              ) : (
                sortedMonthKeys.map((monthKey) => {
                  const monthLessons = groupedLessons[monthKey] || [];
                  const isCollapsed = collapsedMonths[monthKey];
                  const [y, m] = monthKey.split('-').map(Number);
                  const monthLabel = !Number.isNaN(y) && !Number.isNaN(m)
                    ? formatDateArabic(`${monthKey}-01`, { month: 'long', year: 'numeric' })
                    : 'حصص أخرى';

                  return (
                    <div
                      key={monthKey}
                      className="rounded-2xl border border-white/10 bg-slate-800/40 overflow-hidden"
                    >
                      {/* Accordion Month Header */}
                      <button
                        type="button"
                        onClick={() => toggleMonth(monthKey)}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-800/70 hover:bg-slate-800 transition-colors text-right"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 text-teal-400 transition-transform ${
                              isCollapsed ? 'rotate-180' : ''
                            }`}
                          />
                          <span className="font-extrabold text-sm text-white">{monthLabel}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                            {monthLessons.length} حصة
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {isCollapsed ? 'عرض' : 'إخفاء'}
                        </span>
                      </button>

                      {/* Month Lessons List */}
                      {!isCollapsed && (
                        <div className="p-3 space-y-2">
                          {monthLessons
                            .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
                            .map((lesson) => {
                              const cost = calculateLessonCharge(student.price, lesson.duration);
                              return (
                                <div
                                  key={lesson.id}
                                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-xs text-white">
                                        {formatDateArabic(lesson.date)}
                                      </span>
                                      <span className="text-slate-500">·</span>
                                      <span className="text-teal-400 font-extrabold text-xs">
                                        {formatTimeArabic(lesson.time)}
                                      </span>
                                      <span className="text-slate-500">·</span>
                                      <span className="text-slate-300 text-[11px]">
                                        {formatDurationArabic(lesson.duration)}
                                      </span>
                                      <span className="text-[11px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">
                                        {cost} ر.س
                                      </span>
                                    </div>
                                    {lesson.notes && (
                                      <p className="text-[11px] text-slate-400 mt-1">
                                        {lesson.notes}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                    {/* Status Switcher Buttons */}
                                    <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-lg border border-white/5">
                                      <button
                                        type="button"
                                        onClick={() => onUpdateLessonStatus(student.id, lesson.id, 'تم')}
                                        className={`p-1.5 rounded-md transition-colors ${
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
                                        className={`p-1.5 rounded-md transition-colors ${
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
                                        className={`p-1.5 rounded-md transition-colors ${
                                          lesson.status === 'لم تتم'
                                            ? 'bg-rose-500 text-white font-black'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                        title="اعتذار / لم تتم"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Edit & Delete */}
                                    <button
                                      type="button"
                                      onClick={() => onOpenEditLesson(student.id, lesson)}
                                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                      title="تعديل الحصة"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`هل تريد بالتأكيد حذف حصة يوم ${lesson.date}؟`)) {
                                          onDeleteLesson(student.id, lesson.id);
                                        }
                                      }}
                                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                      title="حذف الحصة"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">سجل الدفعات والمبالغ المسددة</span>
                <button
                  type="button"
                  onClick={() => onOpenAddPayment(student.id)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسديد دفعة</span>
                </button>
              </div>

              {(student.payments || []).length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">لا توجد دفعات مسجلة لهذا الطالب حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...student.payments]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {formatDateArabic(payment.date)}
                            </span>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md tabular-nums">
                              + {payment.amount} ر.س
                            </span>
                          </div>
                          {payment.notes && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              {payment.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`هل تريد بالتأكيد حذف دفعة ${payment.amount} ر.س؟`)) {
                              onDeletePayment(student.id, payment.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="حذف الدفعة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
