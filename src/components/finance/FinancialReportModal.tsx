import React, { useRef, useState } from 'react';
import { Student, ArchivedStudentRecord, TeacherProfile } from '../../types';
import { X, FileText, Download, Calendar, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import {
  CALENDAR_MONTH_LABELS,
  getAllTransactions,
  getTotalDebts,
  calculateLessonCharge,
} from '../../utils/financeUtils';
import { formatDateArabic, getTodayISO } from '../../utils/dateUtils';
import { exportElementToPDF } from '../../utils/pdfExport';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  teacher: TeacherProfile;
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  students,
  archivedStudents,
  teacher,
}) => {
  const [reportMode, setReportMode] = useState<'month' | 'year'>('month');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allTransactions = getAllTransactions(students, archivedStudents);

  // Filter transactions for period
  const periodTransactions = allTransactions.filter((t) => {
    const parts = (t.date || '').slice(0, 10).split('-').map(Number);
    if (parts.length < 3 || parts[0] !== selectedYear) return false;
    if (reportMode === 'month' && parts[1] !== selectedMonth) return false;
    return true;
  });

  const totalPaidInPeriod = periodTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Completed lessons earned in period
  const allStudents = [...students, ...archivedStudents.map((r) => r.student).filter(Boolean)];
  let earnedInPeriod = 0;
  allStudents.forEach((st) => {
    (st.lessons || []).forEach((l) => {
      if (l.status !== 'تم' || !l.date) return;
      const parts = l.date.split('-').map(Number);
      if (parts[0] !== selectedYear) return;
      if (reportMode === 'month' && parts[1] !== selectedMonth) return;
      earnedInPeriod += calculateLessonCharge(st.price, l.duration);
    });
  });

  const currentDebts = getTotalDebts(students, archivedStudents);

  // Series data for bar chart
  let chartLabels: string[] = [];
  let chartValues: number[] = [];

  if (reportMode === 'year') {
    chartLabels = CALENDAR_MONTH_LABELS;
    chartValues = Array(12).fill(0);
    periodTransactions.forEach((t) => {
      const m = parseInt(t.date.slice(5, 7), 10);
      if (m >= 1 && m <= 12) chartValues[m - 1] += Number(t.amount) || 0;
    });
  } else {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    chartLabels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    chartValues = Array(daysInMonth).fill(0);
    periodTransactions.forEach((t) => {
      const d = parseInt(t.date.slice(8, 10), 10);
      if (d >= 1 && d <= daysInMonth) chartValues[d - 1] += Number(t.amount) || 0;
    });
  }

  const maxChartValue = Math.max(1, ...chartValues);

  const handleDownloadPDF = async () => {
    if (!sheetRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await exportElementToPDF(sheetRef.current, {
        filename: `تقرير-مالي-${reportMode === 'year' ? selectedYear : `${selectedMonth}-${selectedYear}`}`,
        orientation: reportMode === 'year' ? 'landscape' : 'portrait',
      });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير التقرير المالي');
    } finally {
      setIsExporting(false);
    }
  };

  const monthName = CALENDAR_MONTH_LABELS[selectedMonth - 1] || '';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#121c2e] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-right my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">التقرير المالي وتصدير PDF</h3>
              <p className="text-xs text-slate-400">حدد الفترة الزمنية للحصول على تقرير مفصل بالأرباح والرسم البياني</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جارٍ التصدير...' : 'تصدير PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              title="إغلاق التقرير المالي"
              aria-label="إغلاق التقرير المالي"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Period Selector Controls */}
        <div className="p-4 bg-slate-800/60 border-b border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">نوع التقرير</label>
            <select
              value={reportMode}
              onChange={(e) => setReportMode(e.target.value as 'month' | 'year')}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs"
            >
              <option value="month">تقرير شهر محدد</option>
              <option value="year">تقرير سنوي كامل</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">الشهر</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              disabled={reportMode === 'year'}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs disabled:opacity-40"
            >
              {CALENDAR_MONTH_LABELS.map((label, idx) => (
                <option key={label} value={idx + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">السنة</label>
            <input
              type="number"
              min="2020"
              max="2035"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs"
            />
          </div>
        </div>

        {/* Sheet Content to Export */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          <div
            ref={sheetRef}
            className="max-w-[780px] mx-auto bg-white text-slate-900 p-8 rounded-2xl shadow-xl font-sans"
            dir="rtl"
          >
            {/* Sheet Title */}
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-5">
              <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase block">
                TEACHER NOTEBOOK · FINANCIAL STATEMENT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                {reportMode === 'year'
                  ? `التقرير المالي السنوي لعام ${selectedYear}`
                  : `التقرير المالي لشهر ${monthName} ${selectedYear}`}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                المعلم: <strong>{teacher.name}</strong> · تاريخ الإصدار: {formatDateArabic(getTodayISO())}
              </p>
            </div>

            {/* 4 Financial Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  الدفعات المحصلة بالفترة
                </span>
                <strong className="text-base font-black text-emerald-700 block">
                  {totalPaidInPeriod.toLocaleString('ar-SA')} ر.س
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  عدد المعاملات المسجلة
                </span>
                <strong className="text-base font-black text-blue-700 block">
                  {periodTransactions.length} عملية
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  قيمة الحصص المكتملة
                </span>
                <strong className="text-base font-black text-purple-700 block">
                  {earnedInPeriod.toLocaleString('ar-SA')} ر.س
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  إجمالي الديون القائمة
                </span>
                <strong className={`text-base font-black block ${currentDebts > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {currentDebts.toLocaleString('ar-SA')} ر.س
                </strong>
              </div>
            </div>

            {/* Visual SVG Bar Chart for PDF rendering */}
            <div className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-black text-slate-900">
                  {reportMode === 'year' ? 'توزيع الدخل الشهري بالأعمدة' : 'توزيع الدفعات اليومية خلال الشهر'}
                </span>
                <span className="text-[11px] text-slate-500">القيم بالريال السعودي (ر.س)</span>
              </div>

              <div className="h-44 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-slate-300">
                {chartValues.map((val, idx) => {
                  const heightPercent = val > 0 ? Math.max(8, (val / maxChartValue) * 100) : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {val > 0 && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 mb-1 tabular-nums whitespace-nowrap">
                          {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                        </span>
                      )}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all ${
                          val > 0
                            ? reportMode === 'year'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                            : 'bg-slate-200/50'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[8px] sm:text-[9px] text-slate-500 pt-2 font-medium overflow-x-auto">
                {chartLabels.map((label, idx) => (
                  <span key={idx} className="flex-1 text-center truncate">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Transactions Breakdown Sample */}
            <div className="my-4 border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-2 bg-slate-100 text-xs font-black text-slate-900 flex justify-between">
                <span>سجل الدفعات المحصلة في هذه الفترة</span>
                <span className="text-[10px] text-slate-500">{periodTransactions.length} معاملة</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="py-1.5 px-2 text-center w-8">#</th>
                      <th className="py-1.5 px-2.5">التاريخ</th>
                      <th className="py-1.5 px-3">اسم الطالب</th>
                      <th className="py-1.5 px-2.5 text-center">المبلغ</th>
                      <th className="py-1.5 px-3">البيان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {periodTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          لا توجد دفعات محصلة في هذه الفترة
                        </td>
                      </tr>
                    ) : (
                      periodTransactions.map((t, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{t.date}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">{t.studentName}</td>
                          <td className="py-1.5 px-2.5 text-center font-black text-emerald-700">{t.amount} ر.س</td>
                          <td className="py-1.5 px-3 text-slate-600 truncate max-w-[150px]">{t.notes || 'دفعة'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex justify-between items-center text-[10px] text-slate-500">
              <span>نظام دفتر المعلم · تقرير مالي موثق</span>
              <span>توقيع المعلم: {teacher.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
