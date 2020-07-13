# ⚡️ Performance Observer

<!-- [![Version](https://img.shields.io/npm/v/@sumup/performance-observer)](https://www.npmjs.com/package/@sumup/performance-observer)
[![Coverage](https://img.shields.io/codecov/c/github/sumup/performance-observer)](https://codecov.io/gh/sumup-oss/performance-observer) [![License](https://img.shields.io/github/license/sumup/performance-observer)](https://github.com/sumup-oss/performance-observer/blob/master/LICENSE) -->

> Generic interface for measuring performance metrics. It supports all [web-vitals](https://web.dev/vitals/) and [custom metrics](https://web.dev/custom-metrics/).
> Powered by native browser [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver).

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Usage](#usage)
  - [Subscribe to individual metrics](#subscribe-to-individual-metrics)
  - [Subscribe to several metrics](#subscribe-to-several-metrics-in-one-batch)
  - [Unsubscribe from individual metric](#unsubscribe-from-individual-metric)
  - [Unsubscribe from several metrics](#unsubscribe-from-several-metrics)
- [API](#api)
  - [Types](#types)
  - [Methods](#types)
- [List of supported metrics](#supported-metrics)
- [Browser support](#browser-support)
- [Code of conduct](#code-of-conduct)
  - [Maintainers](#maintainers)
- [Contributing](#contributing)
- [About SumUp](#about-sumup)

## Installation

```
npm install @sumup/performance-observer --save
```

or

```
yarn add @sumup/performance-observer
```

## Usage

### Subscribe to individual metrics

#### First Paint

["First Paint" (FP)](https://developer.mozilla.org/en-US/docs/Glossary/First_paint) returns value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing url in a browser navigation bar) 'til when _any_ first render is detected in the browser visible viewport. For example, painting background colour on a body element could be regarded as "first-paint" in a web page's load.

Observer callback will be called only once at the moment when the first paint actually happens on the page.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('first-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "first-paint": 1040ms;
  }
);
```

#### First Contentful Paint

["First Contentful Paint" (FCP)](https://web.dev/fcp/) returns the value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing url in browser navigation bar) 'til when the first content render is detected in the browser visible viewport. This could be elements containing text, image elements or canvas elements (though contents of iframe elements are not included).

Observer callback will be called only once at the moment when the first content element appears on the page.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('first-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "first-contentful-paint": 1041ms;
  }
);
```

#### Largest Contentful Paint

["Largest Contentful Paint" (LCP)](https://web.dev/lcp/) returns the value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing url in browser navigation bar) 'til when the largest (a.k.a main) content render is detected in the browser visible viewport. This could be elements containing large portion of text, image elements or video elements.

Due to the fact that web pages often load in stages, it's possible that the largest element on the page might change. This means there could be several largest contentful paints on the page.

For example, if a page contains a block of text and a hero image, the browser may initially just render the text block and report a `largest-contentful-paint`, while later, once the hero image finishes loading, a second `largest-contentful-paint` metric would be reported.

In majority of cases we only want to know only the most recent `largest-contentful-paint` that happened before the user started to interact with the page and that's exactly when observer callback will be called by default. However you can control its' behavior by third optional argument and force observer to report metrics on every change.

```js
import performanceObserver from '@sumup/performance-observer';

// this observer will be called only once on user interaction or
// when the tab is switched to another or closed completely...
performanceObserver.observe('largest-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "largest-contentful-paint": 1022ms;
  }
);

// ...and this observer will be called everytime when new metric appears
performanceObserver.observe(
  'largest-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "largest-contentful-paint": 1022ms;
  },
  true // report all changes toggle
);
```

#### First Input Delay

["First Input Delay" (FID)](https://web.dev/fid/) returns the value in milliseconds that represents the time from when user first interacts with the page (e.g. clicks on a link, taps on a button etc.) to the time when browser is actually able to respond to that interaction.

Observer callback will be called only once, at the moment when the first user interaction happens on the page.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('first-input-delay',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "first-input-delay": 20ms;
  }
);
```

#### Cumulative Layout Shift

["Cumulative Layout Shift" (CLS)](https://web.dev/cls/) returns the calculated value of so-called ["layout shift score"](https://web.dev/cls/#layout-shift-score) which represents UI instability (e.g. elements position is slightly changing over page loading time) in the visible viewport area of the page. However layout shifts that occur within 500 milliseconds of user interaction are excluded from calculations, as they are considered as "user-initiated".

Browser reports every change to CLS as a separate entry and this could happen very frequently, that's why by default observer callback will be called only once when user closes the page or switches the tab. However you can control callbacl behavior by third optional argument and force observer to report CLS metrics on every change.

```js
import performanceObserver from '@sumup/performance-observer';

// this observer will be called only once when user switches the tab to another or closes the page...
performanceObserver.observe('cumulative-layout-shift',
  ({ name, value })) => {
    console.log(`"${name}": ${value};`);
    // e.g. "cumulative-layout-shift": 0.05;
  }
);

// ...and this observer will be called everytime when new metric appears
performanceObserver.observe(
  'largest-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value};`);
    // e.g. "cumulative-layout-shift": 0.05;
  },
  true // report all changes toggle
);
```

#### Time to First Byte

["Time to First Byte" (TTFB)](https://web.dev/time-to-first-byte/) returns the value in milliseconds that represents the time that user's browser took to receive the first byte of a page content from a server.

Metric is based on ["Navigation Timing API"](#navigation-timing) and observer callback will be called only once, at the moment when the page is completely loaded.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('time-to-first-byte',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "time-to-first-byte": 120ms;
  }
);
```

#### User Timing

["User Timing API"](https://web.dev/custom-metrics/#user-timing-api) allows to measure how much time in milliseconds the certain block of code took to execute. It is useful for optimising complex logic and calculations on the page.

Observer callback will be called once per one performance measure, right at the moment when you call `window.performance.measure`. Keep in mind that callback can be called several times on the page if you've registered several measures in your code.

```js
// start recording the time immediately before running a task
window.performance.mark('my-task:start');
await runMyTask();

// stop recording the time immediately after running a task
window.performance.mark('my-task:end');
window.performance.measure('my-task', 'my-task:start', 'my-task:end');
```

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('user-timing',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "my-task": 3022ms;
  }
);
```

#### Element Timing

["Element Timing API"](https://web.dev/custom-metrics/#element-timing-api) allows to measure the time in milliseconds that specific HTML element took to render on the screen. It can be useful for knowing when the largest image or text block was painted to the screen or if you want to measure the render time of some important element on the page.

Observer callback will be called once per registered element, at the moment when the element is rendered on the page. Keep in mind that callback can be called several times on the page if you've registered several elements in HTML.

```html
<img elementtiming="hero-image-paint" src="example.png" />
```

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('element-timing',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "hero-image-paint": 120ms;
  }
);
```

#### Resource Timing

["Resource Timing API"](https://web.dev/custom-metrics/#resource-timing-api) allows to measure the time that third-party resources of a page (e.g. images, styles, scripts, etc.) took to load.

Observer callback will be called once per resource, at the moment when this resource is actually completely loaded by the browser. Keep in mind that callback will be called as many times as many third-party resources are loaded by the page.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('resource-timing',
  ({ name, meta, value })) => {
    console.log(`"${name}" (${meta.url}): ${value}ms;`);
    // e.g. "resource-timing" (http://sumup.com/favicon.ico): 20ms;
  }
);
```

#### Navigation Timing

["Navigation Timing API"](https://web.dev/custom-metrics/#navigation-timing-api) returns value in milliseconds that represents the time that page took to load completely. However it can be also useful for understanding [additional information](https://w3c.github.io/navigation-timing/#sec-PerformanceNavigationTiming) (such as when the `DOMContentLoaded` and `load` events fire).

Please note that server response time, also known as "Time to First Byte", was moved to a [separate metric](#time-to-first-byte).

Observer callback will be called once, at the moment when the page is completely loaded.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('navigation-timing',
  ({ name, meta, value })) => {
    console.log(`"${name}" (${meta.url}): ${value}ms;`);
    // e.g. "navigation-timing" (http://sumup.com/products): 1352ms;
  }
);
```

#### Longtask

["Long Tasks API"](https://w3c.github.io/longtasks/) returns value in milliseconds that took particular long task to finish. It is useful for knowing when the browser's main thread is blocked for long enough to affect frame rate or input latency. Currently the API reports any tasks that executed for longer than 50 milliseconds.

Observer callback will be called once per long task, at the moment when this long task is actually completed by browser. Keep in mind that callback will be called as many times as many long tasks you have on the page.

> ⚠️ Important: you can track longtasks only by creating the observer in the `<head>` of your pages, before loading any other scripts. It's needed because `buffered` flag is not currently supported for longtasks in any browser.

Long tasks are usually used for measuring [Time to Interactive](https://web.dev/interactive/). However due to complexity of calculations required to measure this metric we suggest to specialized script for that - https://github.com/GoogleChromeLabs/tti-polyfill.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('longtask',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "longtask": 51ms;
  }
);
```

### Subscribe to several metrics in one batch

Instead of calling `observe` several times per each metric, you can use a shorthand method that allows to subsribe to as many metrics as you want in one batch. Observer callback function will be called every time when some of the registered metric will report the value.

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observeAll(
  ['first-contentful-paint', 'navigation-timing'],
  ({ name, meta, value }) => {
    if (meta.url) {
      console.log(`"${name}" (${meta.url}): ${value}ms;`);
    } else {
      console.log(`"${name}": ${value}ms;`);
    }
    // handler will be called 2 times with such outputs, e.g:
    // "first-contentful-paint": 1041ms;
    // "navigation-timing" (http://sumup.com/): 272ms;
  }
);
```

### Unsubscribe from individual metric

If you don't want to receive updates from the metric anymore, you can unsubcribe from it -

```js
import performanceObserver from '@sumup/performance-observer';

performanceObserver.observe('resource-timing', ({ name, meta, value }) => {
  if (meta.url.includes('favicon.ico')) {
    console.log(`"${name}" (${meta.url}): ${value}ms;`);
    performanceObserver.disconnect('resource-timing');
    // logged "resouce-timing" (http://sumup.com/favion.ico): 22ms;
    // and disconnected once we received the data we were interested in
  }
});
```

### Unsubscribe from several metrics

Similarly to subscribtion it's possible to unsubscribe from a set of defined metrics or all metrics in one function call -

```js
import performanceObserver from '@sumup/performance-observer';

// disconnect from 2 metrics
performanceObserver.disconnectAll([
  'first-contentful-paint',
  'first-input-delay'
]);

// disconnect from all metrics
performanceObserver.disconnectAll();
```

## API

### Types

#### `IMetric`

```typescript
type IMetricName =
  | 'first-paint'
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'first-input-delay'
  | 'cumulative-layout-shift'
  | 'time-to-first-byte'
  | 'user-timing'
  | 'element-timing'
  | 'navigation-timing'
  | 'resource-timing'
  | 'longtask';

type IEntryType =
  | 'paint'
  | 'largest-contentful-paint'
  | 'first-input'
  | 'layout-shift'
  | 'measure'
  | 'element'
  | 'navigation'
  | 'resource'
  | 'longtask';

interface IMetric {
  // the name of the metric as it's known in the public docs (e.g. "cumulative-layout-shift" vs. "layout-shift")
  // it will be a custom (defined by user) name in "element-timing" and "user-timing" metrics
  name: IMetricName | string;

  // current value of the metric
  value: number;

  // additional helpful information related to the metric
  meta: {
    // api name of the metric used for subscribing to events
    entryType: IEntryType;

    // all raw performance entries used in the metric value calculation,
    // note that entries will be added to the array as the value changes
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry
    entries: PerformanceEntry[];

    // date timestamp with value when the metric data was initialized
    createdAt: number;

    // date timestamp with value when the metric data was updated last time
    updatedAt?: number;

    // url of request made by the browser
    // appears only in "resource-timing" and "navigation-timing" metrics
    url?: string;
  };
}
```

#### `IMetricCallback`

```typescript
interface IMetricCallback {
  (metric: IMetric): void;
}
```

#### `IPerformanceObservers`

```typescript
type IPerformanceObservers = {
  [key in IMetricName]?: PerformanceObserver;
};
```

#### `IMetricHistory`

```typescript
interface IMetricHistory {
  [index: number]: IMetric;
  push(IMetric): void;
}
```

#### `IMetricNameToEntryTypeMap`

```typescript
type IMetricNameToEntryTypeMap = {
  [key in IMetricName]: IEntryType;
};
```

### Methods

#### `observe(metricName: IMetricName, callback: IMetricCallback, reportAllChanges?: boolean): PerformanceObserver | undefined`

Allows to subscribe to only one specified metric and receive its' updates in a callback function. Returns instance of [PeformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) if metric exists, in other cases returns `undefined` and does nothing. Third optional argument is only relevant for certain metrics (e.g. `largest-contentful-paint`) and should be used with caution, only once you understand what you're doing). See [usage](#subscribe-to-individual-metrics).

#### `observeAll(metricsNames: IMetricName[], callback: IMetricCallback, reportAllChanges?: boolean): void`

Allows to subscribe to the several metrics and receive all their updates in one callback function. It also accepts optional third agument which will be passed to all metrics but is relevant to only some of them (e.g. `largest-contentful-paint`). See [usage](#subscribe-to-several-metrics-in-one-batch).

#### `disconnect(metricName: IMetricName): void`

Allows to unsubscribe from a specified metric updates. See [usage](#unsubscribe-from-individual-metric).

#### `disconnectAll(metricsNames?: IMetricName[]): void`

Allows to unsubscribe from a set of defined or all currently registered metrics updates. See [usage](#unsubscribe-from-several-metrics).

### Properties

#### `registeredObservers: IPerformanceObservers`

Map of metrics with corresponding [PeformanceObservers](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) registetered by the user. It can be useful if you need to access particular observer in order to call some of its' other native methods.

#### `metricHistory: IMetricHistory`

List of all metrics that were reported by the activated subscriptions. Metric will be added to the array on every report (e.g. when `IMetricCallback` is called). It can be useful for debugging as well as some custom on page visualistions.

#### `METRIC_NAME_TO_ENTRY_TYPE: IMetricNameToEntryTypeMap`

Constant map of public metric names to corresponding browser internal entry type names that are used for subsribing to [PeformanceObservers](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver).

## List of supported events

- `first-paint` ("paint" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming
- `first-contentful-paint` ("paint" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming
  - https://web.dev/fcp
- `largest-contentful-paint` ("largest-contentful-paint" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
  - https://web.dev/lcp
- `first-input-delay` ("first-input" entry)
  - https://developer.mozilla.org/en-US/docs/Glossary/First_input_delay
  - https://web.dev/fid
- `cumulative-layout-shift` ("layout-shift" entry)
  - https://web.dev/cls
- `time-to-first-byte` ("navigation" entry)
  - https://web.dev/custom-metrics/#navigation-timing-api
  - https://web.dev/time-to-first-byte
- `user-timing` ("measure" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure
  - https://web.dev/custom-metrics/#user-timing-api
- `element-timing` ("element" entry)
  - https://web.dev/custom-metrics/#element-timing-api
- `resource-timing` ("resource" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
  - https://web.dev/custom-metrics/#resource-timing-api
- `navigation-timing` ("navigation" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
  - https://web.dev/custom-metrics/#navigation-timing-api
- `longtask` ("longtask" entry)
  - https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API
  - https://web.dev/custom-metrics/#long-tasks-api

## Browser support

This script has been tested and will run without error in all major browsers as well as Internet Explorer 11.

However majority of the [PerformanceObserver APIs](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) required to get metrics values are only available in Chromium-based browsers (e.g. Google Chrome, Microsoft Edge, Opera, Brave, Samsung Internet, etc.).

Browser support for each function is as follows:

- `first-paint` - Chromium
- `first-contentful-paint` - Chromium
- `largest-contentful-paint` - Chromium
- `first-input-delay` - Chromium
- `cumulative-layout-shift` - Chromium
- `time-to-first-byte` - Chromium, Firefox
- `user-timing` - Chromium, Firefox
- `element-timing` - Chromium
- `resource-timing` - Chromium, Firefox
- `navigation-timing` - Chromium, Firefox
- `longtask` - Chromium

## Development

```bash
# install dependencies
yarn

# run unit tests
yarn test

# create library build
yarn build

# release a new version
yarn publish
```

### Example

Please follow instrucrions in corresponding [README.md](https://github.com/sumup/performance-observer/blob/master/example/README.md) file.

## References

This library is based on recommendations and suggestions that are listed in Google's ["Measure and optimize performance and user experience"](https://web.dev/metrics/) documentation and is similar when it comes to [web-vitals](https://web.dev/vitals/) (e.g. FCP, LCP, FID, CLS, TTFB) functionality to the corresponding package from Google - https://github.com/GoogleChrome/web-vitals and is highly inspired by it.

## Code of conduct

We want to foster an inclusive and friendly community around our Open Source efforts. Like all SumUp Open Source projects, this project follows the Contributor Covenant Code of Conduct. Please, [read it and follow it](CODE_OF_CONDUCT.md).

If you feel another member of the community violated our CoC or you are experiencing problems participating in our community because of another individual's behavior, please get in touch with our maintainers. We will enforce the CoC.

### Maintainers

- [Dmitri Voronianski](mailto:dmitri.voronianskyi@sumup.com)
- [Fernando Fleury](mailto:fernando.fleury@sumup.com)

## Contributing

If you have ideas for how we could improve this readme or the project in general, [let us know](https://github.com/sumup-oss/performance-observer/issues) or [contribute some](https://github.com/sumup-oss/performance-observer/edit/master/README.md)

## About SumUp

![SumUp logo](https://raw.githubusercontent.com/sumup-oss/assets/master/sumup-logo.svg?sanitize=true)

It is our mission to make easy and fast card payments a reality across the _entire_ world. You can pay with SumUp in more than 30 countries, already. Our engineers work in Berlin, Cologne, Sofia and Sāo Paulo. They write code in JavaScript, Swift, Ruby, Go, Java, Erlang, Elixir and more. Want to come work with us? [Head to our careers page](https://sumup.com/careers) to find out more.
