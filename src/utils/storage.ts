import { AppData, Student, TeacherProfile, ArchivedStudentRecord, ArchivedLessonRecord, BackupLog, AppNotification } from '../types';
import { DEFAULT_TEACHER_PROFILE, getInitialDemoStudents } from '../data/demoData';

const CURRENT_PROFILE_KEY = 'teacherNotebookCurrentProfile';
const PROFILES_LIST_KEY = 'teacherNotebookProfiles';

export function getCurrentProfileId(): string {
  try {
    return localStorage.getItem(CURRENT_PROFILE_KEY) || 'profile-main';
  } catch {
    return 'profile-main';
  }
}

export function setCurrentProfileId(id: string): void {
  try {
    localStorage.setItem(CURRENT_PROFILE_KEY, id);
  } catch (e) {
    console.error('Failed to set current profile ID', e);
  }
}

export function getProfileStorageKey(profileId: string): string {
  return `teacherNotebookProfileData-${profileId || 'profile-main'}`;
}

export function getNotificationStorageKey(profileId: string): string {
  return `teacherNotebookNotifications-${profileId || 'profile-main'}`;
}

export function loadProfilesList(): TeacherProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load profiles list', e);
  }
  return [DEFAULT_TEACHER_PROFILE];
}

export function saveProfilesList(profiles: TeacherProfile[]): void {
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles list', e);
  }
}

export function loadAppData(profileId: string = getCurrentProfileId()): AppData {
  try {
    const key = getProfileStorageKey(profileId);
    let raw = localStorage.getItem(key);

    // Legacy fallback check
    if (!raw && profileId === 'profile-main') {
      const legacy = localStorage.getItem('teacherNotebookData');
      if (legacy) {
        raw = legacy;
        localStorage.setItem(key, legacy);
      }
    }

    if (raw) {
      const data: Partial<AppData> = JSON.parse(raw);
      return {
        version: 4,
        updatedAt: data.updatedAt || new Date().toISOString(),
        profileId,
        teacher: data.teacher || DEFAULT_TEACHER_PROFILE,
        students: Array.isArray(data.students) ? data.students : [],
        archivedStudents: Array.isArray(data.archivedStudents) ? data.archivedStudents : [],
        lessonArchive: Array.isArray(data.lessonArchive) ? data.lessonArchive : [],
        backupLogs: Array.isArray(data.backupLogs) ? data.backupLogs : [],
      };
    }
  } catch (e) {
    console.error('Error loading app data from localStorage', e);
  }

  // First time initialization with demo data for pleasant user experience
  const initialData: AppData = {
    version: 4,
    updatedAt: new Date().toISOString(),
    profileId,
    teacher: DEFAULT_TEACHER_PROFILE,
    students: getInitialDemoStudents(),
    archivedStudents: [],
    lessonArchive: [],
    backupLogs: [],
  };

  saveAppData(initialData, profileId);
  return initialData;
}

export function saveAppData(data: AppData, profileId: string = getCurrentProfileId()): void {
  try {
    const key = getProfileStorageKey(profileId);
    const serialized = JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
      profileId,
    });
    localStorage.setItem(key, serialized);
    // Sync main backup key
    if (profileId === 'profile-main') {
      localStorage.setItem('teacherNotebookData', serialized);
      localStorage.setItem('teacherProfile', JSON.stringify(data.teacher));
    }
  } catch (e) {
    console.error('Failed to save app data', e);
  }
}

export function loadNotifications(profileId: string = getCurrentProfileId()): AppNotification[] {
  try {
    const raw = localStorage.getItem(getNotificationStorageKey(profileId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  return [];
}

export function saveNotifications(
  notifications: AppNotification[],
  profileId: string = getCurrentProfileId()
): void {
  try {
    localStorage.setItem(getNotificationStorageKey(profileId), JSON.stringify(notifications.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function downloadBackupJSON(data: AppData): void {
  const now = new Date();
  const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `teacher-notebook-backup-${dateStamp}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function parseAndValidateBackupJSON(rawText: string): AppData {
  const parsed = JSON.parse(rawText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('ملف النسخة الاحتياطية غير صالح.');
  }

  if (
    !Array.isArray(parsed.students) &&
    !parsed.teacher &&
    !Array.isArray(parsed.archivedStudents)
  ) {
    throw new Error('هيكل ملف النسخة الاحتياطية لا يحتوي على بيانات المعلم أو الطلاب.');
  }

  return {
    version: parsed.version || 4,
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    profileId: parsed.profileId || getCurrentProfileId(),
    teacher: parsed.teacher || DEFAULT_TEACHER_PROFILE,
    students: Array.isArray(parsed.students) ? parsed.students : [],
    archivedStudents: Array.isArray(parsed.archivedStudents) ? parsed.archivedStudents : [],
    lessonArchive: Array.isArray(parsed.lessonArchive) ? parsed.lessonArchive : [],
    backupLogs: Array.isArray(parsed.backupLogs) ? parsed.backupLogs : [],
  };
}
