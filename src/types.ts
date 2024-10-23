
export interface FridayOptions {
  enableThrowHttpError?: false;
  body?: object;
  headers?: object;
}

/**
 * @var baseURL: a required string property representing the base URL for API requests.
 * @var accessTokenKey: an optional string property representing the key for accessing the access token.
 * @var refreshTokenKey: an optional string property representing the key for accessing the refresh token.
 * @var refreshTokenEndpoint: an optional string property representing the API endpoint for refreshing tokens.
 * @var enableAccessToken: a optional boolean property indicating whether token access is enabled.
 * @var enableRefreshToken: a optional boolean property indicating whether token refresh is enabled.
 */
export interface FridayConfig {
  baseURL: string;
  accessTokenKey?: string;
  refreshTokenKey?: string;
  refreshTokenEndpoint?: string;
  enableAccessToken?: boolean;
  enableRefreshToken?: boolean;
}