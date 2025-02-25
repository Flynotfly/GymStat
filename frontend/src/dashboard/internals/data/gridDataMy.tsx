import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import {GridCellParams, GridRowsProp, GridColDef, GridColumnGroup} from '@mui/x-data-grid';
// import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import {Link} from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

// type SparkLineData = number[];

export interface TrainingInterface {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  quantity_exercises: string;
  max_weight: number;
  max_repetitions: number;
};

// function getDaysInMonth(month: number, year: number) {
//   const date = new Date(year, month, 0);
//   const monthName = date.toLocaleDateString('en-US', {
//     month: 'short',
//   });
//   const daysInMonth = date.getDate();
//   const days = [];
//   let i = 1;
//   while (days.length < daysInMonth) {
//     days.push(`${monthName} ${i}`);
//     i += 1;
//   }
//   return days;
// }

// function renderSparklineCell(params: GridCellParams<SparkLineData, any>) {
//   const data = getDaysInMonth(4, 2024);
//   const { value, colDef } = params;
//
//   if (!value || value.length === 0) {
//     return null;
//   }
//
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
//       <SparkLineChart
//         data={value}
//         width={colDef.computedWidth || 100}
//         height={32}
//         plotType="bar"
//         showHighlight
//         showTooltip
//         colors={['hsl(210, 98%, 42%)']}
//         xAxis={{
//           scaleType: 'band',
//           data,
//         }}
//       />
//     </div>
//   );
// }

// function renderStatus(status: 'Online' | 'Offline') {
//   const colors: { [index: string]: 'success' | 'default' } = {
//     Online: 'success',
//     Offline: 'default',
//   };
//
//   return <Chip label={status} color={colors[status]} size="small" />;
// }

export function renderAvatar(
  params: GridCellParams<{ name: string; color: string }, any, any>,
) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

function renderView(params: GridCellParams) {
  return (
      <Chip
          label="View"
          component={Link}
          to={`/trainings/${params.id}`}
          clickable
          variant="outlined"
          color="primary"
          icon={<OpenInFullIcon/>}
      />
  );
}

function renderEdit(params: GridCellParams) {
  return (
      <Chip
          label="Edit"
          component={Link}
          to={`/trainings/${params.id}/edit`}
          clickable
          variant="outlined"
          color="secondary"
          icon={<EditIcon/>}
      />
  );
}

export const columns: GridColDef[] = [
  { field: 'date', headerName: 'Date', flex: 1, minWidth: 100 },
  {
    field: 'time',
    headerName: 'Time',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'duration',
    headerName: 'Duration',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'max_weight',
    headerName: 'Weight',
    headerAlign: 'right',
    align: 'right',
    flex: 0.5,
    minWidth: 50,
  },
  {
    field: 'max_repetitions',
    headerName: 'Reps',
    headerAlign: 'right',
    align: 'right',
    flex: 0.5,
    minWidth: 50,
  },
  {
    field: 'view',
    headerName: '',
    minWidth: 80,
    maxWidth: 80,
    sortable: false,
    filterable: false,
    renderCell: renderView,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'edit',
    headerName: '',
    minWidth: 80,
    maxWidth: 80,
    sortable: false,
    filterable: false,
    renderCell: renderEdit,
    headerAlign: 'center',
    align: 'center',
  },
];

// Starting date for the training sessions
const startDate = new Date('2025-01-25');

// Helper function to generate a date string offset by a given number of days
const generateDate = (offset: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  // Months in JavaScript are 0-indexed, so add 1 and pad with a leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Sample arrays for time, title, and duration to add variety to our data
const times = ['06:30', '07:00', '08:15', '17:00', '18:30', '19:00'];
const titles = [
  'Upper Body Blast',
  'Leg Day',
  'Cardio Session',
  'Full Body Workout',
  'Chest and Triceps',
  'Back and Biceps',
];
const durations = ['1h', '1h 15m', '1h 30m', '45m', '1h 45m'];

// Generate 40 training data rows
export const rows: GridRowsProp = Array.from({ length: 40 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    date: generateDate(index),
    time: times[index % times.length],
    title: titles[index % titles.length],
    duration: durations[index % durations.length],
    // Varying bench press weight: cycles through 90, 92.5, 95, 97.5, and 100 kg
    maxBenchPressWeight: 90 + (index % 5) * 2.5 + ' kg',
    // Varying bench press reps: cycles through 1 to 5
    maxBenchPressReps: (index % 5) + 1,
  };
});

export const columnGroupingModel: GridColumnGroup[] = [
  {
    groupId: 'Bench press max',
    headerAlign: 'center',
    children:   [{field: 'max_weight'}, {field: 'max_repetitions'}],
  },
];
