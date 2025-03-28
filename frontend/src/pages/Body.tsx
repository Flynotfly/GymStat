import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import dayjs from 'dayjs';
import { Metric, MetricRecord } from "../types/metric";
import { fetchCsrf, getMetrics, getRecords, createRecord } from "../api.ts";

export default function Body() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [records, setRecords] = useState<MetricRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [value, setValue] = useState<number | ''>('');
  const [datetime, setDatetime] = useState<string>(''); // new datetime state
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  useEffect(() => {
    setLoadingMetrics(true);
    getMetrics({ type: "all" })
      .then(data => setMetrics(data))
      .catch(err => console.error("Error fetching metrics:", err))
      .finally(() => setLoadingMetrics(false));
  }, []);

  // Whenever the user selects a metric, fetch the corresponding records.
  useEffect(() => {
    if (selectedMetric) {
      getRecords({ metric: selectedMetric.id })
        .then(data => setRecords(data))
        .catch(err => console.error("Error fetching records:", err));
    }
  }, [selectedMetric]);

  const handleAddRecord = async () => {
    if (selectedMetric && value !== '' && datetime !== '') {
      const newRecord: Partial<MetricRecord> = {
        metric: selectedMetric.id,
        value: Number(value),
        datetime: datetime, // should be in ISO format from the datetime-local input
      };

      createRecord(newRecord).then(() => {
        setValue('');
        setDatetime('');
        if (selectedMetric) {
          getRecords({metric: selectedMetric.id})
            .then(data => setRecords(data))
            .catch(err => console.error("Error fetching records:", err));
        }
      }).catch(err => console.error("Error saving record:", err));
    }
  };

  const renderMetricList = (isAdminMetric: boolean) =>
    metrics
      .filter(metric => metric.admin === isAdminMetric)
      .map((metric, index) => (
        <Chip
          key={index}
          label={`${metric.name} (${metric.unit})`}
          variant={selectedMetric && selectedMetric.id === metric.id ? 'filled' : 'outlined'}
          onClick={() => setSelectedMetric(metric)}
          sx={{ margin: 0.5 }}
          color={selectedMetric && selectedMetric.id === metric.id ? 'primary' : 'default'}
        />
      ));

  if (loadingMetrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Body Metric Tracker
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Default Metrics</Typography>
        <Box sx={{ my: 2 }}>{renderMetricList(true)}</Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Your Custom Metrics</Typography>
        <Box sx={{ my: 2 }}>{renderMetricList(false)}</Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Add Metric Record</Typography>
        {selectedMetric ? (
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={`Value (${selectedMetric.unit})`}
                type="number"
                value={value}
                onChange={(e) =>
                  setValue(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Datetime"
                InputLabelProps={{ shrink: true }}
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddRecord}
              >
                Save Record
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Select a metric to add a record.
          </Typography>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">Your Metric Records</Typography>
        <List>
          {records.map((record, idx) => {
            // Assuming that record.metric is used as index into the metrics array.
            const metric = metrics[record.metric];
            return (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${metric.name}: ${record.value} ${metric.unit}`}
                  secondary={dayjs(record.datetime).format('MMMM D, YYYY h:mm A')}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}
