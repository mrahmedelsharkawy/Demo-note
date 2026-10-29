import React, { useState, useRef } from 'react';
import { TeacherProfile, BackupLog, AppData, Student, ArchivedStudentRecord } from '../../types';
import {
  UserCheck,
  Camera,
  Save,
  Download,
  Upload,
  Clock,
  Users,
  HardDrive,
  FileJson,
  CheckCircle2,
  BookOpen,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { downloadBackupJSON, parseAndValidateBackupJSON } from '../../utils/storage';
import { formatDateArabic } from '../../utils/dateUtils';
import { getTotalIncome } from '../../utils/financeUtils';

interface ProfileTabProps {
  teacher: TeacherProfile;
  appData: AppData;
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  onSaveTeacher: (updated: TeacherProfile) => void;
  onRestoreBackup: (restoredData: AppData) => void;
  onOpenProfilesModal: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  teacher,
  appData,
  students,
  archivedStudents,
  onSaveTeacher,
  onRestoreBackup,
  onOpenProfilesModal,
}) => {
  const [formName, setFormName] = useState(teacher.name);
  const [formSpecialty, setFormSpecialty] = useState(teacher.specialty);
  const [formPhone, setFormPhone] = useState(teacher.phone);
  const [formEmail, setFormEmail] = useState(teacher.email);
  const [formCity, setFormCity] = useState(teacher.city || 'الرياض');
  const [formExperience, setFormExperience] = useState(teacher.experience || 5);
  const [formBio, setFormBio] = useState(teacher.bio || '');
  const [photo, setPhoto] = useState(teacher.photo || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeacherProfile = {
      ...teacher,
      name: formName.trim(),
      specialty: formSpecialty.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      city: formCity.trim(),
      experience: Number(formExperience) || 0,
      bio: formBio.trim(),
      photo,
    };
    onSaveTeacher(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    downloadBackupJSON(appData);
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const validated = parseAndValidateBackupJSON(text);
      if (
        confirm(
          `تم قراءة ملف النسخة الاحتياطية بنجاح:\n` +
          `- الطلاب: ${validated.students.length}\n` +
          `- الحصص المؤرشفة: ${validated.lessonArchive.length}\n` +
          `هل تريد استبدال بيانات التطبيق الحالية بهذه النسخة؟`
        )
      ) {
        onRestoreBackup(validated);
        alert('تم استعادة النسخة الاحتياطية بنجاح!');
      }
    } catch (err: any) {
      alert(`فشلت استعادة النسخة: ${err.message || 'الملف غير صالح'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalLessonsCount = students.reduce((sum, s) => sum + (s.lessons || []).length, 0);
  const completedCount = students.reduce(
    (sum, s) => sum + (s.lessons || []).filter((l) => l.status === 'تم').length,
    0
  );
  const totalRevenue = getTotalIncome(students, archivedStudents);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">بروفايل المعلم والإعدادات</h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة البيانات الشخصية والمهنية، التبديل بين البروفايلات، والنسخ الاحتياطي
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProfilesModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>إدارة البروفايلات والمستخدمين</span>
        </button>
      </div>

      {/* Teacher Profile Card */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 shadow-xl overflow-hidden">
        {/* Cover Gradient */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-blue-700 via-indigo-800 to-teal-700 relative">
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <div className="px-5 md:px-8 pb-8">
          {/* Avatar & Upload */}
          <div className="-mt-14 sm:-mt-16 relative w-fit mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 p-2 shadow-2xl border border-white/20">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-inner">
                {photo ? (
                  <img src={photo} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{teacher.name ? teacher.name.charAt(0) : 'م'}</span>
                )}
              </div>
            </div>

            <label
              className="absolute bottom-1 right-1 w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center cursor-pointer shadow-lg hover:bg-teal-400 transition-colors"
              title="تغيير الصورة"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">اسم المعلم *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">التخصص والمواد</label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="مثال: معلم رياضيات وقدرات وتحصيلي"
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">المدينة</label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">سنوات الخبرة</label>
                <input
                  type="number"
                  min="0"
                  value={formExperience}
                  onChange={(e) => setFormExperience(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">نبذة تعريفية</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="نبذة مختصرة تظهر في التقارير والملف الشخصي..."
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {saveSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم حفظ التعديلات بنجاح!</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">احرص على تحديث بياناتك دورياً</span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-teal-500/25 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات البروفايل</span>
              </button>
            </div>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">الطلاب المسجلين</span>
              <strong className="text-xl font-black text-white tabular-nums">
                {students.length + archivedStudents.length}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">إجمالي الحصص</span>
              <strong className="text-xl font-black text-blue-400 tabular-nums">{totalLessonsCount}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">حصص مكتملة</span>
              <strong className="text-xl font-black text-emerald-400 tabular-nums">{completedCount}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">إجمالي الدخل المحصل</span>
              <strong className="text-base font-black text-teal-400 tabular-nums">
                {totalRevenue.toLocaleString('ar-SA')} ر.س
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Vault */}
      <div className="rounded-3xl bg-[#121f35] border border-white/10 shadow-xl p-5 md:p-7">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-base text-white">النسخ الاحتياطي والأمان (Backup Vault)</h3>
            <p className="text-xs text-slate-400">
              قم بتحميل نسخة احتياطية من جميع بياناتك لحفظها على جهازك، أو استعد نسخة سابقة في أي وقت
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تحميل نسخة احتياطية (Download Backup)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-teal-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>استرداد نسخة سابقة (Restore Backup)</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileRestore}
        />

        <div className="mt-4 p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            يتم تخزين بياناتك محلياً بشكل آمن ومشفر داخل متصفحك دون إرسالها إلى أي خوادم خارجية غير مصرح بها.
          </span>
        </div>
      </div>
    </div>
  );
};
