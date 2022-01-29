import React, { useState, ReactNode } from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Input from '@mui/material/Input'
import FilledInput from '@mui/material/FilledInput'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import FormHelperText from '@mui/material/FormHelperText'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

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
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{params.helperText}</FormHelperText>
    </FormControl>
  )
}
