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
import onBrowserTabHidden from '../utils/on-browser-tab-hidden';
import onFirstUserInteraction from '../utils/on-first-user-interaction';
import getFirstTabHiddenTime from '../utils/get-first-tab-hidden-time';

// used for "larget-contentful-paint" metric
// https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
// https://web.dev/lcp
const largestContentfulPaintReporter: IMetricReporter = (
  entryType,
  metricName,
  reportMetric,
  reportAllChanges
) => {
  const metric = createMetric(metricName, entryType);
  const firstTabHiddenTime = getFirstTabHiddenTime();
  const entryHandler = (entry: IPerformanceEntry): void => {
    // NOTE: the 'startTime` value is a getter that returns the entry's
    // `renderTime` value, if available, or its `loadTime` value otherwise,
    // the `renderTime` value may not be available if the element is an image
    // that's loaded cross-origin without the "Timing-Allow-Origin" header
    const value = entry.startTime;

    // only include entry if the page wasn't hidden prior to the entry being dispatched,
    // this typically happens when a page is loaded in a background tab
    if (value < firstTabHiddenTime.timeStamp) {
      metric.value = value;
      metric.meta.updatedAt = Date.now();
      metric.meta.entries.push(entry);

      if (reportAllChanges) {
        reportMetric(metric);
      }
    }
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  if (observer && !reportAllChanges) {
    let isReported = false;
    const report = (): void => {
      if (isReported) {
        return;
      }

      // force any pending entries to be dispatched
      const entries = observer.takeRecords();

      for (const entry of entries as IPerformanceEntry[]) {
        entryHandler(entry);
      }

      if (metric.meta.updatedAt) {
        reportMetric(metric);
        isReported = true;
      }
    };

    // report the final score once the page's state changes to hidden
    // or when the first user interaction with the page appears
    onBrowserTabHidden(report);
    onFirstUserInteraction(report);
  }

  return observer;
};

export default largestContentfulPaintReporter;
