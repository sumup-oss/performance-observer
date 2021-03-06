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

import { IPerformanceEntry, IMetricReporter, IEntryHandler } from '../types';

import createMetric from '../utils/create-metric';
import createObserver from '../utils/create-observer';

// used for "longtask" metrics
// https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API
// https://web.dev/custom-metrics/#long-tasks-api
const longtaskReporter: IMetricReporter = (
  entryType,
  metricName,
  reportMetric
) => {
  const metric = createMetric(metricName, entryType);
  const entryHandler = (entry: IPerformanceEntry): void => {
    metric.value = entry.duration;
    metric.meta.updatedAt = Date.now();
    metric.meta.entries.push(entry);

    reportMetric(metric);
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  return observer;
};

export default longtaskReporter;
