import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  maxDate?: 'today' | 'none';
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, maxDate = 'none', className, ...props }, ref) => {
    const isValidDate = (day: number, month: number, year: number): boolean => {
      if (month < 1 || month > 12) return false;
      if (day < 1) return false;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) return false;
      
      if (maxDate === 'today') {
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (inputDate > today) return false;
      }
      
      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      input = input.replace(/[^\d]/g, '');
      
      if (input.length >= 2) {
        input = input.slice(0, 2) + '-' + input.slice(2);
      }
      if (input.length >= 5) {
        input = input.slice(0, 5) + '-' + input.slice(5);
      }
      
      if (input.length > 10) {
        input = input.slice(0, 10);
      }
      
      onChange(input);
    };

    const handleBlur = () => {
      if (value.length === 10) {
        const parts = value.split('-');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (!isValidDate(day, month, year)) {
          onChange('');
        }
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="ДД-ММ-ГГГГ"
        className={className}
        maxLength={10}
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;