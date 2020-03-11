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
  entryType: IPerfObserverType;
  name: string;
  duration: number;
  startTime: number;

  // appears only in user-timing "measure" entries
  // https://web.dev/custom-metrics/#user-timing-api
  identifier?: string;
}

export type IPerfObserverMetric =
  | 'first-contentful-paint'
  | 'first-paint'
  | 'first-input-delay'
  | 'element-timing'
  | 'navigation-timing'
  | 'resource-timing'
  | 'user-timing'
  | 'longtask';

export type IPerfObserverMeasure = 'startTime' | 'duration';

export type IPerfObserverType =
  | 'first-input'
  | 'measure'
  | 'element'
  | 'navigation'
  | 'paint'
  | 'resource'
  | 'longtask';

export type IPerfObservers = {
  [key in IPerfObserverType]?: PerformanceObserver;
};

export type IPerfObserverMetricMap = {
  [key in IPerfObserverMetric]: IPerfObserverType;
};

export type IPerfObserverMeasureMap = {
  [key in IPerfObserverMetric]: IPerfObserverMeasure;
};

export interface IPerfObserverTrackingData {
  name: string;
  url?: string;
  duration: number;
}

export interface IPerfObserver {
  observe(
    metricName: IPerfObserverMetric,
    done: (
      trackingData: IPerfObserverTrackingData,
      entry: IPerformanceEntry
    ) => void
  ): PerformanceObserver | undefined;
  observeAll(
    done: (
      trackingData: IPerfObserverTrackingData,
      entry: IPerformanceEntry
    ) => void
  ): IPerfObservers;
  disconnectAll(): void;
}
