import React, { useState } from 'react';
import { Student, ArchivedStudentRecord, TeacherProfile } from '../../types';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  getTotalIncome,
  getExpectedIncome,
  getTotalDebts,
  calculateStudentDebt,
  calculateStudentExpected,
  calculateStudentPaid,
  calculateCompletedLessonsCount,
  calculatePendingLessonsCount,
  getAllTransactions,
  getAcademicMonthlyIncome,
  getCalendarYearMonthlyIncome,
  ACADEMIC_MONTH_LABELS,
  CALENDAR_MONTH_LABELS,
} from '../../utils/financeUtils';
import { formatDateArabic } from '../../utils/dateUtils';

interface FinanceTabProps {
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  teacher: TeacherProfile;
  onOpenFinancialReport: () => void;
  onOpenStudentDetails: (student: Student) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  students,
  archivedStudents,
  teacher,
  onOpenFinancialReport,
  onOpenStudentDetails,
}) => {
  const [chartMode, setChartMode] = useState<'academic' | 'calendar'>('academic');
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState('');

  const totalCollected = getTotalIncome(students, archivedStudents);
  const totalExpected = getExpectedIncome(students, archivedStudents);
  const totalDebts = getTotalDebts(students, archivedStudents);

  const transactions = getAllTransactions(students, archivedStudents);

  const filteredTransactions = transactions.filter((t) => {
    if (!transactionSearch.trim()) return true;
    const q = transactionSearch.toLowerCase();
    return t.studentName.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q);
  });

  // Chart data
  const academicData = getAcademicMonthlyIncome(students, archivedStudents);
  const currentYear = new Date().getFullYear();
  const calendarData = getCalendarYearMonthlyIncome(currentYear, students, archivedStudents);

  const activeChart = chartMode === 'academic' ? academicData : calendarData;
  const maxMonthlyVal = Math.max(1, ...activeChart.values);
  const activeChartTotal = activeChart.values.reduce((sum, v) => sum + v, 0);

  // Export transactions to CSV
  const exportTransactionsCSV = () => {
    if (transactions.length === 0) {
      alert('لا توجد دفعات لتصديرها');
      return;
    }

    const headers = ['المعرف', 'التاريخ', 'اسم الطالب', 'المبلغ (ر.س)', 'الملاحظات'];
    const rows = transactions.map((t, idx) => [
      idx + 1,
      t.date,
      `"${t.studentName}"`,
      t.amount,
      `"${t.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_المدفوعات_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">السجل المالي</h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة الدخل الفعلي المحصل، الدخل المتوقع، ديون الطلاب، والتقارير المالية المعتمدة
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFinancialReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          <span>إصدار تقرير مالي PDF</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#14233c] border-r-4 border-r-emerald-500 border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي الدخل المحصل</span>
            <strong className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
              {totalCollected.toLocaleString('ar-SA')} ر.س
            </strong>
            <span className="text-[10px] text-slate-500 block mt-1">جميع المبالغ المستلمة من الدفعات</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#14233c] border-r-4 border-r-blue-500 border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">الدخل المتوقع / المستحق</span>
            <strong className="text-2xl md:text-3xl font-black text-blue-400 tabular-nums">
              {totalExpected.toLocaleString('ar-SA')} ر.س
            </strong>
            <span className="text-[10px] text-slate-500 block mt-1">قيمة الحصص المكتملة فعلياً</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#14233c] border-r-4 border-r-rose-500 border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block mb-1">ديون ومستحقات الطلاب</span>
            <strong className="text-2xl md:text-3xl font-black text-rose-400 tabular-nums">
              {totalDebts.toLocaleString('ar-SA')} ر.س
            </strong>
            <span className="text-[10px] text-slate-500 block mt-1">المتبقي المطلوب تحصيله</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Per-Student Financial Breakdown Card */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm md:text-base text-white">تفاصيل الحساب المالي لكل طالب</h3>
            <p className="text-xs text-slate-400">مقارنة المستحق والمدفوع وحالة السداد</p>
          </div>
          <span className="text-xs text-slate-400 font-bold">{students.length} طالب نشط</span>
        </div>

        <div className="divide-y divide-white/5">
          {students.map((st) => {
            const exp = calculateStudentExpected(st);
            const paid = calculateStudentPaid(st);
            const debt = calculateStudentDebt(st);
            const completedCount = calculateCompletedLessonsCount(st);
            const pendingUnpaid = calculatePendingLessonsCount(st);

            return (
              <div
                key={st.id}
                className="p-4 md:p-5 hover:bg-white/5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Student info */}
                <div className="min-w-0 lg:w-1/3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onOpenStudentDetails(st)}
                      className="font-extrabold text-sm text-white hover:text-teal-400 transition-colors"
                    >
                      {st.name}
                    </button>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {st.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>الحصص المكتملة: {completedCount}</span>
                    </span>

                    {pendingUnpaid > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        <span>غير مدفوعة: {pendingUnpaid}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 Metric Value Boxes */}
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <span className="text-[10px] text-blue-300 font-bold block mb-0.5">إجمالي المستحق</span>
                    <strong className="text-xs md:text-sm font-black text-blue-400 tabular-nums">
                      {exp} ر.س
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-emerald-300 font-bold block mb-0.5">تم دفعه</span>
                    <strong className="text-xs md:text-sm font-black text-emerald-400 tabular-nums">
                      {paid} ر.س
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[10px] text-rose-300 font-bold block mb-0.5">الدين المتبقي</span>
                    <strong
                      className={`text-xs md:text-sm font-black tabular-nums ${
                        debt > 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {debt} ر.س
                    </strong>
                  </div>
                </div>

                {/* Quick Profile Link */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenStudentDetails(st)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 text-xs font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <span>كشف الحساب</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Revenue Visual Chart */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 shadow-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">الرسم البياني لتوزيع الدخل الشهري</h3>
              <p className="text-xs text-slate-400">إجمالي المبالغ المحصلة بالفترة: {activeChartTotal.toLocaleString('ar-SA')} ر.س</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/10 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setChartMode('academic')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                chartMode === 'academic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              العام الدراسي (يوليو - يونيو)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('calendar')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                chartMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              السنة الميلادية {currentYear}
            </button>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="pt-6 pb-2 px-2 border-b border-white/10">
          <div className="h-48 md:h-56 flex items-end gap-1.5 md:gap-3 justify-between">
            {activeChart.values.map((val, idx) => {
              const heightPercent = val > 0 ? Math.max(10, (val / maxMonthlyVal) * 100) : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {val > 0 && (
                    <span className="text-[10px] md:text-xs font-black text-teal-400 mb-1.5 tabular-nums whitespace-nowrap">
                      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </span>
                  )}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      val > 0
                        ? 'bg-gradient-to-t from-blue-600 to-teal-400 group-hover:brightness-125 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800/40'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[9px] md:text-xs text-slate-400 pt-3 font-bold overflow-x-auto">
            {activeChart.labels.map((label, idx) => (
              <span key={idx} className="flex-1 text-center truncate">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Ledger Accordion */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTransactionsOpen((prev) => !prev)}
          className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-right hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white">سجل جميع الدفعات والمعاملات</h3>
              <p className="text-xs text-slate-400">كشف مفصل بجميع الحركات المالية وإمكانية تصديرها كملف CSV</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
              {transactions.length} عملية
            </span>
          </div>
        </button>

        {transactionsOpen && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <input
                type="search"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder="بحث في المعاملات باسم الطالب أو البيان..."
                className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs flex-1 outline-none"
              />

              <button
                type="button"
                onClick={exportTransactionsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير CSV</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">لا توجد دفعات مسجلة</div>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <div
                    key={`${t.studentId}-${t.id}-${idx}`}
                    className="p-3 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{t.studentName}</span>
                        {t.archived && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            مؤرشف
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                        <span>{formatDateArabic(t.date)}</span>
                        {t.notes && (
                          <>
                            <span>·</span>
                            <span>{t.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <strong className="text-sm font-black text-emerald-400 tabular-nums">
                      + {t.amount} ر.س
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
