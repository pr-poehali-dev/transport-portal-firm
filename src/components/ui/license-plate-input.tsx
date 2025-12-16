import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface LicensePlateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const LicensePlateInput = forwardRef<HTMLInputElement, LicensePlateInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      input = input.replace(/[^A-Za-zА-Яа-яЁё0-9-]/g, '');
      
      input = input.toUpperCase();
      
      onChange(input);
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="AB1234-5"
        className={className}
        {...props}
      />
    );
  }
);

LicensePlateInput.displayName = 'LicensePlateInput';

export default LicensePlateInput;
