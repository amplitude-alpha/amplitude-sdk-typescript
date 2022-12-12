import { AnalyticsEvent, IAnalyticsClient } from "@amplitude-alpha/analytics-core";
import { newTrackMessage, trackMessage } from "@amplitude-alpha/analytics-messages";
import {
  AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory, UserClient, Config, PluginConfig,
} from "@amplitude-alpha/amplitude-node";
import { User } from "@amplitude-alpha/user";
import { jsons } from "@amplitude-alpha/util";
import { createInstance } from "@amplitude/analytics-node"
import { NodeClient as NodeClientLegacy, NodeOptions } from "@amplitude/analytics-types";

export type { AnalyticsEvent, NodeOptions };

export interface IAnalytics extends AmplitudePlugin, UserClient<IAnalyticsClient> {}

export class AnalyticsClient implements IAnalyticsClient {
  constructor(
    protected user: User,
    protected config: Config,
    private plugin: AmplitudePlugin,
    private client: NodeClientLegacy,
  ) {}

  async track(eventType: string | AnalyticsEvent, eventProperties?: Record<string, any>) {
    const event = (typeof eventType === 'string')
      ? { event_type: eventType, event_properties: eventProperties }
      : eventType;

    event.user_id = event.user_id ?? this.user.userId;
    event.device_id = event.device_id ?? this.user.deviceId;

    this.config.logger.log(`[Analytics.track] ${jsons(event)}`);

    const trackPromise = this.client.track(event).promise.then(result => {
      this.config.logger.log(`Event tracked (${event.event_type}) ${result.message}`)
    }).then(_ => {});

    // Publish event on bus to send to other listeners
    this.config.hub?.analytics.publish(newTrackMessage(this.plugin, event));

    return trackPromise;
  }

  async flush() {
    this.config.logger.log(`[Analytics.flush]`);

    return this.client.flush().promise;
  }
}

export interface AnalyticsPluginConfig {
  apiKey?: string;
  options?: NodeOptions;
}

export class Analytics extends AmplitudePluginBase implements IAnalytics {
  category: AmplitudePluginCategory = 'ANALYTICS';
  id = 'com.amplitude.analytics.node';
  name = 'analytics';
  version = 0;

  private apiKey: string;
  public client: NodeClientLegacy;

  load(config: PluginConfig, pluginConfig?: AnalyticsPluginConfig) {
    super.load(config, pluginConfig);

    this.apiKey = pluginConfig.apiKey ?? config.apiKey;

    this.client = createInstance();
    this.logger.log(`apiKey=${this.apiKey}]\noptions=${jsons(pluginConfig?.options)}`)
    this.client.init(this.apiKey, pluginConfig?.options);
  }

  user(user: User): IAnalyticsClient {
    user.load(this.config);

    const client = new AnalyticsClient(user, this.config, this, this.client);

    this.config.hub?.analytics.subscribe(trackMessage, message => {
      this.onAcceptableMessage(message.payload, async ({event}) => {
        await client.track(event)
      })
    });

    return client;
  }

  userId(userId: string): IAnalyticsClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): IAnalyticsClient {
    return this.user(new User(undefined, deviceId));
  }
}

// default instance
export const analytics = new Analytics();
