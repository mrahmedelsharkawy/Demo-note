import React, { useState, useEffect } from 'react';
import { AnalogClock } from './AnalogClock';
import { TeacherProfile, AppNotification } from '../types';
import { Bell, RefreshCw, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { formatWeekdayArabic, formatDateArabic, formatTimeArabic } from '../utils/dateUtils';

interface HeaderProps {
  teacher: TeacherProfile;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  notifications,
  onOpenNotifications,
  onOpenProfile,
  onRefreshData,
}) => {
  const [now, setNow] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayISO = now.toISOString().slice(0, 10);
  const currentTime12 = formatTimeArabic(
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  );
  const weekday = formatWeekdayArabic(todayISO);
  const formattedDate = formatDateArabic(todayISO);

  const overdueCount = notifications.filter((n) => !n.read).length;

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c1527]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Clock Widget (Analog + Digital) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AnalogClock size={48} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm md:text-base font-extrabold text-white tracking-wider tabular-nums">
                {currentTime12}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className="font-bold text-teal-400">{weekday}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions & Teacher Identity */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Refresh data */}
          <button
            type="button"
            onClick={handleRefreshClick}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="الإشعارات والتنبيهات"
            aria-label={`الإشعارات ${overdueCount > 0 ? `(${overdueCount} غير مقروء)` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {overdueCount}
              </span>
            )}
          </button>

          {/* Teacher Profile Mini */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 md:py-1.5 md:px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-white/10 text-right transition-colors"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <span>{teacher.name ? teacher.name.charAt(0) : <GraduationCap className="w-4 h-4" />}</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white max-w-[120px] truncate">{teacher.name}</span>
              <span className="text-[10px] text-teal-300 max-w-[120px] truncate">{teacher.specialty || 'معلم'}</span>
            </div>
            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400 mr-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
