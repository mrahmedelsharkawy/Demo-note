import React from 'react';
import { LayoutDashboard, Users, Wallet, PhoneCall, UserCheck, GraduationCap } from 'lucide-react';
import { TeacherProfile } from '../types';

export type TabType = 'dashboard' | 'students' | 'finance' | 'contact' | 'profile';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  teacher: TeacherProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, teacher }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'students' as TabType, label: 'سجل الطلاب', icon: Users },
    { id: 'finance' as TabType, label: 'السجل المالي', icon: Wallet },
    { id: 'contact' as TabType, label: 'تواصل', icon: PhoneCall },
    { id: 'profile' as TabType, label: 'حسابي', icon: UserCheck },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#0d1627] border-l border-white/10 p-5 sticky top-0 h-screen z-30">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight leading-tight">دفتر المعلم</h1>
            <span className="text-[11px] text-teal-400 font-medium">إدارة الحصص والدخل</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5" aria-label="القائمة الجانبية">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 text-right ${
                  isActive
                    ? 'bg-gradient-to-l from-blue-600/90 to-teal-600/90 text-white shadow-md shadow-blue-600/20 border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Teacher Footer Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onTabChange('profile')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onTabChange('profile');
        }}
        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 cursor-pointer transition-colors text-right"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {teacher.photo ? (
            <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <span>{teacher.name ? teacher.name.charAt(0) : 'م'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{teacher.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{teacher.specialty}</p>
        </div>
      </div>
    </aside>
  );
};
