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
  IMetricHistory,
  IEntryType,
  IObserveMethod,
  IObserveAllMethod,
  IDisconnectMethod,
  IDisconnectAllMethod
} from './types';

import getMetricReporter from './reporters';

// public/doc name vs. internal api name used for its' calculation
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

export const observe: IObserveMethod = (
  metricName,
  callback,
  reportAllChanges = false
) => {
  const entryType: IEntryType = METRIC_NAME_TO_ENTRY_TYPE[metricName];

  if (!entryType || registeredObservers[metricName]) {
    return;
  }

  const metricReporter = getMetricReporter(entryType);
  const onMetric = (metric: IMetric): void => {
    metricHistory.push(metric);
    callback(metric);
  };
  const observerInstance = metricReporter(
    entryType,
    metricName,
    onMetric,
    reportAllChanges
  );

  registeredObservers[metricName] = observerInstance;

  return observerInstance;
};

export const observeAll: IObserveAllMethod = (
  metricNames,
  callback,
  reportAllChanges = false
) => {
  for (const metricName of metricNames) {
    observe(metricName, callback, reportAllChanges);
  }
};

export const disconnect: IDisconnectMethod = (metricName) => {
  const observer = registeredObservers[metricName];

  if (observer) {
    observer.disconnect();
    delete registeredObservers[metricName];
  }
};

export const disconnectAll: IDisconnectAllMethod = (metricNames) => {
  const targetMetricNames = metricNames || Object.keys(registeredObservers);

  for (const metricName of targetMetricNames as IMetricName[]) {
    disconnect(metricName);
  }
};
