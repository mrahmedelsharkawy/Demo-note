import React, { useState } from 'react';
import { Payment, Student } from '../../types';
import { X, Wallet, Calendar, DollarSign, FileText } from 'lucide-react';
import { getTodayISO } from '../../utils/dateUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSavePayment: (studentId: number, payment: Omit<Payment, 'id'>) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSavePayment,
}) => {
  const [date, setDate] = useState(getTodayISO());
  const [amount, setAmount] = useState<number>(student.price || 100);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح للدفعة');
      return;
    }

    onSavePayment(student.id, {
      date,
      amount: Number(amount),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#14233c] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">تسجيل دفعة مالية</h3>
              <p className="text-xs text-slate-400">للطالب: {student.name}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>تاريخ الدفعة</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>المبلغ المسدد (ر.س) *</span>
              </label>
              {student.price > 0 && (
                <div className="flex gap-1.5">
                  {[1, 2, 4].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setAmount(student.price * mult)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                    >
                      {mult} حصص ({student.price * mult})
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-emerald-400 font-extrabold text-base outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>طريقة الدفع / ملاحظات</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تحويل بنكي الراجحي، كاش، stc pay"
              className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold shadow-lg shadow-emerald-500/25 transition-all"
            >
              حفظ الدفعة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
