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

// used for custom "user-timing" metrics
// https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure
// https://web.dev/custom-metrics/#user-timing-api
const measureHandler: IMetricReporter = (
  entryType,
  metricName,
  reportMetric
) => {
  const entryHandler = (entry: IPerformanceEntry): void => {
    const metric = createMetric(metricName, entryType);

    metric.name = entry.name; // use custom name defined per measure
    metric.value = entry.duration;
    metric.meta.updatedAt = Date.now();
    metric.meta.entries.push(entry);

    reportMetric(metric);
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  return observer;
};

export default measureHandler;
