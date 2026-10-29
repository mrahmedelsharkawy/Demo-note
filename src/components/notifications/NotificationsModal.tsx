import React from 'react';
import { AppNotification, Student } from '../../types';
import { Bell, X, Check, XCircle, User, AlertCircle, Trash2 } from 'lucide-react';
import { formatDateArabic, formatTimeArabic } from '../../utils/dateUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  students: Student[];
  onUpdateLessonStatus: (studentId: number, lessonId: number, status: 'تم' | 'انتظار' | 'لم تتم') => void;
  onOpenStudent: (student: Student) => void;
  onClearAllNotifications: () => void;
  onDismissNotification: (id: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  students,
  onUpdateLessonStatus,
  onOpenStudent,
  onClearAllNotifications,
  onDismissNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#131f37] border border-white/15 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">إشعارات الحصص المتأخرة</h3>
              <p className="text-xs text-slate-400">حصص تجاوز وقتها المحدد دون تحديد حالتها النهائية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">لا توجد إشعارات حالياً</p>
              <p className="text-xs text-slate-500 mt-1">جميع الحصص محددة الحالة ومحدثة تماماً</p>
            </div>
          ) : (
            notifications.map((notice) => {
              const student = students.find((s) => s.id === notice.studentId);
              return (
                <div
                  key={notice.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notice.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDismissNotification(notice.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="تجاهل التنبيه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions for overdue lesson */}
                  {notice.studentId && notice.lessonId && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLessonStatus(notice.studentId!, notice.lessonId!, 'تم');
                            onDismissNotification(notice.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تمت الحصة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLessonStatus(notice.studentId!, notice.lessonId!, 'لم تتم');
                            onDismissNotification(notice.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>لم تتم</span>
                        </button>
                      </div>

                      {student && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenStudent(student);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:underline"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>ملف الطالب</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/40">
            <span className="text-xs text-slate-400 font-medium">
              إجمالي التنبيهات: {notifications.length}
            </span>
            <button
              type="button"
              onClick={onClearAllNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              مسح جميع الإشعارات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
