/**
 * Basic NodeJS App, No Frameworks
 *
 * For server and middleware usage see [server.ts](./server.ts)
 */

import dotenv from 'dotenv';
import { merge } from 'lodash';

import { amplitude, analytics, experiment, UserLoggedIn, Logger, User } from './amplitude'
import { getProductConfigurationFromEnv } from "@amplitude-alpha/util";

// Read Configuration
dotenv.config()

const userId = process.env.AMP_USER_ID || 'alpha-user-id-node';
const deviceId = process.env.AMP_DEVICE_ID || 'alpha-device-id-node';
const shouldRunApp = process.env.AMP_TEST !== 'true';
const useLogger = process.env.AMP_LOGGING_DISABLED !== 'true';

amplitude.typed.load({
  environment: 'production',
  logger: useLogger ? new Logger() : undefined,
  // Try reading in ApiKeys from .env file
  ...merge(
    getProductConfigurationFromEnv(),
    {
      configuration: {
        analytics: {
          options: {
            flushIntervalMillis: 1,
            flushQueueSize: 1
          }
        }
      }
    }
  )
})

export async function runApp() {
  /**
   * 1. Track with `userId`
   */
  await analytics.userId(userId).track(new UserLoggedIn({
    method: "email"
  }));

  /**
   * 2. Track with `deviceId`
   */
  await analytics.deviceId(deviceId).typed.userSignedUp();

  /**
   * 3. Track with `userProperties`
   */
  const user = new User(userId);
  user.typed.setUserProperties({
    referralSource: 'other'
  })
  await analytics.user(user).typed.checkout();

  /**
   * 4. Keep user scoped clients for multiple actions for the same user
   */
  // create individual product clients for user
  const userAnalytics =  analytics.user(user);
  const userExperiment =  experiment.user(user);

  await userExperiment.fetch();
  userExperiment.exposure();

  if (userExperiment.typed.codegenBooleanExperiment().on) {
    userAnalytics.typed.userSignedUp({
      referralSource: "other"
    })
    userAnalytics.track(new UserLoggedIn({
      method: "email"
    }))
  } else {
    userAnalytics.track({
      event_type: 'My Untyped Event'
    })
  }

  /**
   * 5. Flush any pending events
   */
  await userAnalytics.flush()
}

if (shouldRunApp) {
  // @ts-ignore
  runApp().then(() => {
    console.log('Program complete!')
  })
}
