export interface Metric{
  owner: number,
  name: string,
  unit: string,
  admin: boolean,
}

export interface MetricRecord{
  owner: number,
  metric: number,
  value: number,
  datetime: string,
}