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

import { IMetricName } from './types';

import * as po from './performance-observer';

describe('performance-observer module', () => {
  const mockFirstInputDelay = {
    entryType: 'first-input',
    name: 'mousedown',
    processingStart: 10,
    startTime: 5
  };
  const mockFirstContentfulPaint = {
    entryType: 'paint',
    name: 'first-contentful-paint',
    startTime: 1
  };
  const mockLargestContentfulPaint = {
    entryType: 'largest-contentful-paint',
    name: 'largest-contentful-paint',
    startTime: 100
  };
  const mockCumulativeLayoutShift = {
    entryType: 'layout-shift',
    name: 'cumulative-layout-shift',
    value: 0.01,
    hadRecentInput: false
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
    mockLargestContentfulPaint,
    mockCumulativeLayoutShift,
    mockElementTiming,
    mockResourceTiming,
    mockCustomMetric,
    mockLongtask
  ];

  function MockPerformanceObserver(cb: any) {
    let targetType = '';
    const listEntries = () =>
      mockPeformanceEntries.filter(({ entryType }) => entryType === targetType);

    const observe = ({ type }: { type: string }) => {
      targetType = type;

      cb({ getEntries: () => listEntries() });

      return {};
    };
    const disconnect = jest.fn();
    const takeRecords = () => listEntries();

    return {
      observe,
      disconnect,
      takeRecords
    };
  }
  MockPerformanceObserver.supportedEntryTypes = [
    'first-input',
    'paint',
    'largest-contentful-paint',
    'layout-shift',
    'resource',
    'navigation',
    'element',
    'measure',
    'longtask'
  ];

  const mockDateTimestamp = 1594468364387;
  Date.now = jest.fn(() => mockDateTimestamp);

  const { PerformanceObserver } = window as any;
  const { addEventListener } = document as any;

  let mockDocumentEvents: any = {};

  beforeEach(() => {
    jest.useFakeTimers();

    (window as any).PerformanceObserver = MockPerformanceObserver;

    document.addEventListener = jest.fn((event, cb) => {
      mockDocumentEvents[event] = cb;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    po.disconnectAll();

    (window as any).PerformanceObserver = PerformanceObserver;
    (document as any).addEventListener = addEventListener;
    mockDocumentEvents = {};
  });

  describe('observe()', () => {
    it('should track "first-input-delay"', () => {
      const metricName = 'first-input-delay';
      const value =
        mockFirstInputDelay.processingStart - mockFirstInputDelay.startTime;
      const done = jest.fn();
      const metric = {
        name: metricName,
        value,
        meta: {
          entries: [mockFirstInputDelay],
          entryType: mockFirstInputDelay.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track "first-contentful-paint"', () => {
      const metricName = 'first-contentful-paint';
      const done = jest.fn();
      const metric = {
        name: metricName,
        value: mockFirstContentfulPaint.startTime,
        meta: {
          entries: [mockFirstContentfulPaint],
          entryType: mockFirstContentfulPaint.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track "largest-contentful-paint"', () => {
      const metricName = 'largest-contentful-paint';
      const done = jest.fn();
      const metric = {
        name: metricName,
        value: mockLargestContentfulPaint.startTime,
        meta: {
          entries: [mockLargestContentfulPaint, mockLargestContentfulPaint],
          entryType: mockLargestContentfulPaint.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      mockDocumentEvents.keydown();
      jest.runAllTimers();

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track "cumulative-layout-shift"', () => {
      const updateDocumentVisibility = (visibility: string): void => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          get() {
            return visibility;
          }
        });
      };
      const metricName = 'cumulative-layout-shift';
      const done = jest.fn();
      const metric = {
        name: metricName,
        value: mockCumulativeLayoutShift.value * 2,
        meta: {
          entries: [mockCumulativeLayoutShift, mockCumulativeLayoutShift],
          entryType: mockCumulativeLayoutShift.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      updateDocumentVisibility('hidden');
      mockDocumentEvents.visibilitychange();
      jest.runAllTimers();

      expect(done).toHaveBeenNthCalledWith(1, metric);
      updateDocumentVisibility('visible');
    });

    it('should track element timing', () => {
      const metricName = 'element-timing';
      const done = jest.fn();
      const metric = {
        name: mockElementTiming.identifier,
        value: mockElementTiming.startTime,
        meta: {
          entries: [mockElementTiming],
          entryType: mockElementTiming.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track resource timing', () => {
      const metricName = 'resource-timing';
      const done = jest.fn();
      const metric = {
        name: metricName,
        value: mockResourceTiming.duration,
        meta: {
          url: mockResourceTiming.name,
          entries: [mockResourceTiming],
          entryType: mockResourceTiming.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track custom user metrics', () => {
      const metricName = 'user-timing';
      const done = jest.fn();
      const metric = {
        name: mockCustomMetric.name,
        value: mockCustomMetric.duration,
        meta: {
          entries: [mockCustomMetric],
          entryType: mockCustomMetric.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should track longtask metrics', () => {
      const metricName = 'longtask';
      const done = jest.fn();
      const metric = {
        name: metricName,
        value: mockLongtask.duration,
        meta: {
          entries: [mockLongtask],
          entryType: mockLongtask.entryType,
          createdAt: mockDateTimestamp,
          updatedAt: mockDateTimestamp
        }
      };

      po.observe(metricName, done);

      expect(done).toHaveBeenNthCalledWith(1, metric);
    });

    it('should not track unexisting metrics', () => {
      const metricName = 'test-timing';
      const done = jest.fn();

      po.observe(metricName as IMetricName, done);

      expect(done).toHaveBeenCalledTimes(0);
    });
  });

  describe('observeAll()', () => {
    it('should track specified metrics if they are passed', () => {
      const done = jest.fn();

      po.observeAll(['user-timing', 'first-contentful-paint'], done);

      expect(done).toHaveBeenCalledTimes(2);
    });
  });

  describe('diconnectAll()', () => {
    it('should call disconnect on all specified metrics', () => {
      const done = jest.fn();
      const metrics: IMetricName[] = ['user-timing', 'first-contentful-paint'];

      po.observeAll(metrics, done);

      expect(po.registeredObservers).toMatchInlineSnapshot(`
        Object {
          "first-contentful-paint": Object {
            "disconnect": [MockFunction],
            "observe": [Function],
            "takeRecords": [Function],
          },
          "user-timing": Object {
            "disconnect": [MockFunction],
            "observe": [Function],
            "takeRecords": [Function],
          },
        }
      `);
      expect(done).toHaveBeenCalledTimes(2);

      po.disconnectAll();

      expect(po.registeredObservers).toMatchInlineSnapshot(`Object {}`);
    });
  });
});
