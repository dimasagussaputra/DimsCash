type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const FRIENDLY_MESSAGES: Record<string, string> = {
  PGRST301: "Sesi Anda sudah berakhir. Silakan masuk kembali.",
  PGRST302: "Sesi Anda sudah berakhir. Silakan masuk kembali.",
  PGRST303: "Gangguan sementara saat mengambil data. Silakan klik Coba lagi.",
  "42501": "Anda tidak memiliki akses ke data ini.",
  "23505": "Data tersebut sudah ada.",
  "23503": "Data masih digunakan oleh data lain.",
  "23502": "Data yang dikirim belum lengkap.",
};

export class SupabaseQueryError extends Error {
  code?: string;
  details?: string;
  hint?: string;

  constructor(error: SupabaseErrorLike) {
    super(error.message || "Terjadi kesalahan pada server");
    this.name = "SupabaseQueryError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    const friendly = error.code ? FRIENDLY_MESSAGES[error.code] : undefined;
    if (friendly) this.message = friendly;
  }
}

export function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new SupabaseQueryError(error as SupabaseErrorLike);
  }
  return new Error("Terjadi kesalahan yang tidak terduga");
}

const RETRYABLE_CODES = new Set(["PGRST303"]);

function isRetryable(result: unknown): boolean {
  if (!result || typeof result !== "object") return false;
  const code = (result as { error?: SupabaseErrorLike | null }).error?.code;
  return typeof code === "string" && RETRYABLE_CODES.has(code);
}

const RETRY_DELAYS_MS = [500, 1500];

export async function withRetry<T>(
  run: () => T,
  attempts = RETRY_DELAYS_MS.length + 1
): Promise<Awaited<T>> {
  let result: Awaited<T> = await run();
  for (let attempt = 0; attempt < attempts - 1; attempt++) {
    if (!isRetryable(result)) break;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    result = await run();
  }
  return result;
}
