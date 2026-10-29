import React, { useRef, useState } from 'react';
import { Student, TeacherProfile } from '../../types';
import {
  X,
  Share2,
  Printer,
  Download,
  GraduationCap,
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  Phone,
  MapPin,
  Building,
  Check,
  Hourglass,
  XCircle,
  FileText,
} from 'lucide-react';
import {
  formatDateArabic,
  formatTimeArabic,
  formatDurationArabic,
  calculateEndTime,
  getTodayISO,
} from '../../utils/dateUtils';
import {
  calculateStudentDebt,
  calculateStudentExpected,
  calculateStudentPaid,
  calculateLessonCharge,
} from '../../utils/financeUtils';
import { exportElementToPDF } from '../../utils/pdfExport';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  teacher: TeacherProfile;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  student,
  teacher,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const todayStr = formatDateArabic(getTodayISO());
  const lessons = [...(student.lessons || [])].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  );
  const payments = [...(student.payments || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === 'تم').length;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalPaid = calculateStudentPaid(student);
  const expectedIncome = calculateStudentExpected(student);
  const debt = calculateStudentDebt(student);

  // Timeline stats
  const firstLesson = lessons[0];
  const lastLesson = lessons[lessons.length - 1];

  let courseDurationText = '—';
  let totalHours = 0;
  if (firstLesson && lastLesson) {
    const startDt = new Date(`${firstLesson.date}T${firstLesson.time || '00:00'}`);
    const endDt = new Date(`${lastLesson.date}T${lastLesson.time || '00:00'}`);
    const diffDays = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(diffDays / 7);
    courseDurationText = `${diffDays} يوم${weeks > 0 ? ` (${weeks} أسبوع)` : ''}`;
    totalHours = lessons.reduce((sum, l) => sum + (Number(l.duration) || 1), 0);
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await exportElementToPDF(reportRef.current, {
        filename: `تقرير-${student.name.replace(/\s+/g, '_')}`,
        orientation: 'portrait',
        tryShare: false,
      });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير التقرير، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePDF = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await exportElementToPDF(reportRef.current, {
        filename: `تقرير-${student.name.replace(/\s+/g, '_')}`,
        title: `تقرير الطالب: ${student.name}`,
        orientation: 'portrait',
        tryShare: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#121c2e] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-right my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-white/10 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm text-white">التقرير الشامل للطالب</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSharePDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'جارٍ التصدير...' : 'تحميل PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          <div
            ref={reportRef}
            className="print-page-a4 max-w-[794px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl font-sans text-right"
            dir="rtl"
          >
            {/* Document Header */}
            <header className="flex items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase block">
                  STUDENT ACADEMIC & FINANCIAL REPORT
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                  التقرير الشامل للطالب
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  ملخص السجل الأكاديمي، جدول الحصص، والدفعات المالية
                </p>
              </div>

              <div className="text-left text-xs font-medium text-slate-500">
                <span className="block text-[10px] text-slate-400">تاريخ التقرير:</span>
                <strong className="text-slate-900 font-bold text-xs">{todayStr}</strong>
              </div>
            </header>

            {/* Student & Teacher Info Banner */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-700 text-white font-black text-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 block">بيانات الطالب</span>
                  <h2 className="text-lg font-black text-slate-950 leading-tight">{student.name}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {student.stage}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {student.grade}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {student.subjectType} {student.subjectName ? `(${student.subjectName})` : ''}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {student.courseType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:border-r sm:border-slate-300 sm:pr-4 text-right sm:text-left">
                <span className="text-[10px] text-slate-500 block">المعلم المشرف:</span>
                <strong className="text-sm font-black text-slate-900 block">{teacher.name}</strong>
                <span className="text-[11px] text-slate-600 block">{teacher.specialty}</span>
              </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-4 gap-2.5 my-4">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
                <span className="text-base font-black text-slate-900 block">{totalLessons}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">إجمالي الحصص</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
                <span className="text-base font-black text-emerald-700 block">{completedLessons}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">مكتملة</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
                <span className="text-base font-black text-blue-700 block">{payments.length}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">عدد الدفعات</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
                <span className="text-base font-black text-purple-700 block">{completionRate}%</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">نسبة الإنجاز</span>
              </div>
            </div>

            {/* Contact & Timeline Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              {/* Contact info */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span>معلومات التواصل والعنوان</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">جوال الطالب:</span>
                    <strong className="text-slate-800">{student.phone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      ولي الأمر ({student.guardianRelation || 'أب'}):
                    </span>
                    <strong className="text-slate-800">{student.guardianPhone || '—'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">العنوان:</span>
                    <strong className="text-slate-800">{student.location || '—'}</strong>
                  </div>
                  {student.buildingDetails && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[10px]">المبنى والتفاصيل:</span>
                      <strong className="text-slate-800">{student.buildingDetails}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Duration & Timeline */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>الجدول الزمني للدورة</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">أول حصة:</span>
                    <strong className="text-slate-800">
                      {firstLesson ? `${firstLesson.date} (${formatTimeArabic(firstLesson.time)})` : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">آخر حصة:</span>
                    <strong className="text-slate-800">
                      {lastLesson ? `${lastLesson.date} (${formatTimeArabic(lastLesson.time)})` : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">مدة الدورة:</span>
                    <strong className="text-slate-800">{courseDurationText}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">إجمالي الساعات:</span>
                    <strong className="text-slate-800">{totalHours} ساعة</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons Table */}
            <div className="my-5 border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-2.5 bg-slate-100 text-xs font-black text-slate-900 flex items-center justify-between">
                <span>سجل جميع الحصص والمواعيد ({lessons.length} حصة)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  سعر الساعة المعتمد: {student.price} ر.س
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2.5">التاريخ</th>
                      <th className="py-2 px-2 text-center">البداية</th>
                      <th className="py-2 px-2 text-center">النهاية</th>
                      <th className="py-2 px-2 text-center">المدة</th>
                      <th className="py-2 px-2.5 text-center">الحالة</th>
                      <th className="py-2 px-2.5 text-center">المستحق</th>
                      <th className="py-2 px-3">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lessons.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-slate-400">
                          لا توجد حصص مسجلة
                        </td>
                      </tr>
                    ) : (
                      lessons.map((l, index) => {
                        const endTime = calculateEndTime(l.date, l.time, l.duration);
                        const cost = calculateLessonCharge(student.price, l.duration);
                        return (
                          <tr key={l.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="py-1.5 px-2 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="py-1.5 px-2.5 font-bold text-slate-900">{l.date}</td>
                            <td className="py-1.5 px-2 text-center text-slate-700">{formatTimeArabic(l.time)}</td>
                            <td className="py-1.5 px-2 text-center text-slate-700">{formatTimeArabic(endTime)}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-slate-700">{l.duration} س</td>
                            <td className="py-1.5 px-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  l.status === 'تم'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : l.status === 'انتظار'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {l.status === 'تم' ? 'تمت' : l.status === 'انتظار' ? 'انتظار' : 'لم تتم'}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-center font-bold text-blue-700">{cost} ر.س</td>
                            <td className="py-1.5 px-3 text-slate-600 truncate max-w-[180px]">{l.notes || '—'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments & Financial Summary in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              {/* Payments Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-2.5 bg-slate-100 text-xs font-black text-slate-900 flex justify-between">
                  <span>سجل المدفوعات المسددة</span>
                  <span className="text-[10px] text-slate-500 font-bold">{payments.length} عملية</span>
                </div>
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700">
                      <th className="py-1.5 px-2 text-center w-8">#</th>
                      <th className="py-1.5 px-2.5">التاريخ</th>
                      <th className="py-1.5 px-2.5 text-center">المبلغ</th>
                      <th className="py-1.5 px-3">البيان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-slate-400">
                          لا توجد دفعات مسجلة
                        </td>
                      </tr>
                    ) : (
                      payments.map((p, index) => (
                        <tr key={p.id}>
                          <td className="py-1 px-2 text-center text-slate-400 font-bold">{index + 1}</td>
                          <td className="py-1 px-2.5 text-slate-800 font-medium">{p.date}</td>
                          <td className="py-1 px-2.5 text-center font-bold text-emerald-700">{p.amount} ر.س</td>
                          <td className="py-1 px-3 text-slate-600 truncate max-w-[120px]">{p.notes || 'دفعة'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Balance Overview */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/70 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1.5 mb-3">
                    الخلاصة المالية للملف
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">إجمالي قيمة الحصص المكتملة:</span>
                      <strong className="text-blue-700 font-black">{expectedIncome} ر.س</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">إجمالي المبالغ المسددة:</span>
                      <strong className="text-emerald-700 font-black">{totalPaid} ر.س</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 pt-1.5">
                      <span className="text-slate-900 font-black">المتبقي المطلوب سداده (الدين):</span>
                      <strong className={`font-black text-sm ${debt > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                        {debt} ر.س
                      </strong>
                    </div>
                  </div>
                </div>

                {student.notes && (
                  <div className="mt-3 p-2 rounded bg-white border border-slate-200 text-[10px] text-slate-600">
                    <span className="font-bold block text-slate-800">ملاحظات المعلم:</span>
                    {student.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Signature */}
            <footer className="pt-4 border-t border-slate-300 mt-6 flex justify-between items-center text-[10px] text-slate-500">
              <div>
                <span>نظام دفتر المعلم · تم إصدار هذا التقرير تلقائياً ومطابقته</span>
              </div>
              <div className="text-left font-bold text-slate-800">
                <span>توقيع المعلم: {teacher.name}</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
