import { IEntryType, IEntryHandler } from '../types';

export default function createObserver(
  entryType: IEntryType,
  entryHandler: IEntryHandler
): PerformanceObserver | undefined {
  // catch errors since some browsers throw when using the new `type` option.
  // https://bugs.webkit.org/show_bug.cgi?id=209216
  try {
    if (PerformanceObserver.supportedEntryTypes.indexOf(entryType) < 0) {
      return;
    }

    const onEntries = (entryList: PerformanceObserverEntryList): void => {
      const entries = entryList.getEntries();

      for (const entry of entries) {
        entryHandler(entry);
      }
    };
    const po = new PerformanceObserver(onEntries);

    // observe entries including buffered ones,
    // buffered entries occurre before calling `observe()` below.
    po.observe({ type: entryType, buffered: true });

    return po;
  } catch (e) {
    // do nothing if the browser doesn't support this API.
  }
}
