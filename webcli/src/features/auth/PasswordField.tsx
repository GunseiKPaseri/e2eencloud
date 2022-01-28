import React, { useState, ReactNode } from 'react'
import { FormControl, InputLabel, Input, FilledInput, OutlinedInput, InputAdornment, IconButton, FormHelperText } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput
}

export const PasswordField = (params:{
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
  margin?: 'dense'|'none'|'normal',
  variant?: 'filled'|'outlined'|'standard',
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const InputComponent = variantComponent[params.variant || 'outlined']
  return (
    <FormControl
      variant={params.variant}
      fullWidth={params.fullWidth}
      required={params.required}
      margin={params.margin}
      error={params.error}
    >
      <InputLabel htmlFor={params.id}>{params.label}</InputLabel>
      <InputComponent
        id={params.id}
        name={params.name}
        type={showPassword ? 'text' : 'password'}
        value={params.value}
        onChange={params.onChange}
        fullWidth={params.fullWidth}
        label={params.label}
        required={params.required}
        autoComplete={params.autoComplete}
        error={params.error}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={(e) => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{params.helperText}</FormHelperText>
    </FormControl>
  )
}
