import {
  AnalyticsEvent, IAnalyticsClient,
} from "@amplitude-alpha/analytics-core";
import {
  AmplitudePlugin, AmplitudePluginCategory, BrowserAmplitudePluginBase, BrowserPluginConfig,
} from "@amplitude-alpha/amplitude-browser";
import { jsons } from "@amplitude-alpha/util";
import { trackMessage, newTrackMessage } from "@amplitude-alpha/analytics-messages";
import { createInstance, Identify } from "@amplitude/analytics-browser";
import { BrowserClient as BrowserClientLegacy, BrowserOptions } from "@amplitude/analytics-types";
import { userUpdatedMessage } from "@amplitude-alpha/user-messages";

export type { AnalyticsEvent, IAnalyticsClient, BrowserOptions };

export interface IAnalytics extends AmplitudePlugin, IAnalyticsClient {
}

export interface AnalyticsPluginConfig {
  apiKey?: string;
  userId?: string;
  options?: BrowserOptions;
}

export class Analytics extends BrowserAmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';
  id = 'com.amplitude.analytics.browser';
  name = 'analytics';
  version = 0;

  private apiKey: string;
  private client: BrowserClientLegacy;

  load(config: BrowserPluginConfig, pluginConfig: AnalyticsPluginConfig) {
    super.load(config, pluginConfig);

    this.apiKey = pluginConfig?.apiKey || config.apiKey;
    this.client = createInstance();
    this.client.init(this.apiKey, pluginConfig?.userId, pluginConfig?.options);

    config.hub?.user.subscribe(userUpdatedMessage, message => {
      this.onAcceptableMessage(message.payload, async ({ updateType, user}) => {
        switch (updateType) {
          case "user-id":
            this.config.logger.log(`[Analytics.setUserId] ${user.userId}`);
            this.client.setUserId(user.userId);
            break;

          case "device-id":
            this.config.logger.log(`[Analytics.setDeviceId] ${user.deviceId}`);
            this.client.setDeviceId(user.deviceId);
            break;

          case "user-properties":
            this.config.logger.log(`[Analytics.setUserProperties] ${jsons(user.userProperties)}`);

            const userPropertyNames = Object.keys(user.userProperties);
            const id = new Identify();
            for (const propName in userPropertyNames) {
              id.set(propName, user.userProperties[propName])
            }

            void this.client.identify(id);
            break;
        }
      })
    })

    config.hub?.analytics.subscribe(trackMessage, message => {
      this.onAcceptableMessage(message.payload, ({event}) => {
        void this._track(event);
      })
    })
  }

  async track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    if (!event.user_id && !event.device_id) {
      event.user_id = this.config.user.userId;
      event.device_id = this.config.user.deviceId;
    }

    const trackPromise = this._track(event).then(_ => {});

    // Publish event on bus to send to other listeners
    this.config.hub?.analytics.publish(newTrackMessage(this, event));

    return trackPromise;
  }

  protected async _track(event: AnalyticsEvent) {
    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);
    return this.client.track(event).promise;
  }

  async flush() {
    this.config.logger.log(`[Analytics.flush]`);
    return this.client.flush().promise;
  }
}

// default instance
export const analytics = new Analytics();
