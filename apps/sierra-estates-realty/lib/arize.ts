import 'server-only';
import { trace, SpanStatusCode, type Tracer, type Span } from '@opentelemetry/api';
import { logger } from '@/lib/logger';

let initPromise: Promise<void> | null = null;

/**
 * Lazily loads and starts the OpenTelemetry NodeSDK exporting to Arize.
 * Dynamic imports keep the heavy SDK/exporter/grpc packages out of the
 * module graph entirely when no Arize credentials are configured —
 * mirrors the firebase-admin lazy-init pattern used elsewhere in lib/server.
 */
async function loadAndStart(): Promise<void> {
  const spaceId = process.env.ARIZE_SPACE_ID;
  const apiKey = process.env.ARIZE_API_KEY;

  if (!spaceId || !apiKey) {
    logger.info('📡 [Arize] ARIZE_SPACE_ID/ARIZE_API_KEY not configured — tracing disabled');
    return;
  }

  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { SEMRESATTRS_PROJECT_NAME } = await import('@arizeai/openinference-semantic-conventions');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-grpc');
    const { Metadata } = await import('@grpc/grpc-js');
    const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');

    const metadata = new Metadata();
    metadata.set('space-key', spaceId);
    metadata.set('api-key', apiKey);

    const exporter = new OTLPTraceExporter({
      url: 'https://otlp.arize.com:443',
      metadata,
    });

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [SEMRESATTRS_PROJECT_NAME]: process.env.ARIZE_PROJECT_NAME || 'sierra-estates-platform',
      }),
      spanProcessors: [new BatchSpanProcessor(exporter)],
    });

    sdk.start();
    logger.info('📡 [Arize] OpenTelemetry tracing initialized');
  } catch (error) {
    logger.warn(
      '[Arize] Initialization failed — agent tracing disabled. Reason: ' +
      (error instanceof Error ? error.message : String(error))
    );
  }
}

/** Call once at server startup (see instrumentation.ts). Safe to call multiple times. */
export function initArize(): void {
  if (typeof window !== 'undefined') return;
  if (!initPromise) {
    initPromise = loadAndStart();
  }
}

/** @deprecated kept for backwards compatibility — use initArize() */
export async function initializeArize(): Promise<void> {
  initArize();
  await initPromise;
}

export function getTracer(): Tracer {
  // Without an active provider (initArize() never configured/called),
  // @opentelemetry/api transparently returns a no-op tracer — harmless.
  return trace.getTracer('sierra-estates-orchestrator');
}

/** Wraps an agent function in an Arize span for observability. */
export function instrumentAgent<T>(
  agentName: string,
  stage: string,
  docId: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(
    `${agentName}:${stage}`,
    {
      attributes: {
        'sierra_estates.agent': agentName,
        'sierra_estates.stage': stage,
        'sierra_estates.doc_id': docId,
        'openinference.span.kind': 'CHAIN',
      },
    },
    async (span: Span) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error instanceof Error ? error : String(error));
        span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : String(error) });
        throw error;
      } finally {
        span.end();
      }
    }
  );
}
