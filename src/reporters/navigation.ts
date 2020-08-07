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

import { IMetricReporter, IEntryHandler } from '../types';

import createMetric from '../utils/create-metric';
import createObserver from '../utils/create-observer';
import onAfterPageLoad from '../utils/on-after-page-load';

// used for both generic "navigation-timing" (a.k.a page load time) metric
// and more specific "time-to-first-byte" metric (a.k.a server response time)
// https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
// https://web.dev/custom-metrics/#navigation-timing-api
// https://web.dev/time-to-first-byte
const navigationReporter: IMetricReporter = (
  entryType,
  metricName,
  reportMetric
) => {
  const isTTFB = metricName === 'time-to-first-byte';
  const metric = createMetric(metricName, entryType);
  const entryHandler = (entry: PerformanceNavigationTiming): void => {
    metric.value = isTTFB ? entry.responseStart : entry.duration;
    metric.meta.url = entry.name;
    metric.meta.updatedAt = Date.now();
    metric.meta.entries = [entry];
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  if (observer) {
    const report = (): void => {
      // force any pending entries to be dispatched
      const entries = observer.takeRecords();

      for (const entry of entries as PerformanceNavigationTiming[]) {
        entryHandler(entry);
      }

      if (metric.meta.updatedAt) {
        reportMetric(metric);
      }
    };

    onAfterPageLoad(report);
  }

  return observer;
};

export default navigationReporter;
