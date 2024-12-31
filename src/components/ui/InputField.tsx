import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  autoComplete
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-secondary-400 mb-1">
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      required
      value={value}
      onChange={onChange}
      className={`input-field ${error ? 'border-red-500' : ''}`}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-label={label}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default React.memo(InputField); 