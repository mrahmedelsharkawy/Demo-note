import { Student, TeacherProfile } from '../types';
import { getTodayISO } from '../utils/dateUtils';

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  id: 'profile-main',
  name: 'أ. أحمد الشرقاوي',
  specialty: 'معلم خصوصي - رياضيات وقدرات وتحصيلي',
  phone: '0501234567',
  email: 'prof.ahmed.elsharkawy@gmail.com',
  city: 'الرياض',
  experience: 12,
  bio: 'معلم خبير متخصص في تبسيط الرياضيات وتدريب الطلاب على اختبارات القدرات العامة والتحصيلي وتحقيق أعلى المعدلات.',
  photo: '',
};

export function getInitialDemoStudents(): Student[] {
  const today = getTodayISO();
  const d = new Date();
  
  // Helper to format ISO with offset
  const getOffsetDate = (days: number): string => {
    const target = new Date(d);
    target.setDate(target.getDate() + days);
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      id: 1,
      name: 'فيصل العتيبي',
      stage: 'ثانوي',
      grade: 'ثالث ثانوي',
      courseType: 'حضوري',
      subjectType: 'تحصيلي',
      subjectName: 'رياضيات تحصيلي',
      price: 150,
      phone: '0551122334',
      guardianPhone: '0505544332',
      guardianRelation: 'أب',
      location: 'الرياض - حي النرجس',
      buildingDetails: 'عمارة 14 - الدور الثاني - شقة 5',
      notes: 'التركيز على التفاضل والتكامل وحساب المثلثات',
      lessons: [
        { id: 101, date: getOffsetDate(-4), time: '16:30', duration: 1.5, status: 'تم', notes: 'شرح أساسيات التكامل المحدد' },
        { id: 102, date: getOffsetDate(-1), time: '16:30', duration: 1.5, status: 'تم', notes: 'حل تجميعات تحصيلي 2025' },
        { id: 103, date: today, time: '17:00', duration: 1.5, status: 'انتظار', notes: 'مراجعة القطوع المخروطية' },
        { id: 104, date: getOffsetDate(3), time: '17:00', duration: 1.5, status: 'انتظار', notes: 'نماذج اختبار تحصيلي تجريبي' },
      ],
      payments: [
        { id: 1001, date: getOffsetDate(-4), amount: 450, notes: 'دفعة تحويل بنكي مقدماً' }
      ]
    },
    {
      id: 2,
      name: 'سارة القحطاني',
      stage: 'ثانوي',
      grade: 'ثاني ثانوي',
      courseType: 'أونلاين',
      subjectType: 'قدرات',
      subjectName: 'قدرات كمي',
      price: 120,
      phone: '0549988776',
      guardianPhone: '0562233445',
      guardianRelation: 'أم',
      location: 'جدة - حي الروضة',
      buildingDetails: 'أونلاين عبر منصة زووم',
      notes: 'مسار علمي - التركيز على الهندسة والمسائل الجبرية',
      lessons: [
        { id: 201, date: getOffsetDate(-6), time: '19:00', duration: 1, status: 'تم', notes: 'استراتيجيات الحل السريع والأنماط' },
        { id: 202, date: getOffsetDate(-2), time: '19:00', duration: 1, status: 'تم', notes: 'النسبة والتناسب ومسائل الأعمار' },
        { id: 203, date: today, time: '19:00', duration: 1.25, status: 'انتظار', notes: 'المقارنات والرسوم البيانية' },
        { id: 204, date: getOffsetDate(2), time: '19:00', duration: 1, status: 'انتظار', notes: 'اختبار محاكي قياس' },
      ],
      payments: [
        { id: 2001, date: getOffsetDate(-6), amount: 240, notes: 'سداد حصتين' }
      ]
    },
    {
      id: 3,
      name: 'ريان الغامدي',
      stage: 'متوسط',
      grade: 'ثالث متوسط',
      courseType: 'حضوري',
      subjectType: 'منهج',
      subjectName: 'رياضيات المنهج',
      price: 100,
      phone: '0533344556',
      guardianPhone: '0507788990',
      guardianRelation: 'أب',
      location: 'الرياض - حي الياسمين',
      buildingDetails: 'فيلا 28 - شارع ابن سينا',
      notes: 'طالب مجتهد يحتاج تقوية في الهندسة الإحداثية',
      lessons: [
        { id: 301, date: getOffsetDate(-7), time: '15:00', duration: 1, status: 'تم', notes: 'المعادلات الخطية وأنظمة المعادلات' },
        { id: 302, date: getOffsetDate(-3), time: '15:00', duration: 1, status: 'تم', notes: 'الدوال والتمثيل البياني' },
        { id: 303, date: getOffsetDate(1), time: '15:00', duration: 1, status: 'انتظار', notes: 'المتباينات الخطية' },
      ],
      payments: [
        { id: 3001, date: getOffsetDate(-7), amount: 100, notes: 'كاش - نقدي' }
      ]
    },
    {
      id: 4,
      name: 'فاطمة الشهري',
      stage: 'جامعي',
      grade: 'سنة أولى كلية العلوم',
      courseType: 'أونلاين',
      subjectType: 'منهج',
      subjectName: 'حسبان (Calculus 101)',
      price: 180,
      phone: '0577788991',
      guardianPhone: '0501122334',
      guardianRelation: 'أب',
      location: 'الدمام - حي الشاطئ',
      buildingDetails: 'أونلاين',
      notes: 'تجهيز لميدتيرم الحسبان بجامعة الإمام',
      lessons: [
        { id: 401, date: getOffsetDate(-5), time: '21:00', duration: 2, status: 'تم', notes: 'Limits and Continuity' },
        { id: 402, date: getOffsetDate(-2), time: '21:00', duration: 1.5, status: 'تم', notes: 'Derivatives and Chain Rule' },
        { id: 403, date: getOffsetDate(4), time: '21:00', duration: 2, status: 'انتظار', notes: 'Applications of Derivatives' },
      ],
      payments: [
        { id: 4001, date: getOffsetDate(-5), amount: 360, notes: 'تحويل stc pay' }
      ]
    }
  ];
}
