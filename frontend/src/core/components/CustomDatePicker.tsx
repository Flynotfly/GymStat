import React, { useState, } from 'react';
import Button from "@mui/material/Button";
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

// A custom button field to trigger the pop-up DatePicker.
interface ButtonFieldProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  label?: string;
  id?: string;
  disabled?: boolean;
}
function ButtonField(props: ButtonFieldProps) {
  const { setOpen, label, id, disabled } = props;
  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      size="small"
      onClick={() => setOpen && setOpen(prev => !prev)}
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      sx={{ minWidth: 'fit-content' }}
    >
      {label ? label : 'Pick a date'}
    </Button>
  );
}

// A controlled pop-up DatePicker.
interface CustomDatePickerProps {
  value: Dayjs;
  onChange: (newValue: Dayjs | null) => void;
}
export default function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={onChange}
        slots={{ field: ButtonField }}
        slotProps={{
          field: { setOpen } as any,
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
        }}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        views={['day', 'month', 'year']}
      />
    </LocalizationProvider>
  );
}