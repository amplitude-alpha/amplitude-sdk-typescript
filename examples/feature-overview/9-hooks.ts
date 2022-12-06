import { amplitude, Logger } from "@amplitude-alpha/amplitude-browser";
import { experiment } from "@amplitude-alpha/experiment-browser";
import { analytics } from "@amplitude-alpha/analytics-browser";
import { trackMessage } from "@amplitude-alpha/analytics-messages";
import { hub } from "@amplitude-alpha/hub";
import { user } from "@amplitude-alpha/user";
import { userUpdatedMessage } from "@amplitude-alpha/user-messages";
import { prepareExampleEnv, getProductConfigurationFromEnv } from './utils'

prepareExampleEnv();

const logger = new Logger();

/**
 * 1. Register plugins with Amplitude during load()
 */
amplitude.load({
  apiKey: 'scoped-source-write-key',
  logger,
  plugins: [
    experiment,
    analytics,
  ],
  ...getProductConfigurationFromEnv(),
})

/**
 * 2. Hook into Analytics updates via 'hub.analytics'
 */
hub.analytics.subscribe(trackMessage, (message) => {
  logger.log(`An analytics event was tracked! type=${message.payload.event.event_type}`);
});

/**
 * 2. Hook into User updates via 'hub.user'
 */
hub.user.subscribe(userUpdatedMessage, (message) => {
  logger.log(`The user was updated! userId=${message.payload.user.userId}`);
});

user.setUserId('test-user-id')
analytics.track('My Event')


