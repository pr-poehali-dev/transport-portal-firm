import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
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

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
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
