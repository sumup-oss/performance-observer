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
  IPerformanceElementTiming,
  IMetricReporter,
  IEntryHandler
} from '../types';

import createMetric from '../utils/create-metric';
import createObserver from '../utils/create-observer';
import getFirstTabHiddenTime from '../utils/get-first-tab-hidden-time';

// used for custom "element-timing" metrics
// https://web.dev/custom-metrics/#element-timing-api
const elementReporter: IMetricReporter = (
  entryType,
  metricName,
  reportMetric
) => {
  const firstTabHiddenTime = getFirstTabHiddenTime();
  const entryHandler = (entry: IPerformanceElementTiming): void => {
    const metric = createMetric(metricName, entryType);
    const value = entry.startTime;

    // only report element metric if the page wasn't hidden prior to the entry being dispatched,
    // this typically happens when a page is loaded in a background tab
    if (value < firstTabHiddenTime.timeStamp) {
      // use unique identifier of an element defined in html as "elementtiming" attribute
      metric.name = entry.identifier;
      metric.value = value;
      metric.meta.updatedAt = Date.now();
      metric.meta.entries.push(entry);

      reportMetric(metric);
    }
  };
  const observer = createObserver(entryType, entryHandler as IEntryHandler);

  return observer;
};

export default elementReporter;
