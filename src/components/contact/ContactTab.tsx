import React, { useState } from 'react';
import { Student, ArchivedStudentRecord, TeacherProfile } from '../../types';
import {
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Building,
  User,
  Users,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { calculateStudentDebt, calculateStudentExpected, calculateStudentPaid } from '../../utils/financeUtils';

interface ContactTabProps {
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  teacher: TeacherProfile;
  onOpenStudentDetails: (student: Student) => void;
}

export const ContactTab: React.FC<ContactTabProps> = ({
  students,
  archivedStudents,
  teacher,
  onOpenStudentDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'archived'>('active');

  const cleanPhone = (p: string = '') => p.replace(/[^0-9]/g, '');

  const activeList = students.map((s) => ({ student: s, isArchived: false }));
  const archivedList = archivedStudents.map((r) => ({ student: r.student, isArchived: true }));

  let combined = [...activeList, ...archivedList];
  if (filterType === 'active') combined = activeList;
  if (filterType === 'archived') combined = archivedList;

  const filtered = combined.filter(({ student }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      (student.phone || '').includes(q) ||
      (student.guardianPhone || '').includes(q) ||
      (student.location || '').toLowerCase().includes(q)
    );
  });

  const getWhatsAppMessage = (student: Student) => {
    return encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته، معكم الأستاذ ${teacher.name} بخصوص حصص الطالب ${student.name}.`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">دليل التواصل والعناوين</h2>
          <p className="text-xs text-slate-400 mt-1">
            أرقام الهواتف، المراسلة الفورية عبر واتساب، مواقع المنازل والخرائط، والرصيد المالي
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'active'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الطلاب الحاليين ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('archived')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'archived'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الأرشيف ({archivedStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'all'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الطالب، رقم الجوال، هاتف ولي الأمر، أو الحي..."
          className="w-full pr-11 pl-4 py-3 bg-[#121f35] border border-white/10 rounded-2xl text-white font-medium text-xs md:text-sm outline-none focus:border-teal-500 shadow-md"
        />
      </div>

      {/* Contact Cards List */}
      <div className="grid grid-cols-1 gap-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-white/5 text-slate-400 text-sm font-bold">
            لا توجد جهات اتصال تطابق البحث
          </div>
        ) : (
          filtered.map(({ student, isArchived }) => {
            const primaryPhone = student.guardianPhone || student.phone;
            const debt = calculateStudentDebt(student);
            const paid = calculateStudentPaid(student);
            const exp = calculateStudentExpected(student);

            return (
              <div
                key={`${isArchived ? 'arch' : 'act'}-${student.id}`}
                className={`p-4 md:p-5 rounded-3xl border transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isArchived
                    ? 'bg-slate-900/50 border-amber-500/20'
                    : 'bg-[#14233c] border-white/10 hover:border-teal-500/30'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3.5 min-w-0 md:w-1/3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow ${
                      isArchived
                        ? 'bg-amber-600/60'
                        : 'bg-gradient-to-br from-blue-600 to-teal-500'
                    }`}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white truncate">{student.name}</h3>
                      {isArchived && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          مؤرشف
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      التواصل مع: <strong className="text-slate-300">{student.guardianRelation || 'ولي الأمر'}</strong> · {student.stage}
                    </p>
                    {student.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{student.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons (Call, WhatsApp, Maps) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {primaryPhone ? (
                    <>
                      <a
                        href={`https://wa.me/${cleanPhone(primaryPhone)}?text=${getWhatsAppMessage(student)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold transition-colors"
                        title="محادثة واتساب مباشرة"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>واتساب</span>
                      </a>

                      <a
                        href={`tel:${cleanPhone(primaryPhone)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
                        title="اتصال هاتفي"
                      >
                        <Phone className="w-4 h-4" />
                        <span>اتصال ({student.guardianRelation || 'ولي الأمر'})</span>
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 italic">لا يوجد رقم هاتف</span>
                  )}

                  {student.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(student.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                      title="فتح الموقع في خرائط Google"
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Financial quick badge */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">الرصيد المالي</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-400 font-bold">{paid} ر.س</span>
                      {debt > 0 ? (
                        <span className="text-rose-400 font-black">({debt} دين)</span>
                      ) : (
                        <span className="text-slate-500">(خالص)</span>
                      )}
                    </div>
                  </div>

                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => onOpenStudentDetails(student)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
                      title="فتح ملف الطالب"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
