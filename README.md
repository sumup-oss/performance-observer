# ⚡️ Performance Observer

[![Version](https://img.shields.io/npm/v/@sumup/performance-observer)](https://www.npmjs.com/package/@sumup/performance-observer)
[![Coverage](https://img.shields.io/codecov/c/github/sumup-oss/performance-observer)](https://codecov.io/gh/sumup-oss/performance-observer)
[![License](https://img.shields.io/github/license/sumup-oss/performance-observer)](https://github.com/sumup-oss/performance-observer/blob/master/LICENSE)

> Generic interface for measuring performance metrics. It supports all [web-vitals](https://web.dev/vitals/) and [custom metrics](https://web.dev/custom-metrics/).
> Powered by native browser [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver).

## Table of Contents <!-- omit in toc -->

- [Motivation](#motivation)
- [Installation](#installation)
  - [Install as NPM module](#install-as-npm-module)
  - [Load as a script](#load-as-a-script)
- [List of supported metrics](#supported-metrics)
- [Browser support](#browser-support)
- [Usage](#usage)
  - [Subscribe to individual metrics](#subscribe-to-individual-metrics)
  - [Subscribe to several metrics](#subscribe-to-several-metrics-in-one-batch)
  - [Unsubscribe from individual metric](#unsubscribe-from-individual-metric)
  - [Unsubscribe from several metrics](#unsubscribe-from-several-metrics)
- [API](#api)
  - [Types](#types)
  - [Methods](#types)
- [Development](#development)
  - [Example project](#example)
- [References](#references)
- [Code of conduct](#code-of-conduct)
  - [Maintainers](#maintainers)
- [Contributing](#contributing)
- [About SumUp](#about-sumup)

## Motivation

Optimizing the quality of user experience is important for any application on the web. Modern browsers understand that and provide [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) interface that can be used by developers to observe browser performance measurements like the speed of rendering of certain elements or responsiveness of user interactions on the page.

Unfortunately due to the early age of the API it lacks standardization and ease of use. It's also quite low-level and for every metric you need to go through the documentation for implementing it separately and be aware of certain quirks and workarounds. For example, different types of metrics have different fields to get the performance value or require implementation of certain calculation formulas to get the meaningful metric result.

This projects aims to simplify the usage of [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) for developers by encapsulating all the complexity, formulas and necessary workarounds. It provides few simple methods that will allow to subscribe to relevant performance metrics and retrieve them in a predictable format in order to send them later to the analytics service of your choice.

## Installation

### Install as NPM module

```
npm install @sumup/performance-observer --save
```

or

```
yarn add @sumup/performance-observer
```

### Load as a script

The easiest and recommended way to use this library is by installing it from npm as it's shown above and make it part of your build process.

However, in some cases, for more precise tracking of certain metrics (e.g. [longtask](#longtask)) you might want to include the script in the `<head />` tag directly either by hardcoding it or loading from a CDN.

Here is an example of loading a library from a CDN using a classic script that sets the global `performanceObserver` object to `window`:

```html
<script
  defer
  src="https://unpkg.com/@sumup/performance-observer@1.0.0/dist/performance-observer.min.js"
></script>
<script>
  window.performanceObserver.observe('first-input-delay', function (metric) {
    // report metric to your analytics system here
  });
</script>
```

And here's an example of loading a library from a CDN using a module script (it's safe to use module scripts in legacy browsers because unknown script types are ignored):

```html
<script type="module">
  import performanceObserver from 'https://unpkg.com/@sumup/performance-observer@1.0.0/dist/performance-observer.min.js';

  performanceObserver.observe('first-input-delay', function (metric) {
    // report metric to your analytics system here
  });
</script>
```

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

However, the majority of the [PerformanceObserver APIs](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) that are required to get metric values, are only available in Chromium-based browsers (e.g. Google Chrome, Microsoft Edge, Opera, Brave, Samsung Internet, etc.).

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

## Usage

### Subscribe to individual metrics

#### First Paint

["First Paint" (FP)](https://developer.mozilla.org/en-US/docs/Glossary/First_paint) returns a value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing the URL in the browser navigation bar) until _any_ first render is detected in the visible viewport. For example, painting the background colour on a body element could be regarded as "first-paint" in a web page's load.

The observer callback is called once at the moment when the first paint happens on the page.

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

["First Contentful Paint" (FCP)](https://web.dev/fcp/) returns the value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing the URL in the browser navigation bar) until the first content render is detected in the visible viewport. This could be elements containing text, image elements or canvas elements (though contents of iframe elements are not included).

The observer callback is called once at the moment when the first content element appears on the page.

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

["Largest Contentful Paint" (LCP)](https://web.dev/lcp/) returns the value in milliseconds that represents the time from when the browser navigation started (e.g. user clicks a link or hits enter after writing the URL in the browser navigation bar) until the largest (a.k.a main) content render is detected in the visible viewport. This could be elements containing large portion of text, image elements or video elements.

Due to the fact that web pages often load in stages, it's possible that the largest element on the page might change. This means there could be several largest contentful paints on the page.

For example, if a page contains a block of text and a hero image, the browser may initially just render the text block and report a `largest-contentful-paint`, while later, once the hero image finishes loading, a second `largest-contentful-paint` metric would be reported.

In majority of cases we only want to know the most recent `largest-contentful-paint` that happened before the user started to interact with the page and that's exactly when the observer callback is called by default. However, you can control its behavior using the third optional argument and force the observer to report metrics on every change.

```js
import performanceObserver from '@sumup/performance-observer';

// this observer is called once on user interaction or
// when the tab is switched to another or closed completely...
performanceObserver.observe('largest-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "largest-contentful-paint": 1022ms;
  }
);

// ...and this observer is called every time when new metric appears
performanceObserver.observe(
  'largest-contentful-paint',
  ({ name, value })) => {
    console.log(`"${name}": ${value}ms;`);
    // e.g. "largest-contentful-paint": 1022ms;
  },
  true // report all changes
);
```

#### First Input Delay

["First Input Delay" (FID)](https://web.dev/fid/) returns the value in milliseconds that represents the time from when a user first interacts with the page (e.g. clicks on a link, taps on a button etc.) to the time when the browser is able to respond to that interaction.

The observer callback is called once at the moment when the first user interaction happens on the page.

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

["Cumulative Layout Shift" (CLS)](https://web.dev/cls/) returns the calculated value of the so-called ["layout shift score"](https://web.dev/cls/#layout-shift-score) which represents UI instability (e.g. elements position slightly changes throughout the page load time) in the visible viewport area of the page. However, layout shifts that occur within 500 milliseconds of user interaction are excluded from calculations, as they are considered as "user-initiated".

Browsers report every change to CLS as a separate entry and this could happen very frequently, that's why by default, the observer callback is called only once when the user closes the page or switches the tab. However, you can control the callback behavior using the third optional argument and force the observer to report CLS metrics on every change.

```js
import performanceObserver from '@sumup/performance-observer';

// this observer is called once when the user switches the tab to another or closes the page...
performanceObserver.observe('cumulative-layout-shift',
  ({ name, value })) => {
    console.log(`"${name}": ${value};`);
    // e.g. "cumulative-layout-shift": 0.05;
  }
);

// ...and this observer is called every time when a new metric appears
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

["Time to First Byte" (TTFB)](https://web.dev/time-to-first-byte/) returns the value in milliseconds that represents the time that a user's browser took to receive the first byte of a page content from a server.

The metric is based on ["Navigation Timing API"](#navigation-timing) and the observer callback is called only once at the moment when the page has completely loaded.

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

["User Timing API"](https://web.dev/custom-metrics/#user-timing-api) measures the time in milliseconds that a certain block of code took to execute. It is useful for optimising complex logic and calculations on the page.

The observer callback is called once for each performance measure at the moment when you call `window.performance.measure`. Keep in mind that the callback can be called several times on the page if you've registered several measures in your code.

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

["Element Timing API"](https://web.dev/custom-metrics/#element-timing-api) measures the time in milliseconds that a specific HTML element took to render on the screen. It can be useful for knowing when the largest image or text block was painted to the screen or if you want to measure the render time of some important element on the page.

The observer callback is called once per registered element at the moment when the element is rendered on the page. Keep in mind that the callback can be called several times on the page if you've registered several elements in HTML.

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

["Resource Timing API"](https://web.dev/custom-metrics/#resource-timing-api) measures the time that a third-party resources of a page (e.g. images, styles, scripts, etc.) took to load.

The observer callback is called once per resource at the moment when the resource has been completely loaded by the browser. Keep in mind that the callback is called as many times as there are third-party resources loaded by the page.

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

["Navigation Timing API"](https://web.dev/custom-metrics/#navigation-timing-api) returns a value in milliseconds that represents the time that a page took to load completely. However, it can be also useful for understanding [additional information](https://w3c.github.io/navigation-timing/#sec-PerformanceNavigationTiming) such as when the `DOMContentLoaded` and `load` events fire.

Please note that server response time, also known as "Time to First Byte", was moved to a [separate metric](#time-to-first-byte).

The observer callback is called once at the moment when the page has completely loaded.

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

["Long Tasks API"](https://w3c.github.io/longtasks/) returns a value in milliseconds that a particularly long task took to finish. It is useful for knowing when the browser's main thread is blocked long enough to affect the frame rate or input latency. Currently, the API reports any tasks that executes for longer than 50 milliseconds.

The observer callback is called once per long task at the moment when this long task is completed by the browser. Keep in mind that the callback is called as many times as there are long tasks on the page.

> ⚠️ Important: you can track long tasks only by creating the observer in the `<head>` of your page before loading any other scripts. It's needed because `buffered` flag is not currently supported for long tasks in any browser.

Long tasks are usually used for measuring [Time to Interactive](https://web.dev/interactive/). However, due to the complexity of calculations required to measure this metric we suggest to use a specialized script for that - https://github.com/GoogleChromeLabs/tti-polyfill.

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

Instead of calling `observe` individually for each metric, you can use a shorthand method that allows you to subsribe to as many metrics as you want in one batch. The observer callback function is called every time when one of the registered metrics reports a value.

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
    // handler is called twice with such outputs, e.g:
    // "first-contentful-paint": 1041ms;
    // "navigation-timing" (http://sumup.com/): 272ms;
  }
);
```

### Unsubscribe from individual metric

If you don't want to receive updates for a metric anymore, you can unsubscribe from it.

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

Similarly to a single subscription it's possible to unsubscribe from a set of defined metrics or all metrics in one function call.

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
  // it is a custom (defined by user) name in "element-timing" and "user-timing" metrics
  name: IMetricName | string;

  // current value of the metric
  value: number;

  // additional helpful information related to the metric
  meta: {
    // api name of the metric used for subscribing to events
    entryType: IEntryType;

    // all raw performance entries used in the metric value calculation,
    // note that entries are added to the array as the value changes
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

Subscribe to only one specified metric and receive its updates in a callback function. Returns an instance of [PeformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) if the metric exists, in other cases returns `undefined` and does nothing. A third optional argument is only relevant for certain metrics (e.g. `largest-contentful-paint`) and should be used with caution, only once you understand what you're doing. See [usage](#subscribe-to-individual-metrics).

#### `observeAll(metricsNames: IMetricName[], callback: IMetricCallback, reportAllChanges?: boolean): void`

Subscribe to several metrics and receive all their updates in one callback function. It also accepts an optional third agument which is passed to all metrics but is relevant to only some of them (e.g. `largest-contentful-paint`). See [usage](#subscribe-to-several-metrics-in-one-batch).

#### `disconnect(metricName: IMetricName): void`

Unsubscribe from a specified metric. See [usage](#unsubscribe-from-individual-metric).

#### `disconnectAll(metricsNames?: IMetricName[]): void`

Unsubscribe from a set of defined or all currently registered metrics. See [usage](#unsubscribe-from-several-metrics).

### Properties

#### `registeredObservers: IPerformanceObservers`

Map of metrics with corresponding [PeformanceObservers](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) registetered by the user. It can be useful if you need to access a particular observer in order to call some of its other native methods.

#### `metricHistory: IMetricHistory`

List of all metrics that were reported by the activated subscriptions. The metric is added to the array on every report (e.g. when `IMetricCallback` is called). It can be useful for debugging as well as some custom on page visualistions.

#### `METRIC_NAME_TO_ENTRY_TYPE: IMetricNameToEntryTypeMap`

Constant map of public metric names to corresponding browser internal entry type names that are used for subscribing to [PeformanceObservers](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver).

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

Please follow the instructions in the corresponding [README.md](https://github.com/sumup-oss/performance-observer/blob/master/example/README.md) file.

## References

This library is based on recommendations and suggestions that are listed in Google's ["Measure and optimize performance and user experience"](https://web.dev/metrics/) documentation and is similar when it comes to [web-vitals](https://web.dev/vitals/) (e.g. FCP, LCP, FID, CLS, TTFB) functionality to the corresponding package from Google - https://github.com/GoogleChrome/web-vitals and is highly inspired by it.

## Code of Conduct

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
