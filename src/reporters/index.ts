import { IEntryType, IMetricReporter } from '../types';

import paint from './paint';
import largestContentfulPaint from './largest-contentful-paint';
import firstInput from './first-input';
import layoutShift from './layout-shift';
import element from './element';
import measure from './measure';
import longtask from './longtask';
import resource from './resource';
import navigation from './navigation';

const reporters = {
  paint: paint,
  'largest-contentful-paint': largestContentfulPaint,
  'first-input': firstInput,
  'layout-shift': layoutShift,
  element: element,
  measure: measure,
  navigation: navigation,
  resource: resource,
  longtask: longtask
};

export default function getMetricReporter(
  entryType: IEntryType
): IMetricReporter {
  return reporters[entryType];
}
