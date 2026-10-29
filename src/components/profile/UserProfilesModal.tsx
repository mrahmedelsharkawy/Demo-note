import React, { useState } from 'react';
import { TeacherProfile } from '../../types';
import { X, Users, UserPlus, Check, Trash2, Edit3, UserCheck } from 'lucide-react';

interface UserProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: TeacherProfile[];
  currentProfileId: string;
  onSwitchProfile: (profileId: string) => void;
  onSaveProfile: (profile: TeacherProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}

export const UserProfilesModal: React.FC<UserProfilesModalProps> = ({
  isOpen,
  onClose,
  profiles,
  currentProfileId,
  onSwitchProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('الرياض');
  const [experience, setExperience] = useState(5);
  const [bio, setBio] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const startNewProfile = () => {
    setEditingId(null);
    setName('');
    setSpecialty('معلم خصوصي');
    setPhone('');
    setEmail('');
    setCity('الرياض');
    setExperience(5);
    setBio('');
    setIsAddingNew(true);
  };

  const startEditProfile = (p: TeacherProfile) => {
    setEditingId(p.id);
    setName(p.name);
    setSpecialty(p.specialty);
    setPhone(p.phone);
    setEmail(p.email);
    setCity(p.city);
    setExperience(p.experience);
    setBio(p.bio);
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم المعلم');
      return;
    }

    const profileToSave: TeacherProfile = {
      id: editingId || `profile-${Date.now()}`,
      name: name.trim(),
      specialty: specialty.trim() || 'معلم خصوصي',
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      experience: Number(experience) || 0,
      bio: bio.trim(),
    };

    onSaveProfile(profileToSave);
    setIsAddingNew(false);
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#14233c] border border-white/15 rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">إدارة البروفايلات والمستخدمين</h3>
              <p className="text-xs text-slate-400">التبديل بين حسابات المعلمين أو إضافة بروفايل مخصص</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {!isAddingNew ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-300">قائمة البروفايلات المحفوظة:</span>
                <button
                  type="button"
                  onClick={startNewProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>مستخدم جديد</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {profiles.map((p) => {
                  const isCurrent = p.id === currentProfileId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-blue-600/20 border-blue-400/50 shadow-md'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSwitchProfile(p.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isCurrent
                              ? 'bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white truncate">{p.name}</h4>
                            {isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                                النشط حالياً
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.specialty} · {p.city || 'الرياض'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditProfile(p)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="تعديل البروفايل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل تريد بالتأكيد حذف بروفايل ${p.name}؟`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="حذف البروفايل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add or Edit Form */
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-extrabold text-white text-sm">
                  {editingId ? 'تعديل بيانات البروفايل' : 'إضافة بروفايل جديد'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  إلغاء والعودة
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المعلم / المستخدم *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="مثال: أ. أحمد الشرقاوي"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: معلم رياضيات"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المدينة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="الرياض"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">سنوات الخبرة</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نبذة عن المعلم</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="معلم متخصص في..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-extrabold shadow-md"
                >
                  حفظ البروفايل
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
