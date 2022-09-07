import { User as UserCore } from "../@amplitude/user";
import { AnalyticsEvent } from "../@amplitude/analytics/core";
import { IAnalyticsClient as IAnalyticsClientCore } from "../@amplitude/analytics/core";
import { IExperimentClient as IExperimentClientCore } from "../@amplitude/experiment/core";
import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore } from "../@amplitude/amplitude/core/client";

export type { AnalyticsEvent };

/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get data(): T;
}

/**
 * ENVIRONMENT
 */
export type Environment = 'development' | 'production' | 'test';

export const ApiKey: Record<Environment, string> = {
  development: 'dev-api-key',
  production: 'prod-api-key',
  test: 'test-api-key'
};

export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

/**
 * USER
 */
interface UserProperties {
  requiredProp: 'strongly typed';
}
interface TypedUserMethods {
  setUserProperties(properties: UserProperties): TypedUserMethods;
}

export class User extends UserCore implements Typed<TypedUserMethods> {
  get data(): TypedUserMethods {
    const core = this;
    return {
      setUserProperties(properties) {
        core.setUserProperties(properties);
        return this;
      },
    };
  }
}

export const user = new User();

/**
 * ANALYTICS
 */
export class UserLoggedIn implements AnalyticsEvent {
  event_type = 'User Logged In';
}

export interface TrackingPlanMethods{
  userSignedUp(): void;
  userLoggedIn(): void;
  addToCart(): void;
  checkout(): void;
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

/**
 * EXPERIMENT
 */
export type AMultiVariateExperiment = { control?: any, treatment?: any };

export interface VariantMethods {
  flagCodegenEnabled(): boolean;
  aMultiVariateExperiment(): AMultiVariateExperiment
}

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}
