import { AnalyticsEvent } from "@amplitude-alpha/analytics-core";
import { hub } from "@amplitude-alpha/hub";
import { trackMessage } from "@amplitude-alpha/analytics-messages";
import { default as nock } from 'nock';
import { runApp } from "../src/app";
import { jsons } from "@amplitude-alpha/util";

const ANALYTICS_API_URL = 'https://api2.amplitude.com';
const ANALYTICS_API_PATH = '/2/httpapi';
const ANALYTICS_SUCCESS_MESSAGE = 'Event tracked successfully';
const ANALYTICS_SUCCESS_PAYLOAD = {
  code: 200,
  events_ingested: 1,
  payload_size_bytes: 50,
  server_upload_time: 1396381378123,
};

const EXPERIMENT_API_URL = 'https://api.lab.amplitude.com';
const EXPERIMENT_API_PATH = '/sdk/vardata';
const EXPERIMENT_FETCH_PAYLOAD = {
  "codegen-boolean-experiment": {
    expKey: "exp-1",
    key: "on",
    payload: true
  },
};


test('validate events sequence in from app', async () => {
  // nock.recorder.rec();

  // Mock API endpoints
  const analyticsScope = nock(ANALYTICS_API_URL)
      .persist()
      .post(ANALYTICS_API_PATH)
      .reply(200, ANALYTICS_SUCCESS_PAYLOAD);
  const experimentScope = nock(EXPERIMENT_API_URL)
    .persist()
    .post(EXPERIMENT_API_PATH)
    .reply(200, EXPERIMENT_FETCH_PAYLOAD);

  // Subscribe to Track messages on the Analytics channel
  const events: AnalyticsEvent[] = [];
  hub.analytics.subscribe(trackMessage, message => {
    events.push(message.payload.event);
  })

  // Run the app
  await runApp();

  // Validate analytics events were tracked as expected
  const expectedEvents: Partial<AnalyticsEvent>[] = [
    { event_type: 'User Logged In' },
    { event_type: 'User Signed Up' },
    { event_type: 'Checkout' },
    { event_type: 'Exposure' },
    { event_type: 'User Signed Up' },
    { event_type: 'User Logged In' },
  ]
  expect(events.length).toBe(expectedEvents.length);
  for (let i = 0; i < events.length; i++) {
    expect(events[i].event_type).toBe(expectedEvents[i].event_type);
  }

  experimentScope.done();
  analyticsScope.done();
}, 60000);
