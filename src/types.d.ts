/**
 * Copyright 2020, SumUp Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry
export interface IPerformanceEntry extends PerformanceEntry {
  entryType: string;
  name: string;
  duration: number;
  startTime: number;
}

// https://wicg.github.io/event-timing/#sec-performance-event-timing
export interface IPerformanceEventTiming extends IPerformanceEntry {
  processingStart: DOMHighResTimeStamp;
}

// https://wicg.github.io/layout-instability/#sec-layout-shift
export interface ILayoutShift extends IPerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// https://wicg.github.io/element-timing/#sec-performance-element-timing
export interface IPerformanceElementTiming extends IPerformanceEntry {
  identifier: string;
}

export type IMetricName =
  | 'first-contentful-paint'
  | 'first-paint'
  | 'first-input-delay'
  | 'largest-contentful-paint'
  | 'cumulative-layout-shift'
  | 'time-to-first-byte'
  | 'element-timing'
  | 'navigation-timing'
  | 'resource-timing'
  | 'user-timing'
  | 'longtask';

export type IEntryType =
  | 'first-input'
  | 'measure'
  | 'element'
  | 'navigation'
  | 'paint'
  | 'largest-contentful-paint'
  | 'layout-shift'
  | 'resource'
  | 'longtask';

export type IPerformanceObservers = {
  [key in IMetricName]?: PerformanceObserver;
};

export type IMetricNameToEntryTypeMap = {
  [key in IMetricName]: IEntryType;
};

export interface IMetric {
  name: IMetricName | string;
  value: number;
  meta: {
    entryType: IEntryType;
    entries: IPerformanceEntry[];
    url?: string;
    createdAt: number;
    updatedAt?: number;
  };
}

export interface IMetricCallback {
  (metric: IMetric): void;
}

export interface IMetricHistory {
  [index: number]: IMetric;
  push(IMetric): void;
}

export interface IEntryHandler {
  (entry: PerformanceEntry): void;
}

export interface IMetricReporter {
  (
    entryType: IEntryType,
    metricName: IMetricName,
    reportMetric: IMetricCallback,
    reportAllChanges?: boolean
  ): PerformanceObserver | undefined;
}

export interface IObserveMethod {
  (
    metricName: IMetricName,
    callback: IMetricCallback,
    reportAllChanges?: boolean
  ): PerformanceObserver | undefined;
}

export interface IObserveAllMethod {
  (
    metricNames: IMetricName[],
    callback: IMetricCallback,
    reportAllChanges?: boolean
  ): void;
}

export interface IDisconnectMethod {
  (metricName: IMetricName): void;
}

export interface IDisconnectAllMethod {
  (metricNames?: IMetricName[]): void;
}
