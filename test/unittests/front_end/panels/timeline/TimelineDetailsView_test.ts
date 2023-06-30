// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type * as SDK from '../../../../../front_end/core/sdk/sdk.js';
import * as Timeline from '../../../../../front_end/panels/timeline/timeline.js';
import {allModelsFromFile} from '../../helpers/TraceHelpers.js';
import {describeWithEnvironment} from '../../helpers/EnvironmentHelpers.js';

const {assert} = chai;

class MockViewDelegate implements Timeline.TimelinePanel.TimelineModeViewDelegate {
  select(_selection: Timeline.TimelineSelection.TimelineSelection|null): void {
  }
  selectEntryAtTime(_events: SDK.TracingModel.CompatibleTraceEvent[]|null, _time: number): void {
  }
  highlightEvent(_event: SDK.TracingModel.CompatibleTraceEvent|null): void {
  }
}

function getRowDataForDetailsElement(details: HTMLElement) {
  return Array.from(details.querySelectorAll<HTMLDivElement>('.timeline-details-view-row')).map(row => {
    const title = row.querySelector<HTMLDivElement>('.timeline-details-view-row-title')?.innerText;
    const value = row.querySelector<HTMLDivElement>('.timeline-details-view-row-value')?.innerText;
    return {title, value};
  });
}

describeWithEnvironment('TimelineDetailsView', function() {
  const mockViewDelegate = new MockViewDelegate();
  it('displays the details of a network request event correctly', async function() {
    const data = await allModelsFromFile('lcp-web-font.json.gz');
    const detailsView = new Timeline.TimelineDetailsView.TimelineDetailsView(mockViewDelegate);

    const networkRequests = data.timelineModel.networkRequests();
    const cssRequest = networkRequests.find(request => {
      return request.url === 'http://localhost:3000/app.css';
    });
    if (!cssRequest) {
      throw new Error('Could not find expected network request.');
    }
    const selection = Timeline.TimelineSelection.TimelineSelection.fromNetworkRequest(cssRequest);

    await detailsView.setModel(data.performanceModel, data.traceParsedData, null);
    await detailsView.setSelection(selection);

    const detailsContentElement = detailsView.getDetailsContentElementForTest();
    assert.strictEqual(detailsContentElement.childNodes.length, 1);
    const rowData = getRowDataForDetailsElement(detailsContentElement);

    assert.deepEqual(
        rowData,
        [
          {title: 'URL', value: 'localhost:3000/app.css'},
          {title: 'Duration', value: '4.07 ms (3.08 ms network transfer + 1.00 ms resource loading)'},
          {title: 'Request Method', value: 'GET'},
          {title: 'Priority', value: 'Highest'},
          {title: 'Mime Type', value: 'text/css'},
          {title: 'Encoded Data', value: '402 B'},
          {title: 'Decoded Body', value: '96 B'},
        ],
    );
  });
});