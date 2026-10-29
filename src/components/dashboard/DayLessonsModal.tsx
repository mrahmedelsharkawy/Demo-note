import React from 'react';
import { Lesson, Student } from '../../types';
import { X, Calendar, Plus, Check, Hourglass, XCircle, Edit2, Trash2 } from 'lucide-react';
import { formatDateArabic, formatTimeArabic, formatDurationArabic, formatWeekdayArabic } from '../../utils/dateUtils';

interface DayLessonItem {
  studentId: number;
  studentName: string;
  subjectType: string;
  lesson: Lesson;
}

interface DayLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  lessons: DayLessonItem[];
  onOpenAddLesson: (presetDate: string) => void;
  onOpenEditLesson: (studentId: number, lesson: Lesson) => void;
  onDeleteLesson: (studentId: number, lessonId: number) => void;
  onUpdateStatus: (studentId: number, lessonId: number, status: 'تم' | 'انتظار' | 'لم تتم') => void;
}

export const DayLessonsModal: React.FC<DayLessonsModalProps> = ({
  isOpen,
  onClose,
  date,
  lessons,
  onOpenAddLesson,
  onOpenEditLesson,
  onDeleteLesson,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const weekday = formatWeekdayArabic(date);
  const formattedDate = formatDateArabic(date);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121f35] border border-white/15 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">حصص يوم {weekday}</h3>
              <p className="text-xs text-slate-400">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddLesson(date);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة حصة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-bold text-slate-300">لا توجد حصص مجدولة لهذا اليوم</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddLesson(date);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-teal-400 text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول حصة في هذا اليوم</span>
              </button>
            </div>
          ) : (
            lessons.map((item) => (
              <div
                key={`${item.studentId}-${item.lesson.id}`}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-white">{item.studentName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      {item.subjectType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="font-extrabold text-teal-400">{formatTimeArabic(item.lesson.time)}</span>
                    <span className="text-slate-500">·</span>
                    <span>{formatDurationArabic(item.lesson.duration)}</span>
                    {item.lesson.notes && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 truncate max-w-[150px]">{item.lesson.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(item.studentId, item.lesson.id, 'تم')}
                      className={`p-1.5 rounded-md transition-colors ${
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
                      onClick={() => onUpdateStatus(item.studentId, item.lesson.id, 'انتظار')}
                      className={`p-1.5 rounded-md transition-colors ${
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
                      onClick={() => onUpdateStatus(item.studentId, item.lesson.id, 'لم تتم')}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.lesson.status === 'لم تتم'
                          ? 'bg-rose-500 text-white font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="لم تتم الحصة"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditLesson(item.studentId, item.lesson);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="تعديل الحصة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل تريد بالتأكيد حذف حصة الطالب ${item.studentName}؟`)) {
                        onDeleteLesson(item.studentId, item.lesson.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="حذف الحصة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
