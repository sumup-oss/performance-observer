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

import { ILayoutShift, IMetricReporter, IEntryHandler } from '../types';

import createMetric from '../utils/create-metric';
import createObserver from '../utils/create-observer';
import onBrowserTabHidden from '../utils/on-browser-tab-hidden';

// used for "cumulative-layout-shift" metric
// https://developer.mozilla.org/en-US/docs/Glossary/First_input_delay
// https://web.dev/fid
const layoutShiftReporter: IMetricReporter = (
  entryType,
  metricName,
  reportMetric
) => {
  const metric = createMetric(metricName, entryType);
  const entryHandler = (entry: ILayoutShift): void => {
    // only count layout shifts without recent user input
    if (!entry.hadRecentInput) {
      metric.value += entry.value;
      metric.meta.updatedAt = Date.now();
      metric.meta.entries.push(entry);
    }
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  if (observer) {
    const report = (): void => {
      // force any pending entries to be dispatched
      const entries = observer.takeRecords();

      for (const entry of entries as ILayoutShift[]) {
        entryHandler(entry);
      }

      if (metric.meta.updatedAt) {
        reportMetric(metric);
      }
    };

    onBrowserTabHidden(report);
  }

  return observer;
};

export default layoutShiftReporter;
