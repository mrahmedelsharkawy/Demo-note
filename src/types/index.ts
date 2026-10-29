export type LessonStatus = 'تم' | 'انتظار' | 'لم تتم';

export type StageType = 'ابتدائي' | 'متوسط' | 'ثانوي' | 'جامعي' | 'أخرى';
export type CourseType = 'حضوري' | 'أونلاين' | 'مختلط';
export type SubjectType = 'منهج' | 'قدرات' | 'تحصيلي' | 'لغات' | 'أخرى';

export interface Lesson {
  id: number;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm (24h)
  duration: number;   // In hours, e.g. 1, 1.25, 1.5, 2
  status: LessonStatus;
  notes?: string;
  archived?: boolean;
}

export interface Payment {
  id: number;
  date: string;       // YYYY-MM-DD
  amount: number;
  notes?: string;
}

export interface Student {
  id: number;
  name: string;
  stage: string;              // ابتدائي، متوسط، ثانوي، جامعي
  grade: string;              // الصف الدراسي (مثال: أول ثانوي)
  courseType: CourseType;     // حضوري / أونلاين
  subjectType: SubjectType;   // منهج / قدرات / تحصيلي
  subjectName?: string;       // اسم المادة (مثال: رياضيات، فيزياء، لغة إنجليزية)
  price: number;              // سعر الساعة بريال
  phone: string;              // جوال الطالب
  guardianPhone: string;      // جوال ولي الأمر
  guardianRelation: string;   // أب / أم / أخ / أخرى
  location: string;           // العنوان / الحي
  buildingDetails?: string;   // رقم المبنى، الدور، الشقة
  notes?: string;
  lessons: Lesson[];
  payments: Payment[];
  archived?: boolean;
  createdAt?: string;
}

export interface ArchivedStudentRecord {
  id: number;
  archivedAt: string;
  student: Student;
  stats: {
    firstLessonAt?: string;
    lastLessonAt?: string;
    lessonCount: number;
    paid: number;
    debt: number;
  };
}

export interface ArchivedLessonRecord {
  id: string; // studentId::lessonId
  studentId: number;
  studentName: string;
  studentSnapshot: {
    name: string;
    stage: string;
    grade: string;
    subjectType: string;
    courseType: string;
    price: number;
  };
  lesson: Lesson;
  archivedAt: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  city: string;
  experience: number;
  bio: string;
  photo?: string;
}

export interface BackupLog {
  id: number;
  type: 'download' | 'upload';
  fileName: string;
  date: string;
}

export interface AppNotification {
  id: string;
  type: 'lesson-overdue' | 'system';
  lessonId?: number;
  studentId?: number;
  title: string;
  message: string;
  date?: string;
  read?: boolean;
}

export interface AppData {
  version: number;
  updatedAt: string;
  profileId: string;
  teacher: TeacherProfile;
  students: Student[];
  archivedStudents: ArchivedStudentRecord[];
  lessonArchive: ArchivedLessonRecord[];
  backupLogs: BackupLog[];
}
