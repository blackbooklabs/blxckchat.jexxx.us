/**
 * Overridable for local dev/testing against a non-production secure.jexxx.us
 * deploy. Read lazily (not as a module-load-time constant) so tests can set
 * JEXXXUS_SECURE_URL after this module has already been imported.
 */
export declare function getSecureBaseUrl(): string;
export interface Credentials {
    userId: string;
    email: string;
    /** Clerk display name from secure.jexxx.us (optional until re-login/refresh). */
    fullName?: string;
    username?: string | null;
    imageUrl?: string | null;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    refreshedAt: string;
}
export interface CredentialsFile {
    providers?: unknown;
    credentials?: Credentials;
}
export declare function getCredentialsDir(): string;
export declare function getCredentialsPath(): string;
/**
 * Ensure ~/.jexxxus directory exists with correct permissions
 */
export declare function ensureCredsDir(): void;
export interface LoadCredentialsOptions {
    /** Suppress chmod warnings — use when blessed TUI owns stdout. */
    quiet?: boolean;
}
/**
 * Load credentials from ~/.jexxxus/credentials.json
 */
export declare function loadCredentials(options?: LoadCredentialsOptions): Credentials | null;
/**
 * Save credentials to ~/.jexxxus/credentials.json with 0600 permissions
 */
export declare function saveCredentials(creds: Credentials): void;
/**
 * Delete credentials file securely (overwrite then delete)
 */
export declare function deleteCredentials(): void;
/**
 * Generate a random device code (6-8 character alphanumeric)
 */
export declare function generateDeviceCode(): string;
/**
 * Generate PKCE code verifier (RFC 7636, 128-char random)
 */
export declare function generateCodeVerifier(): string;
/**
 * Generate PKCE code challenge from verifier (SHA256(verifier))
 */
export declare function generateCodeChallenge(verifier: string): string;
/**
 * Check if credentials are still valid (not expired)
 */
export declare function isTokenValid(creds: Credentials | null): boolean;
/**
 * Check if token needs refresh. Clerk session JWTs from secure.jexxx.us are
 * often ~60s TTL — refresh when fewer than 45 seconds remain.
 */
export declare function shouldRefreshToken(creds: Credentials): boolean;
/**
 * Get time in minutes until token expires
 */
export declare function getTokenExpiryMinutes(creds: Credentials): number;
/**
 * Ensure token is valid — refreshes via secure.jexxx.us when expired or
 * expiring within 5 minutes (Clerk session JWTs are often ~60s TTL).
 */
export declare function ensureValidToken(refreshFn?: (refreshToken: string) => Promise<Credentials>, options?: LoadCredentialsOptions): Promise<Credentials>;
/** Human-readable auth status for TUI / slash /status output. */
export declare function formatAuthStatusLines(creds: Credentials | null): string[];
/**
 * Shared device-login flow for `jexxxus auth login` and BLXCKCHAT `/auth login`.
 * Prints instructions to stdout and polls secure.jexxx.us until allow/deny/timeout.
 */
export declare function runInteractiveDeviceLogin(): Promise<Credentials>;
/** Open the secure.jexxx.us device consent page in the system browser. */
export declare function openDeviceAuthBrowser(verificationUrl: string): void;
/**
 * Step 1 of `jexxxus auth login`: register a new device session with
 * secure.jexxx.us. Sends only the PKCE code_challenge — the code_verifier
 * this function generates stays local until poll time. Returns the URL
 * without the code — user enters code manually on the page for security.
 */
export declare function startDeviceAuth(): Promise<{
    userCode: string;
    codeVerifier: string;
    expiresIn: number;
    verificationUrl: string;
}>;
/**
 * Step 2: poll secure.jexxx.us until the browser-side consent screen
 * resolves (allow, deny, or the device code expires). Returns full
 * Credentials once the user grants access.
 */
export declare function pollDeviceAuth(userCode: string, codeVerifier: string, timeoutSeconds: number, pollIntervalMs?: number): Promise<Credentials>;
/**
 * Refresh: exchange the stored refresh_token for a fresh access token via
 * secure.jexxx.us. The server mints this server-side against the user's
 * Clerk session — no browser interaction needed.
 */
export declare function refreshAccessTokenViaServer(refreshToken: string): Promise<Credentials>;
/**
 * Append entry to debug log
 */
export declare function logDebug(message: string): void;
/**
 * Interactive readline prompt for y/n confirmation
 */
export declare function promptYesNo(question: string): Promise<boolean>;
//# sourceMappingURL=auth.d.ts.map