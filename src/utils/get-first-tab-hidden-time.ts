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

import onBrowserTabHidden from './on-browser-tab-hidden';

interface IFirstTabHiddenTime {
  timeStamp: number;
}

// since users can open pages in a background tab,
// it's possible that some metrics (e.g all paint related)
// will not happen until the user focuses the browser tab,
// which can be much later than when they first loaded it,
// thus we keep track of when the page was first hidden.
// more - https://github.com/w3c/page-visibility/issues/29
let firstTabHiddenTime: number;

export default function getFirstTabHiddenTime(): IFirstTabHiddenTime {
  if (firstTabHiddenTime === undefined) {
    firstTabHiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity;
    onBrowserTabHidden((event) => {
      firstTabHiddenTime = event.timeStamp;
    });
  }

  return {
    get timeStamp(): number {
      return firstTabHiddenTime;
    }
  };
}
