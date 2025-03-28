export interface Metric{
  id: number,
  owner: number,
  name: string,
  unit: string,
  admin: boolean,
}

export interface MetricRecord{
  id: number,
  owner: number,
  metric: number,
  value: number,
  datetime: string,
}