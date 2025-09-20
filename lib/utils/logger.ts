const isDev = process.env.NODE_ENV === "development";

type LogArgs = unknown[];

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDev) console.debug(...args);
  },
  info: (...args: LogArgs) => {
    console.info(...args);
  },
  warn: (...args: LogArgs) => {
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    console.error(...args);
  },
} as const;

export function logContextAssembly(details: {
  summariesCount: number;
  rawCount: number;
  droppedSummaries?: number;
  estTokens?: number;
  budget?: number;
}) {
  if (process.env.NODE_ENV !== "production") {
    logger.debug("Context assembly", details);
  }
}
