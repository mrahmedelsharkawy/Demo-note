import React, { useState, useEffect } from 'react';
import { Student, CourseType, SubjectType } from '../../types';
import { X, UserPlus, Phone, MapPin, DollarSign, BookOpen, User } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'lessons' | 'payments'>, studentId?: number) => void;
  editingStudent?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
}) => {
  const [name, setName] = useState('');
  const [stage, setStage] = useState('ثانوي');
  const [grade, setGrade] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('حضوري');
  const [subjectType, setSubjectType] = useState<SubjectType>('منهج');
  const [subjectName, setSubjectName] = useState('');
  const [price, setPrice] = useState<number>(100);
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('أب');
  const [location, setLocation] = useState('');
  const [buildingDetails, setBuildingDetails] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name || '');
      setStage(editingStudent.stage || 'ثانوي');
      setGrade(editingStudent.grade || '');
      setCourseType(editingStudent.courseType || 'حضوري');
      setSubjectType(editingStudent.subjectType || 'منهج');
      setSubjectName(editingStudent.subjectName || '');
      setPrice(editingStudent.price || 100);
      setPhone(editingStudent.phone || '');
      setGuardianPhone(editingStudent.guardianPhone || '');
      setGuardianRelation(editingStudent.guardianRelation || 'أب');
      setLocation(editingStudent.location || '');
      setBuildingDetails(editingStudent.buildingDetails || '');
      setNotes(editingStudent.notes || '');
    } else {
      setName('');
      setStage('ثانوي');
      setGrade('');
      setCourseType('حضوري');
      setSubjectType('منهج');
      setSubjectName('');
      setPrice(100);
      setPhone('');
      setGuardianPhone('');
      setGuardianRelation('أب');
      setLocation('');
      setBuildingDetails('');
      setNotes('');
    }
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى كتابة اسم الطالب');
      return;
    }

    onSave(
      {
        name: name.trim(),
        stage,
        grade: grade.trim() || 'غير محدد',
        courseType,
        subjectType,
        subjectName: subjectName.trim(),
        price: Math.max(0, Number(price) || 0),
        phone: phone.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianRelation,
        location: location.trim(),
        buildingDetails: buildingDetails.trim(),
        notes: notes.trim(),
      },
      editingStudent?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#14233c] border border-white/15 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
              </h3>
              <p className="text-xs text-slate-400">سجل البيانات التعليمية والتواصل والموقع وسعر الساعة</p>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>اسم الطالب الثلاثي *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="مثال: فيصل بن عبدالعزيز العتيبي"
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-teal-500 text-sm"
            />
          </div>

          {/* Stage & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة الدراسية</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              >
                <option value="ابتدائي">ابتدائي</option>
                <option value="متوسط">متوسط</option>
                <option value="ثانوي">ثانوي</option>
                <option value="جامعي">جامعي</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الصف الدراسي</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="مثال: ثالث ثانوي علمي"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>
          </div>

          {/* Course Type & Subject Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">طبيعة الحصة</label>
              <select
                value={courseType}
                onChange={(e) => setCourseType(e.target.value as CourseType)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              >
                <option value="حضوري">حضوري (بمنزل الطالب)</option>
                <option value="أونلاين">أونلاين (عن بعد)</option>
                <option value="مختلط">مختلط (حضوري وأونلاين)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع المنهج</label>
              <select
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value as SubjectType)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              >
                <option value="منهج">منهج مدرسي</option>
                <option value="قدرات">قدرات عامة</option>
                <option value="تحصيلي">تحصيلي علمي</option>
                <option value="لغات">لغات ومحادثة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          {/* Subject Name & Hourly Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>اسم المادة</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="مثال: رياضيات، فيزياء، لغة إنجليزية"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>سعر الساعة (ر.س) *</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>
          </div>

          {/* Phones */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>رقم هاتف الطالب</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-right text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>رقم ولي الأمر</span>
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-right text-sm"
              />
            </div>
          </div>

          {/* Relation to guardian */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">صلة قرابة ولي الأمر</label>
            <select
              value={guardianRelation}
              onChange={(e) => setGuardianRelation(e.target.value)}
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold text-sm"
            >
              <option value="أب">الأب</option>
              <option value="أم">الأم</option>
              <option value="أخ">الأخ / الأخت</option>
              <option value="ولي أمر">ولي أمر آخر</option>
              <option value="الطالب نفسه">الطالب نفسه</option>
            </select>
          </div>

          {/* Address & Building */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>العنوان / الحي / المدينة</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: الرياض - حي النرجس - شارع التخصصي"
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">تفاصيل المبنى والدور والشقة</label>
            <input
              type="text"
              value={buildingDetails}
              onChange={(e) => setBuildingDetails(e.target.value)}
              placeholder="مثال: عمارة رقم 12، الدور الثاني، شقة رقم 4"
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول مستوى الطالب، مواعيد تفضيلية، إلخ..."
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-teal-500/25 transition-all"
            >
              {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
