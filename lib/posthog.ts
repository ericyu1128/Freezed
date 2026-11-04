import posthog from 'posthog-js';

type PostHogProperties = Record<string, boolean | number | string>;

let initialized = false;

function requirePostHogEnvironment(variable: string, value: string | undefined) {
  if (!value && process.env.NODE_ENV !== 'production') {
    throw new Error(
      `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
    );
  }

  return value;
}

export function initializePostHog(requireConfiguration = false) {
  const apiKey = requireConfiguration
    ? requirePostHogEnvironment('NEXT_PUBLIC_POSTHOG_KEY', process.env.NEXT_PUBLIC_POSTHOG_KEY)
    : process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = requireConfiguration
    ? requirePostHogEnvironment('NEXT_PUBLIC_POSTHOG_HOST', process.env.NEXT_PUBLIC_POSTHOG_HOST)
    : process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !apiHost) return false;

  if (!initialized) {
    posthog.init(apiKey, {
      api_host: apiHost,
      defaults: '2025-05-24',
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
      logs: {
        serviceName: 'freezed-web',
        environment: process.env.NODE_ENV ?? 'development',
      },
    });
    initialized = true;
  }

  return true;
}

export function capturePostHogEvent(event: string, properties?: PostHogProperties) {
  if (!initializePostHog()) return;

  posthog.capture(event, properties);
}

export function capturePostHogException(error: Error) {
  if (!initializePostHog()) return;

  posthog.captureException(error);
}

export function logPostHogInfo(message: string, properties?: PostHogProperties) {
  if (!initializePostHog()) return;

  posthog.logger.info(message, properties);
}
