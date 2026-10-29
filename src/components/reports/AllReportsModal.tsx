import React, { useState } from 'react';
import { Student } from '../../types';
import { X, Search, FileText, ArrowRight, Share2, Eye, User } from 'lucide-react';
import { calculateCompletedLessonsCount } from '../../utils/financeUtils';

interface AllReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const AllReportsModal: React.FC<AllReportsModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.grade || '').toLowerCase().includes(q) ||
      (s.subjectName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#121c2e] border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">تقارير الطلاب الشاملة (PDF)</h3>
              <p className="text-xs text-slate-400">اختر طالباً لعرض تقريره الأكاديمي الشامل وطباعته أو مشاركته</p>
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

        {/* Search */}
        <div className="p-4 border-b border-white/5 bg-slate-900/60 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطالب..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Students list */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 text-xs">
              لا يوجد طلاب يطابقون البحث
            </div>
          ) : (
            filtered.map((st) => {
              const total = (st.lessons || []).length;
              const completed = calculateCompletedLessonsCount(st);
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    onClose();
                    onSelectStudent(st);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 text-right group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {st.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-white truncate group-hover:text-teal-300 transition-colors">
                        {st.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {st.stage} · {st.grade} · إنجاز {rate}%
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 text-slate-300 group-hover:text-teal-400 group-hover:bg-white/10 transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
