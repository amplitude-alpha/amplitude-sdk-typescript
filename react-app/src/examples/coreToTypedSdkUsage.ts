/**
 * [Untyped] Imports
 */
import { amplitude } from '../@amplitude/amplitude/browser'
import { user } from '../@amplitude/user-browser'
import { analytics } from '../@amplitude/analytics/browser'
import { experiment } from '../@amplitude/experiment/browser'

/**
 * [Typed] Imports
 * Migrating to the Typed SDK is as easy as changing your imports
 */
// import { amplitude, user, analytics, experiment, UserLoggedIn } from '../amplitude'

/**
 * Load (Untyped and Typed)
 */
amplitude.load({
  apiKey: 'scoped-source-write-key',
  /**
   * [Untyped] We need to register plugins manually
   * [Typed] Plugins are added automatically. Comment out plugins below to avoid warnings.
   */
  plugins: [
    analytics,
    experiment
  ]
})

/**
 * [Untyped] usage
 */
amplitude.user.setUserId('u-id')

user.setUserProperties({
  requiredProp: "untyped"
});

experiment.fetch();
if (experiment.variant('flag-codegen-on')) {
  throw new Error('codegen not available')
} else {
  analytics.track('My Event')
}

/**
 * [Typed] usage
 * To enable the usage below simply switch to the [Typed] imports above
 */
// all codegen methods are available on 'data' objects per product
// user.data.setUserProperties({
//   requiredProp: "strongly typed",
// });
//
// if (experiment.data.flagCodegenEnabled()) {
//   analytics.data.userLoggedIn();
//   analytics.track(new UserLoggedIn());
// } else {
//   analytics.track('My Event')
// }
