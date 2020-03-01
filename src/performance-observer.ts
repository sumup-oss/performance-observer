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
  IPerformanceEntry,
  IPerfObserver,
  IPerfObservers,
  IPerfObserverType,
  IPerfObserverMetric,
  IPerfObserverMeasure,
  IPerfObserverMetricMap,
  IPerfObserverMeasureMap,
  IPerfObserverTrackingData
} from './types';

const DEFAULT_METRICS: IPerfObserverMetric[] = [
  'first-paint',
  'first-contentful-paint',
  'first-input-delay'
];

const metricToEntryTypeMap: IPerfObserverMetricMap = {
  'first-input-delay': 'first-input',
  'first-paint': 'paint',
  'first-contentful-paint': 'paint',
  'element-timing': 'element',
  'navigation-timing': 'navigation',
  'resource-timing': 'resource',
  'user-timing': 'measure'
};

const metricToEntryMeasureMap: IPerfObserverMeasureMap = {
  'first-input-delay': 'duration',
  'first-paint': 'startTime',
  'first-contentful-paint': 'startTime',
  'element-timing': 'startTime',
  'navigation-timing': 'duration',
  'resource-timing': 'duration',
  'user-timing': 'duration'
};

function createPerformanceObserver(
  targetMetrics = DEFAULT_METRICS
): IPerfObserver {
  const perfObservers: IPerfObservers = {};

  function getTrackingData(
    metricName: IPerfObserverMetric,
    entryType: IPerfObserverType,
    entryMeasure: IPerfObserverMeasure,
    entry: IPerformanceEntry
  ): IPerfObserverTrackingData {
    const trackingData: IPerfObserverTrackingData = {
      name: metricName,
      duration: entry[entryMeasure]
    };

    if (entryType === 'element' && entry.identifier) {
      trackingData.name = entry.identifier;
    }

    if (entryType === 'paint' || entryType === 'measure') {
      trackingData.name = entry.name;
    }

    if (entryType === 'resource' || entryType === 'navigation') {
      trackingData.url = entry.name;
    }

    return trackingData;
  }

  function observe(
    metricName: IPerfObserverMetric,
    done: (
      trackingData: IPerfObserverTrackingData,
      entry: IPerformanceEntry
    ) => void
  ): PerformanceObserver | undefined {
    const entryType: IPerfObserverType = metricToEntryTypeMap[metricName];
    const entryMeasure = metricToEntryMeasureMap[metricName];

    if (!entryType || !entryMeasure || perfObservers[entryType]) {
      return;
    }

    const observer = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();

      for (const entry of entries as IPerformanceEntry[]) {
        if (entry.entryType === entryType) {
          const trackingData = getTrackingData(
            metricName,
            entryType,
            entryMeasure,
            entry
          );

          done(trackingData, entry);
        }
      }
    });

    try {
      observer.observe({ type: entryType, buffered: true });
    } catch (e) {}

    perfObservers[entryType] = observer;

    return observer;
  }

  function observeAll(
    done: (
      trackingData: IPerfObserverTrackingData,
      entry: IPerformanceEntry
    ) => void
  ): IPerfObservers {
    for (const metricName of targetMetrics as IPerfObserverMetric[]) {
      observe(metricName, done);
    }

    return perfObservers;
  }

  function disconnectAll(): void {
    const entryTypes = Object.keys(perfObservers);

    for (const entryType of entryTypes as IPerfObserverType[]) {
      const observer = perfObservers[entryType];

      if (observer) {
        observer.disconnect();
      }
    }
  }

  return {
    observe,
    observeAll,
    disconnectAll
  };
}

createPerformanceObserver.metricToEntryTypeMap = metricToEntryTypeMap;
createPerformanceObserver.metricToEntryMeasureMap = metricToEntryMeasureMap;

export default createPerformanceObserver;
