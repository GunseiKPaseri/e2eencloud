import React, { useState, ReactNode } from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

export default function PasswordField({
  autoComplete,
  error,
  fullWidth,
  helperText,
  id,
  label,
  name,
  onChange,
  required,
  value,
  margin,
  variant,
}:{
  autoComplete?:string,
  error?:boolean,
  fullWidth?: boolean,
  helperText?: ReactNode,
  id: string,
  label: string,
  name: string,
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>,
  required?: boolean,
  value?: unknown,
  margin?: 'dense' | 'none' | 'normal',
  variant?: 'filled' | 'outlined' | 'standard',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const InputComponent = variantComponent[variant || 'outlined'];
  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      required={required}
      margin={margin}
      error={error}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <InputComponent
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        fullWidth={fullWidth}
        label={label}
        required={required}
        autoComplete={autoComplete}
        error={error}
        endAdornment={(
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        )}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
