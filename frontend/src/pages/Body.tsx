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
import {Metric, MetricRecord} from "../types/metric";
import {fetchCsrf, getMetrics} from "../api.ts";


export default function Body() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [records] = useState<MetricRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [value, setValue] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getMetrics({"type": "all"})
      .then(data => setMetrics(data))
      .catch(err => console.error("Error fetching metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const renderMetricList = (isAdminMetric: boolean) =>
    metrics
      .filter((metric) => metric.admin === isAdminMetric)
      .map((metric, index) => (
        <Chip
          key={index}
          label={`${metric.name} (${metric.unit})`}
          variant={selectedMetric === metric ? 'filled' : 'outlined'}
          onClick={() => setSelectedMetric(metric)}
          sx={{ margin: 0.5 }}
          color={selectedMetric === metric ? 'primary' : 'default'}
        />
      ));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
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
            <Grid item xs={12} md={8}>
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
              <Button
                variant="contained"
                color="primary"
                fullWidth
                // onClick={handleAddRecord}
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
            const metric = metrics[record.metric];
            return (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${metric.name}: ${record.value} ${metric.unit}`}
                  secondary={dayjs(record.datetime).format(
                    'MMMM D, YYYY h:mm A'
                  )}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};