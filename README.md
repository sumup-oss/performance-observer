# ⚡️ Performance Observer

<!-- [![Version](https://img.shields.io/npm/v/@sumup/performance-observer)](https://www.npmjs.com/package/@sumup/performance-observer)
[![Coverage](https://img.shields.io/codecov/c/github/sumup/performance-observer)](https://codecov.io/gh/sumup-oss/performance-observer) [![License](https://img.shields.io/github/license/sumup/performance-observer)](https://github.com/sumup-oss/performance-observer/blob/master/LICENSE) -->

> Generic interface for subscribing to all [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)'s performance measurement events.

## Table of Contents <!-- omit in toc -->

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Subscribe to individual events](#subscribe-to-individual-events)
    -   [Subscribe to all events](#subscribe-to-all-events-in-one-batch)
    -   [Accessing raw PerformanceEntry](#accessing-raw-performanceentry)
    -   [Disconnecting observers](#disconnecting-observers)
-   [API](#api)
-   [List of supported events](#supported-events)
-   [Code of conduct](#code-of-conduct)
    -   [Maintainers](#maintainers)
-   [Contributing](#contributing)
-   [About SumUp](#about-sumup)

## Installation

```
npm install @sumup/performance-observer --save
```

or

```
yarn add @sumup/performance-observer
```

## Usage

### Subscribe to individual events

#### First Paint

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('first-paint',
  ({ name, duration })) => {
    console.log(`"${name}": ${duration}ms;`);
    // e.g. "first-paint": 1040ms;
  }
);
```

#### First Contentful Paint

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('first-contentful-paint',
  ({ name, duration })) => {
    console.log(`"${name}": ${duration}ms;`);
    // e.g. "first-contentful-paint": 1041ms;
  }
);
```

#### First Input Delay

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('first-input-delay',
  ({ name, duration })) => {
    console.log(`"${name}": ${duration}ms;`);
    // e.g. "first-input-delay": 20ms;
  }
);
```

#### User Timing

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('user-timing',
  ({ name, duration })) => {
    console.log(`"${name}": ${duration}ms;`);
    // e.g. "my-task": 3022ms;
  }
);

// start recording the time immediately before running a task
window.performance.mark('my-task:start');
await runMyTask();

// stop recording the time immediately after running a task
window.performance.mark('my-task:end');
window.performance.measure(
  'my-task',
  'my-task:start',
  'my-task:end'
);
```

#### Element Timing

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('element-timing',
  ({ name, duration })) => {
    console.log(`"${name}": ${duration}ms;`);
    // e.g. "hero-image-paint": 120ms;
  }
);
```

```html
<img elementtiming="hero-image-paint" src="example.png" />
```

#### Resource Timing

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('resource-timing',
  ({ name, url, duration })) => {
    console.log(`"${name}" (${url}): ${duration}ms;`);
    // e.g. "resource-timing" (http://sumup.com/file.js): 248ms;
  }
);
```

#### Navigation Timing

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observe('navigation-timing',
  ({ name, url, duration })) => {
    console.log(`"${name}" (${url}): ${duration}ms;`);
    // e.g. "navigation-timing" (http://sumup.com/products): 1352ms;
  }
);
```

### Subscribe to all events in one batch

#### Custom set of events

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver([
    'first-contentful-paint',
    'resource-timing'
]);

performanceObserver.observeAll(({ name, url, duration }) => {
    if (url) {
        console.log(`"${name}" (${url}): ${duration}ms;`);
    } else {
        console.log(`"${name}": ${duration}ms;`);
    }
    // handler will be called 2 times with such outputs, e.g:
    // "first-contentful-paint": 1041ms;
    // "resource-timing" (http://sumup.com/image.png): 1272ms;
});
```

#### Default set of events (`first-paint`, `first-contentful-paint`, `first-input-delay`):

```js
import createPerformanceObserver from '@sumup/performance-observer';

const performanceObserver = createPerformanceObserver();

performanceObserver.observeAll(({ name, url, duration }) => {
    console.log(`"${name}": ${duration}ms;`);
    // handler will be called 3 times with such outputs, e.g:
    // "first-paint": 1041ms
    // "first-contentful-paint": 1042ms
    // "first-input-delay": 20ms
});
```

### Accessing raw [PerformanceEntry](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry)

### Disconnecting observers

## API

### Methods

#### `observe(metricName: string, handlerFn)`

#### `observeAll(handlerFn)`

#### `disconnectAll()`

## List of supported events

-   `first-paint` ("paint" entry)
    -   https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming
-   `first-contentful-paint` ("paint" entry)
    -   https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming
    -   https://web.dev/fcp
-   `first-input-delay` ("first-input" entry)
    -   https://developer.mozilla.org/en-US/docs/Glossary/First_input_delay
    -   https://web.dev/fid
-   `user-timing` ("measure" entry)
    -   https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure
    -   https://web.dev/custom-metrics/#user-timing-api
-   `element-timing` ("element" entry)
    -   https://web.dev/custom-metrics/#element-timing-api
-   `resource-timing` ("resource" entry)
    -   https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
    -   https://web.dev/custom-metrics/#resource-timing-api
-   `navigation-timing` ("navigation" entry)
    -   https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
    -   https://web.dev/custom-metrics/#navigation-timing-api

## Code of conduct

We want to foster an inclusive and friendly community around our Open Source efforts. Like all SumUp Open Source projects, this project follows the Contributor Covenant Code of Conduct. Please, [read it and follow it](CODE_OF_CONDUCT.md).

If you feel another member of the community violated our CoC or you are experiencing problems participating in our community because of another individual's behavior, please get in touch with our maintainers. We will enforce the CoC.

### Maintainers

-   [Dmitri Voronianski](mailto:dmitri.voronianskyi@sumup.com)
-   [Fernando Fleury](mailto:fernando.fleury@sumup.com)

## Contributing

If you have ideas for how we could improve this readme or the project in general, [let us know](https://github.com/sumup-oss/performance-observer/issues) or [contribute some](https://github.com/sumup-oss/performance-observer/edit/master/README.md)

## About SumUp

![SumUp logo](https://raw.githubusercontent.com/sumup-oss/assets/master/sumup-logo.svg?sanitize=true)

It is our mission to make easy and fast card payments a reality across the _entire_ world. You can pay with SumUp in more than 30 countries, already. Our engineers work in Berlin, Cologne, Sofia and Sāo Paulo. They write code in JavaScript, Swift, Ruby, Go, Java, Erlang, Elixir and more. Want to come work with us? [Head to our careers page](https://sumup.com/careers) to find out more.
