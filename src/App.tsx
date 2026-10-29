import React, { useState, useEffect, useCallback } from 'react';
import {
  Student,
  Lesson,
  Payment,
  TeacherProfile,
  ArchivedStudentRecord,
  ArchivedLessonRecord,
  AppData,
  AppNotification,
} from './types';
import {
  loadAppData,
  saveAppData,
  loadProfilesList,
  saveProfilesList,
  getCurrentProfileId,
  setCurrentProfileId,
  loadNotifications,
  saveNotifications,
} from './utils/storage';
import { isLessonOverdue, getTodayISO, formatDateArabic, formatTimeArabic } from './utils/dateUtils';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { StudentsTab } from './components/students/StudentsTab';
import { FinanceTab } from './components/finance/FinanceTab';
import { ContactTab } from './components/contact/ContactTab';
import { ProfileTab } from './components/profile/ProfileTab';

// Modals
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { LessonModal } from './components/students/LessonModal';
import { StudentModal } from './components/students/StudentModal';
import { StudentDetailsModal } from './components/students/StudentDetailsModal';
import { PaymentModal } from './components/students/PaymentModal';
import { FixedLessonsModal } from './components/students/FixedLessonsModal';
import { DayLessonsModal } from './components/dashboard/DayLessonsModal';
import { StudentReportModal } from './components/reports/StudentReportModal';
import { AllReportsModal } from './components/reports/AllReportsModal';
import { FinancialReportModal } from './components/finance/FinancialReportModal';
import { UserProfilesModal } from './components/profile/UserProfilesModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentProfileId, setCurrentProfileIdState] = useState<string>(getCurrentProfileId());
  const [profiles, setProfiles] = useState<TeacherProfile[]>(() => loadProfilesList());
  const [appData, setAppData] = useState<AppData>(() => loadAppData(currentProfileId));
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadNotifications(currentProfileId)
  );

  // Active student for modals
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [selectedStudentForFixed, setSelectedStudentForFixed] = useState<Student | null>(null);

  // Lesson modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonModalStudentId, setLessonModalStudentId] = useState<number | undefined>();
  const [lessonModalDate, setLessonModalDate] = useState<string | undefined>();
  const [editingLesson, setEditingLesson] = useState<{ studentId: number; lesson: Lesson } | null>(null);

  // Student modal state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Day Lessons modal state
  const [isDayLessonsModalOpen, setIsDayLessonsModalOpen] = useState(false);
  const [dayLessonsModalDate, setDayLessonsModalDate] = useState<string>(getTodayISO());

  // Other modals
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAllReportsModalOpen, setIsAllReportsModalOpen] = useState(false);
  const [isFinancialReportModalOpen, setIsFinancialReportModalOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);

  // Sync state to storage
  useEffect(() => {
    saveAppData(appData, currentProfileId);
  }, [appData, currentProfileId]);

  useEffect(() => {
    saveProfilesList(profiles);
  }, [profiles]);

  useEffect(() => {
    saveNotifications(notifications, currentProfileId);
  }, [notifications, currentProfileId]);

  // Keep selected student in sync if data changes
  useEffect(() => {
    if (selectedStudentForDetails) {
      const refreshed = appData.students.find((s) => s.id === selectedStudentForDetails.id);
      if (refreshed) setSelectedStudentForDetails(refreshed);
    }
  }, [appData.students, selectedStudentForDetails]);

  // Periodic Overdue Lesson Detection
  const checkOverdueLessons = useCallback(() => {
    const newNotifications: AppNotification[] = [];
    const existingIds = new Set(notifications.map((n) => n.id));

    appData.students.forEach((st) => {
      (st.lessons || []).forEach((l) => {
        if (l.status === 'انتظار' && isLessonOverdue(l.date, l.time)) {
          const noticeId = `overdue-${st.id}-${l.id}`;
          if (!existingIds.has(noticeId)) {
            newNotifications.push({
              id: noticeId,
              type: 'lesson-overdue',
              studentId: st.id,
              lessonId: l.id,
              title: `حصة متأخرة: ${st.name}`,
              message: `حصة يوم ${formatDateArabic(l.date)} الساعة ${formatTimeArabic(
                l.time
              )} ما زالت في الانتظار. يرجى تحديد حالتها.`,
              date: new Date().toISOString(),
              read: false,
            });
          }
        }
      });
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50));
    }
  }, [appData.students, notifications]);

  useEffect(() => {
    checkOverdueLessons();
    const interval = setInterval(checkOverdueLessons, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [checkOverdueLessons]);

  // --- Student Handlers ---
  const handleSaveStudent = (
    studentData: Omit<Student, 'id' | 'lessons' | 'payments'>,
    studentId?: number
  ) => {
    if (studentId) {
      // Edit
      setAppData((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId ? { ...s, ...studentData } : s
        ),
      }));
    } else {
      // Add
      const newStudent: Student = {
        ...studentData,
        id: Date.now(),
        lessons: [],
        payments: [],
        createdAt: new Date().toISOString(),
      };
      setAppData((prev) => ({
        ...prev,
        students: [newStudent, ...prev.students],
      }));
    }
  };

  const handleArchiveStudent = (student: Student) => {
    if (!confirm(`هل تريد نقل الطالب ${student.name} إلى الأرشيف؟ لن يُحذف أي من سجلاته.`)) {
      return;
    }

    const lessons = student.lessons || [];
    const firstL = lessons[0];
    const lastL = lessons[lessons.length - 1];

    const record: ArchivedStudentRecord = {
      id: student.id,
      archivedAt: new Date().toISOString(),
      student: { ...student, archived: true },
      stats: {
        firstLessonAt: firstL ? `${firstL.date} (${firstL.time})` : undefined,
        lastLessonAt: lastL ? `${lastL.date} (${lastL.time})` : undefined,
        lessonCount: lessons.length,
        paid: (student.payments || []).reduce((s, p) => s + (p.amount || 0), 0),
        debt: Math.max(
          0,
          lessons
            .filter((l) => l.status === 'تم')
            .reduce((s, l) => s + (student.price || 0) * (l.duration || 1), 0) -
            (student.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
        ),
      },
    };

    setAppData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== student.id),
      archivedStudents: [record, ...prev.archivedStudents],
    }));

    if (selectedStudentForDetails?.id === student.id) {
      setSelectedStudentForDetails(null);
    }
  };

  const handleRestoreStudent = (recordId: number) => {
    const record = appData.archivedStudents.find((r) => r.id === recordId);
    if (!record) return;

    setAppData((prev) => ({
      ...prev,
      archivedStudents: prev.archivedStudents.filter((r) => r.id !== recordId),
      students: [...prev.students, { ...record.student, archived: false }],
    }));
  };

  // --- Lesson Handlers ---
  const handleSaveLesson = (
    studentId: number,
    lessonData: Omit<Lesson, 'id'>,
    lessonId?: number
  ) => {
    setAppData((prev) => {
      const updatedStudents = prev.students.map((st) => {
        if (st.id !== studentId) return st;

        let updatedLessons: Lesson[];
        if (lessonId) {
          updatedLessons = (st.lessons || []).map((l) =>
            l.id === lessonId ? { ...l, ...lessonData } : l
          );
        } else {
          const newLesson: Lesson = {
            ...lessonData,
            id: Date.now() + Math.floor(Math.random() * 1000),
          };
          updatedLessons = [...(st.lessons || []), newLesson];
        }

        return { ...st, lessons: updatedLessons };
      });

      // If status is 'تم', sync into lessonArchive log
      let newLessonArchive = [...prev.lessonArchive];
      if (lessonData.status === 'تم') {
        const student = updatedStudents.find((s) => s.id === studentId);
        if (student) {
          const lId = lessonId || Date.now();
          const archiveKey = `${studentId}::${lId}`;
          const existingIdx = newLessonArchive.findIndex((a) => a.id === archiveKey);
          const record: ArchivedLessonRecord = {
            id: archiveKey,
            studentId,
            studentName: student.name,
            studentSnapshot: {
              name: student.name,
              stage: student.stage,
              grade: student.grade,
              subjectType: student.subjectType,
              courseType: student.courseType,
              price: student.price,
            },
            lesson: { ...lessonData, id: lId, status: 'تم', archived: true },
            archivedAt: new Date().toISOString(),
          };

          if (existingIdx >= 0) newLessonArchive[existingIdx] = record;
          else newLessonArchive.unshift(record);
        }
      }

      return {
        ...prev,
        students: updatedStudents,
        lessonArchive: newLessonArchive,
      };
    });

    // Dismiss overdue notification for this lesson if resolved
    if (lessonId) {
      setNotifications((prev) =>
        prev.filter((n) => !(n.studentId === studentId && n.lessonId === lessonId))
      );
    }
  };

  const handleDeleteLesson = (studentId: number, lessonId: number) => {
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          lessons: (st.lessons || []).filter((l) => l.id !== lessonId),
        };
      }),
      lessonArchive: prev.lessonArchive.filter((a) => a.id !== `${studentId}::${lessonId}`),
    }));

    setNotifications((prev) =>
      prev.filter((n) => !(n.studentId === studentId && n.lessonId === lessonId))
    );
  };

  const handleUpdateLessonStatus = (
    studentId: number,
    lessonId: number,
    status: 'تم' | 'انتظار' | 'لم تتم'
  ) => {
    setAppData((prev) => {
      const updatedStudents = prev.students.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          lessons: (st.lessons || []).map((l) =>
            l.id === lessonId ? { ...l, status, archived: status === 'تم' } : l
          ),
        };
      });

      let updatedLessonArchive = [...prev.lessonArchive];
      const archiveKey = `${studentId}::${lessonId}`;

      if (status === 'تم') {
        const student = updatedStudents.find((s) => s.id === studentId);
        const lesson = student?.lessons.find((l) => l.id === lessonId);
        if (student && lesson) {
          const rec: ArchivedLessonRecord = {
            id: archiveKey,
            studentId,
            studentName: student.name,
            studentSnapshot: {
              name: student.name,
              stage: student.stage,
              grade: student.grade,
              subjectType: student.subjectType,
              courseType: student.courseType,
              price: student.price,
            },
            lesson: { ...lesson, status: 'تم', archived: true },
            archivedAt: new Date().toISOString(),
          };
          updatedLessonArchive = [rec, ...updatedLessonArchive.filter((a) => a.id !== archiveKey)];
        }
      } else {
        updatedLessonArchive = updatedLessonArchive.filter((a) => a.id !== archiveKey);
      }

      return {
        ...prev,
        students: updatedStudents,
        lessonArchive: updatedLessonArchive,
      };
    });

    // Dismiss overdue notification
    setNotifications((prev) =>
      prev.filter((n) => !(n.studentId === studentId && n.lessonId === lessonId))
    );
  };

  const handleAddFixedLessons = (
    studentId: number,
    newLessons: Omit<Lesson, 'id'>[]
  ) => {
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        const instantiated: Lesson[] = newLessons.map((l, idx) => ({
          ...l,
          id: Date.now() + idx + Math.floor(Math.random() * 1000),
        }));
        return {
          ...st,
          lessons: [...(st.lessons || []), ...instantiated],
        };
      }),
    }));
  };

  // --- Payment Handlers ---
  const handleSavePayment = (studentId: number, paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now() + Math.floor(Math.random() * 1000),
    };

    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          payments: [newPayment, ...(st.payments || [])],
        };
      }),
    }));
  };

  const handleDeletePayment = (studentId: number, paymentId: number) => {
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          payments: (st.payments || []).filter((p) => p.id !== paymentId),
        };
      }),
    }));
  };

  // --- Teacher & Profile Handlers ---
  const handleSaveTeacher = (updated: TeacherProfile) => {
    setAppData((prev) => ({ ...prev, teacher: updated }));
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleSwitchProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    setCurrentProfileIdState(profileId);
    const loaded = loadAppData(profileId);
    setAppData(loaded);
    setNotifications(loadNotifications(profileId));
    setIsProfilesModalOpen(false);
  };

  const handleSaveProfileInModal = (profile: TeacherProfile) => {
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = profile;
        return copy;
      }
      return [...prev, profile];
    });

    if (profile.id === currentProfileId) {
      setAppData((prev) => ({ ...prev, teacher: profile }));
    }
  };

  const handleDeleteProfileInModal = (profileId: string) => {
    if (profiles.length <= 1) return;
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (currentProfileId === profileId) {
      const next = profiles.find((p) => p.id !== profileId);
      if (next) handleSwitchProfile(next.id);
    }
  };

  const handleRestoreBackup = (restored: AppData) => {
    setAppData(restored);
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === restored.teacher.id);
      if (!exists) return [...prev, restored.teacher];
      return prev.map((p) => (p.id === restored.teacher.id ? restored.teacher : p));
    });
  };

  // Day Lessons Modal Handler
  const handleOpenDayModal = (date: string, _dayLessons: any[]) => {
    setDayLessonsModalDate(date);
    setIsDayLessonsModalOpen(true);
  };

  // Get lessons for day modal
  const dayModalLessons = appData.students.flatMap((st) =>
    (st.lessons || [])
      .filter((l) => l.date === dayLessonsModalDate)
      .map((l) => ({
        studentId: st.id,
        studentName: st.name,
        subjectType: st.subjectType,
        lesson: l,
      }))
  );

  return (
    <div className="min-h-screen bg-[#0b1324] text-[#f3f6fd] flex" dir="rtl">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        teacher={appData.teacher}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Floating Glass Header */}
        <Header
          teacher={appData.teacher}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onRefreshData={checkOverdueLessons}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardTab
              students={appData.students}
              teacher={appData.teacher}
              onOpenAddLesson={(presetDate) => {
                setEditingLesson(null);
                setLessonModalStudentId(appData.students[0]?.id);
                setLessonModalDate(presetDate || getTodayISO());
                setIsLessonModalOpen(true);
              }}
              onOpenEditLesson={(studentId, lesson) => {
                setEditingLesson({ studentId, lesson });
                setIsLessonModalOpen(true);
              }}
              onUpdateLessonStatus={handleUpdateLessonStatus}
              onOpenDayModal={handleOpenDayModal}
              onOpenStudentDetails={(st) => setSelectedStudentForDetails(st)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              students={appData.students}
              archivedStudents={appData.archivedStudents}
              lessonArchive={appData.lessonArchive}
              onOpenAddStudent={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onOpenEditStudent={(st) => {
                setEditingStudent(st);
                setIsStudentModalOpen(true);
              }}
              onArchiveStudent={handleArchiveStudent}
              onRestoreStudent={handleRestoreStudent}
              onOpenStudentDetails={(st) => setSelectedStudentForDetails(st)}
              onOpenReportModal={(st) => setSelectedStudentForReport(st)}
              onOpenAllReports={() => setIsAllReportsModalOpen(true)}
              onOpenEditLesson={(studentId, lesson) => {
                setEditingLesson({ studentId, lesson });
                setIsLessonModalOpen(true);
              }}
              onDeleteLesson={handleDeleteLesson}
              onUpdateLessonStatus={handleUpdateLessonStatus}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              students={appData.students}
              archivedStudents={appData.archivedStudents}
              teacher={appData.teacher}
              onOpenFinancialReport={() => setIsFinancialReportModalOpen(true)}
              onOpenStudentDetails={(st) => setSelectedStudentForDetails(st)}
            />
          )}

          {activeTab === 'contact' && (
            <ContactTab
              students={appData.students}
              archivedStudents={appData.archivedStudents}
              teacher={appData.teacher}
              onOpenStudentDetails={(st) => setSelectedStudentForDetails(st)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              teacher={appData.teacher}
              appData={appData}
              students={appData.students}
              archivedStudents={appData.archivedStudents}
              onSaveTeacher={handleSaveTeacher}
              onRestoreBackup={handleRestoreBackup}
              onOpenProfilesModal={() => setIsProfilesModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* --- ALL APPLICATION MODALS --- */}

      {/* 1. Add / Edit Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setEditingLesson(null);
        }}
        onSave={handleSaveLesson}
        students={appData.students}
        initialStudentId={lessonModalStudentId}
        initialDate={lessonModalDate}
        editingLesson={editingLesson}
      />

      {/* 2. Add / Edit Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      {/* 3. Student Details Drawer / Modal */}
      {selectedStudentForDetails && (
        <StudentDetailsModal
          isOpen={!!selectedStudentForDetails}
          onClose={() => setSelectedStudentForDetails(null)}
          student={selectedStudentForDetails}
          onOpenReport={(st) => setSelectedStudentForReport(st)}
          onOpenAddLesson={(sId) => {
            setEditingLesson(null);
            setLessonModalStudentId(sId);
            setLessonModalDate(getTodayISO());
            setIsLessonModalOpen(true);
          }}
          onOpenEditLesson={(sId, lesson) => {
            setEditingLesson({ studentId: sId, lesson });
            setIsLessonModalOpen(true);
          }}
          onDeleteLesson={handleDeleteLesson}
          onUpdateLessonStatus={handleUpdateLessonStatus}
          onOpenAddPayment={(sId) => {
            const st = appData.students.find((s) => s.id === sId);
            if (st) setSelectedStudentForPayment(st);
          }}
          onDeletePayment={handleDeletePayment}
          onOpenFixedLessons={(sId) => {
            const st = appData.students.find((s) => s.id === sId);
            if (st) setSelectedStudentForFixed(st);
          }}
        />
      )}

      {/* 4. Payment Modal */}
      {selectedStudentForPayment && (
        <PaymentModal
          isOpen={!!selectedStudentForPayment}
          onClose={() => setSelectedStudentForPayment(null)}
          student={selectedStudentForPayment}
          onSavePayment={handleSavePayment}
        />
      )}

      {/* 5. Fixed Recurring Lessons Modal */}
      {selectedStudentForFixed && (
        <FixedLessonsModal
          isOpen={!!selectedStudentForFixed}
          onClose={() => setSelectedStudentForFixed(null)}
          student={selectedStudentForFixed}
          onAddLessons={handleAddFixedLessons}
        />
      )}

      {/* 6. Day Lessons Modal */}
      <DayLessonsModal
        isOpen={isDayLessonsModalOpen}
        onClose={() => setIsDayLessonsModalOpen(false)}
        date={dayLessonsModalDate}
        lessons={dayModalLessons}
        onOpenAddLesson={(presetDate) => {
          setEditingLesson(null);
          setLessonModalStudentId(appData.students[0]?.id);
          setLessonModalDate(presetDate);
          setIsLessonModalOpen(true);
        }}
        onOpenEditLesson={(sId, lesson) => {
          setEditingLesson({ studentId: sId, lesson });
          setIsLessonModalOpen(true);
        }}
        onDeleteLesson={handleDeleteLesson}
        onUpdateStatus={handleUpdateLessonStatus}
      />

      {/* 7. Comprehensive Student Report Modal (A4 / PDF) */}
      {selectedStudentForReport && (
        <StudentReportModal
          isOpen={!!selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
          student={selectedStudentForReport}
          teacher={appData.teacher}
        />
      )}

      {/* 8. All Reports Hub Modal */}
      <AllReportsModal
        isOpen={isAllReportsModalOpen}
        onClose={() => setIsAllReportsModalOpen(false)}
        students={appData.students}
        onSelectStudent={(st) => setSelectedStudentForReport(st)}
      />

      {/* 9. Financial Report PDF Modal */}
      <FinancialReportModal
        isOpen={isFinancialReportModalOpen}
        onClose={() => setIsFinancialReportModalOpen(false)}
        students={appData.students}
        archivedStudents={appData.archivedStudents}
        teacher={appData.teacher}
      />

      {/* 10. User Profiles Modal */}
      <UserProfilesModal
        isOpen={isProfilesModalOpen}
        onClose={() => setIsProfilesModalOpen(false)}
        profiles={profiles}
        currentProfileId={currentProfileId}
        onSwitchProfile={handleSwitchProfile}
        onSaveProfile={handleSaveProfileInModal}
        onDeleteProfile={handleDeleteProfileInModal}
      />

      {/* 11. Overdue Lessons Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        students={appData.students}
        onUpdateLessonStatus={handleUpdateLessonStatus}
        onOpenStudent={(st) => {
          setIsNotificationsModalOpen(false);
          setSelectedStudentForDetails(st);
        }}
        onClearAllNotifications={() => setNotifications([])}
        onDismissNotification={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />
    </div>
  );
}
