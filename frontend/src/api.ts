import {MetricRecord} from "./types/metric";
import {request} from "./api/lib.ts";

const baseURL = import.meta.env.VITE_BASE_URL;
const metricsURL = `${baseURL}metrics/`;


export function getMetrics(data: object): Promise<any> {
  return request('GET', `${metricsURL}metrics/`, data);
}

export function createMetrics(data: object): Promise<any> {
  return request('POST', `${metricsURL}metrics/`, data);
}

export function getRecords(data: {metric: number}): Promise<any> {
  return request('GET', `${metricsURL}records/`, data);
}

export function createRecord(data: Partial<MetricRecord>): Promise<any> {
  return request('POST', `${metricsURL}records/`, data);
}