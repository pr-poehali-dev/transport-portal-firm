import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      input = input.replace(/[^\d+]/g, '');
      
      if (input.length > 0 && input[0] !== '+') {
        input = '+' + input;
      }
      
      const plusCount = (input.match(/\+/g) || []).length;
      if (plusCount > 1) {
        input = '+' + input.replace(/\+/g, '');
      }
      
      onChange(input);
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="+375291234567"
        className={className}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
