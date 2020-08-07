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

interface IVisibilityChangeEvent {
  timeStamp: number;
}
interface IOnBrowserTabHiddenCallback {
  (event: IVisibilityChangeEvent): void;
}

export default function onBrowserTabHidden(
  callback: IOnBrowserTabHiddenCallback
): void {
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
  document.addEventListener(
    'visibilitychange',
    (event) => {
      if (document.visibilityState === 'hidden') {
        callback(event);
      }
    },
    { capture: true, once: true }
  );
}
