const ENV_PINNED_FEATURE_ID = (import.meta.env.CX_PINNED_FEATURE_ID || '').trim();

// Optional fallback if you prefer a code-level default.
const DEFAULT_PINNED_FEATURE_ID = '';

export function getFeedPinnedFeatureId(): string | null {
  const value = ENV_PINNED_FEATURE_ID || DEFAULT_PINNED_FEATURE_ID;
  return value ? value : null;
}
