import React from 'react';
import { LayoutDashboard, Users, Wallet, PhoneCall, UserCheck } from 'lucide-react';
import { TabType } from './Sidebar';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'students' as TabType, label: 'الطلاب', icon: Users },
    { id: 'finance' as TabType, label: 'المالية', icon: Wallet },
    { id: 'contact' as TabType, label: 'تواصل', icon: PhoneCall },
    { id: 'profile' as TabType, label: 'حسابي', icon: UserCheck },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#0f172a]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around"
      aria-label="التنقل السفلي"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${
              isActive
                ? 'text-teal-400 bg-white/10 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-400 stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-bold leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
