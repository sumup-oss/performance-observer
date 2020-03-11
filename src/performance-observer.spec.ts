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

import { IPerfObserverMetric } from './types';
import createPerformanceObserver from './performance-observer';

describe('performance-observer module', () => {
  const mockFirstInputDelay = {
    entryType: 'first-input',
    name: 'mousedown',
    duration: 0
  };
  const mockFirstContentfulPaint = {
    entryType: 'paint',
    name: 'first-contentful-paint',
    startTime: 1
  };
  const mockElementTiming = {
    entryType: 'element',
    identifier: 'hero-paint',
    startTime: 1
  };
  const mockResourceTiming = {
    entryType: 'resource',
    name: 'https://static.sumup.com/file.js',
    duration: 2
  };
  const mockCustomMetric = {
    entryType: 'measure',
    name: 'my-custom-metric',
    duration: 3
  };
  const mockLongtask = {
    entryType: 'longtask',
    name: 'self',
    duration: 51
  };
  const mockPeformanceEntries = [
    mockFirstInputDelay,
    mockFirstContentfulPaint,
    mockElementTiming,
    mockResourceTiming,
    mockCustomMetric,
    mockLongtask
  ];

  const { PerformanceObserver } = window as any;

  function MockPerformanceObserver(cb: any) {
    const observe = () => {
      cb({ getEntries: () => mockPeformanceEntries });

      return {};
    };
    const disconnect = jest.fn();

    return {
      observe,
      disconnect
    };
  }

  beforeEach(() => {
    (window as any).PerformanceObserver = MockPerformanceObserver;
  });

  afterEach(() => {
    (window as any).PerformanceObserver = PerformanceObserver;
  });

  describe('observe()', () => {
    it('should track "first-input-delay"', () => {
      const metricName = 'first-input-delay';
      const done = jest.fn();
      const trackingData = {
        name: metricName,
        duration: mockFirstInputDelay.duration
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(
        1,
        trackingData,
        mockFirstInputDelay
      );
    });

    it('should track "first-contentful-paint"', () => {
      const metricName = 'first-contentful-paint';
      const done = jest.fn();
      const trackingData = {
        name: metricName,
        duration: mockFirstContentfulPaint.startTime
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(
        1,
        trackingData,
        mockFirstContentfulPaint
      );
    });

    it('should track element timing', () => {
      const metricName = 'element-timing';
      const done = jest.fn();
      const trackingData = {
        name: mockElementTiming.identifier,
        duration: mockElementTiming.startTime
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, trackingData, mockElementTiming);
    });

    it('should track resource timing', () => {
      const metricName = 'resource-timing';
      const done = jest.fn();
      const trackingData = {
        name: metricName,
        url: mockResourceTiming.name,
        duration: mockResourceTiming.duration
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, trackingData, mockResourceTiming);
    });

    it('should track custom user metrics', () => {
      const metricName = 'user-timing';
      const done = jest.fn();
      const trackingData = {
        name: mockCustomMetric.name,
        duration: mockCustomMetric.duration
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, trackingData, mockCustomMetric);
    });

    it('should track longtask metrics', () => {
      const metricName = 'longtask';
      const done = jest.fn();
      const trackingData = {
        name: metricName,
        duration: mockLongtask.duration
      };

      const performanceObserver = createPerformanceObserver();

      performanceObserver.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, trackingData, mockLongtask);
    });

    it('should not track unexisting metrics', () => {
      const metricName = 'test-timing';
      const done = jest.fn();
      const performanceObserver = createPerformanceObserver();

      const observer = performanceObserver.observe(
        metricName as IPerfObserverMetric,
        done
      );

      expect(observer).toBeUndefined();
      expect(done).toHaveBeenCalledTimes(0);
    });
  });

  describe('observeAll()', () => {
    it('should track only default metrics if not overwritten', () => {
      const done = jest.fn();
      const performanceObserver = createPerformanceObserver();

      performanceObserver.observeAll(done);

      expect(done).toHaveBeenCalledTimes(2);
    });

    it('should track specified metrics if they are passed', () => {
      const done = jest.fn();
      const performanceObserver = createPerformanceObserver(['user-timing']);

      performanceObserver.observeAll(done);

      expect(done).toHaveBeenCalledTimes(1);
    });
  });

  describe('diconnectAll()', () => {
    it('should call disconnect on all specified metrics', () => {
      const done = jest.fn();
      const metrics = ['user-timing', 'first-contentful-paint'];
      const { metricToEntryTypeMap } = createPerformanceObserver;
      const performanceObserver = createPerformanceObserver(
        metrics as IPerfObserverMetric[]
      );
      const performanceObserverByType = performanceObserver.observeAll(done);

      expect(done).toHaveBeenCalledTimes(2);

      performanceObserver.disconnectAll();

      metrics.forEach(metricName => {
        const entryType =
          metricToEntryTypeMap[metricName as IPerfObserverMetric];
        const observer = performanceObserverByType[
          entryType
        ] as PerformanceObserver;

        expect(observer.disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
