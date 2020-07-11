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

import {
  IPerformanceObservers,
  IMetricNameToEntryTypeMap,
  IMetric,
  IMetricName,
  IMetricCallback,
  IMetricHistory,
  IEntryType
} from './types';

import getMetricReporter from './reporters';

// advertised name vs. api name
export const METRIC_NAME_TO_ENTRY_TYPE: IMetricNameToEntryTypeMap = {
  'first-input-delay': 'first-input',
  'first-paint': 'paint',
  'first-contentful-paint': 'paint',
  'largest-contentful-paint': 'largest-contentful-paint',
  'cumulative-layout-shift': 'layout-shift',
  'time-to-first-byte': 'navigation',
  'element-timing': 'element',
  'navigation-timing': 'navigation',
  'resource-timing': 'resource',
  'user-timing': 'measure',
  longtask: 'longtask'
};

export const registeredObservers: IPerformanceObservers = {};

export const metricHistory: IMetricHistory = [];

export function observe(
  metricName: IMetricName,
  callback: IMetricCallback
): PerformanceObserver | undefined {
  const entryType: IEntryType = METRIC_NAME_TO_ENTRY_TYPE[metricName];

  if (!entryType || registeredObservers[metricName]) {
    return;
  }

  const metricReporter = getMetricReporter(entryType);
  const onMetric = (metric: IMetric): void => {
    metricHistory.push(metric);
    callback(metric);
  };
  const observerInstance = metricReporter(entryType, metricName, onMetric);

  registeredObservers[metricName] = observerInstance;

  return observerInstance;
}

export function observeAll(
  metricNames: IMetricName[],
  callback: IMetricCallback
): void {
  for (const metricName of metricNames) {
    observe(metricName, callback);
  }
}

export function disconnect(metricName: IMetricName): void {
  const observer = registeredObservers[metricName];

  if (observer) {
    observer.disconnect();
    delete registeredObservers[metricName];
  }
}

export function disconnectAll(): void {
  const metricNames = Object.keys(registeredObservers);

  for (const metricName of metricNames as IMetricName[]) {
    disconnect(metricName);
  }
}
