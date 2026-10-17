import type { LoggerProvider } from "@opentelemetry/sdk-logs";

export let posthogLoggerProvider: LoggerProvider | null = null;

function missingConfigurationError(variableName: string) {
  return new Error(
    `${variableName} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variableName} is configured`,
  );
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!projectToken) {
    if (process.env.NODE_ENV === "development") {
      throw missingConfigurationError("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN");
    }
    return;
  }

  if (!host) {
    if (process.env.NODE_ENV === "development") {
      throw missingConfigurationError("NEXT_PUBLIC_POSTHOG_HOST");
    }
    return;
  }

  const [
    { OTLPLogExporter },
    { resourceFromAttributes },
    { BatchLogRecordProcessor, LoggerProvider },
  ] = await Promise.all([
    import("@opentelemetry/exporter-logs-otlp-http"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/sdk-logs"),
  ]);

  const exporter = new OTLPLogExporter({
    url: `${host}/i/v1/logs`,
    headers: {
      Authorization: `Bearer ${projectToken}`,
      "Content-Type": "application/json",
    },
  });

  posthogLoggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      "service.name": "yash14.com",
    }),
    processors: [new BatchLogRecordProcessor(exporter)],
  });
}

export function getPostHogLogger(name: string) {
  return posthogLoggerProvider?.getLogger(name);
}
