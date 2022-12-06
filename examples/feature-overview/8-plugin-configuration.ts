import { amplitude, Logger } from "@amplitude-alpha/amplitude-browser";
import { analytics } from "@amplitude-alpha/analytics-browser";
import { experiment } from "@amplitude-alpha/experiment-browser";
import { analytics as segmentAnalytics, SegmentAnalyticsConfig } from "@amplitude-alpha/plugin-segment-analytics-browser";
import { prepareExampleEnv, getProductConfigurationFromEnv } from './utils'

prepareExampleEnv();

/**
 * 1. Register plugins with Amplitude during load()
 */
amplitude.load({
  apiKey: 'a-key',
  disabled: false,
  logger: new Logger(),
  plugins: [
    analytics,
    experiment,
  ],
  configuration: {
    analytics: {
      apiKey: ''
    },
    experiment: {
      apiKey: ''
    }
  },
  // Uncomment to load configuration from .env
  ...getProductConfigurationFromEnv(),
})

/**
 * 2. Add plugins dynamically after load()
 */
amplitude.addPluginTyped<SegmentAnalyticsConfig>(segmentAnalytics, {
  writeKey: 'my-segment-write-key',
  flushInterval: 5000,
});

segmentAnalytics.track('My Event');
