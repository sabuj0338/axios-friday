import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { FridayConfig, FridayOptions } from "./types";

export class Friday {
  /* The above code is declaring a private property `config` of type `FridayConfig` in a TypeScript
  class or interface. The `FridayConfig` type is likely a custom type defined elsewhere in the
  codebase. This property can only be accessed within the class or interface where it is declared. */
  private config: FridayConfig;

  /* The above code is declaring a private property named `axiosInstance` of type `AxiosInstance`. This
  property is likely used to store an instance of Axios, which is a popular library for making HTTP
  requests in JavaScript and TypeScript. This property can be accessed and used within the class
  where it is declared. */
  private axiosInstance: AxiosInstance;

  /**
   * The constructor function initializes an Axios instance with a base URL and sets up a response
   * interceptor to handle token expiration and refresh if configured to do so.
   * @param {FridayConfig} config - The `config` parameter in the constructor function is of type
   * `FridayConfig`. It is used to configure the Friday instance with settings such as `baseURL` and
   * `enableRefreshToken`. The `axiosInstance` is created with the base URL specified in the `config`.
   */
  constructor({
    baseURL,
    accessTokenKey = "access_token",
    refreshTokenKey = "refresh_token",
    refreshTokenEndpoint = "/api/refresh",
    enableAccessToken = true,
    enableRefreshToken = false,
    storage = "cookie",
  }: FridayConfig) {
    this.config = {
      baseURL,
      accessTokenKey,
      refreshTokenKey,
      refreshTokenEndpoint,
      enableAccessToken,
      enableRefreshToken,
      storage,
    };

    // Create an Axios instance with a base URL
    this.axiosInstance = axios.create({ baseURL: this.config.baseURL });

    if (this.config.enableRefreshToken && this.config.refreshTokenEndpoint) {
      // Axios response interceptor to handle token expiration and refresh
      this.axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          // Check if the error is due to an expired token (HTTP status code 401)
          if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newAccessToken = await this.refreshAccessToken();

            // Retry the original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.axiosInstance(originalRequest);
          }

          return Promise.reject(error);
        }
      );
    }

    // Add Axios request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (config.url) {
          const baseUrl = config.baseURL || "";
          const fullUrl = new URL(config.url, baseUrl).toString();
          config.url = this.cleanUrl(fullUrl).replace(baseUrl, ""); // Retain relative path if baseURL is set
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * The function `refreshAccessToken` asynchronously refreshes the access token by making an API
   * request using a refresh token and updating the access token in the app's storage.
   * @returns The `refreshAccessToken` function is returning the access token after successfully
   * refreshing it using the refresh token.
   */
  async refreshAccessToken() {
    try {
      if (this.config.refreshTokenEndpoint == undefined) return;

      const refreshToken = this.getRefreshToken();
      if (refreshToken === undefined) throw new Error("Unauthorized Attempt!");

      // Make an API request to your backend to get a new access token using the refresh token
      const res = await this.axiosInstance.post(
        this.config.refreshTokenEndpoint,
        {
          refreshToken,
        }
      );

      // Update the access token in your app's storage (e.g., localStorage or cookie's)
      if (res.status != 200)
        throw new Error("Refresh access token request failed!");

      this.resetTokens(res);
      return this.getAccessToken();
    } catch (error) {
      throw error;
    }
  }

  /**
   * The setTokens function stores a key-value pair either in a cookie or in local storage based on the
   * configuration.
   * @param {string} key - The `key` parameter is a string that represents the key under which the
   * `value` will be stored in either a cookie or local storage, depending on the configuration set in
   * `this.config.storage`.
   * @param {string} value - The `value` parameter in the `setTokens` function represents the value that
   * you want to store in either a cookie or local storage, based on the configuration set in
   * `this.config.storage`.
   */
  private setTokens(key: string, value: string) {
    if (this.config.storage == "cookie") {
      Cookies.set(key, value);
    } else if (this.config.storage == "local") {
      localStorage.setItem(key, value);
    }
  }

  /**
   * The function `resetTokens` sets the access token and refresh token in cookies based on the
   * response data from an Axios request.
   * @param res - The `res` parameter in the `resetTokens` function is an AxiosResponse object. It
   * represents the response returned from an HTTP request made using Axios. The AxiosResponse object
   * contains data such as the response data, status, headers, and more.
   */
  resetTokens(res: AxiosResponse<any, any>) {
    if (this.config.accessTokenKey) {
      this.setTokens(this.config.accessTokenKey, res.data.access_token);
    }
    if (this.config.refreshTokenKey) {
      this.setTokens(this.config.refreshTokenKey, res.data.refresh_token);
    }
  }

  /**
   * The function `getAccessToken` retrieves the access token from a cookie using the key specified in
   * the configuration.
   * @returns The `getAccessToken` method is returning a string value or `undefined`. It retrieves the
   * access token from a cookie using the `accessTokenKey` specified in the configuration.
   */
  private getAccessToken(): string | undefined {
    if (this.config.storage == "cookie") {
      return (
        this.config.accessTokenKey && Cookies.get(this.config.accessTokenKey)
      );
    } else if (this.config.storage == "local") {
      return (
        this.config.accessTokenKey &&
        (localStorage.getItem(this.config.accessTokenKey) || undefined)
      );
    }
  }

  /**
   * Retrieves the refresh token from a cookie using the key specified in the configuration.
   * @returns A string value or `undefined`. It retrieves the refresh token from a cookie using the
   * `refreshTokenKey` specified in the configuration.
   */
  private getRefreshToken(): string | undefined {
    if (this.config.storage == "cookie") {
      return (
        this.config.refreshTokenKey && Cookies.get(this.config.refreshTokenKey)
      );
    } else if (this.config.storage == "local") {
      return (
        this.config.refreshTokenKey &&
        (localStorage.getItem(this.config.refreshTokenKey) || undefined)
      );
    }
  }

  /**
   * The function `getAuthorizationHeader` returns an object with an Authorization header containing a
   * Bearer token if an access token is available.
   * @returns If the `accessToken` is not `undefined`, an object with the `Authorization` header
   * containing the access token in the format `Bearer ` is being returned. If the
   * `accessToken` is `undefined`, then `undefined` is being returned.
   */
  private getAuthorizationHeader(): { Authorization: string } | undefined {
    if (this.config.enableAccessToken != true) return;

    const accessToken = this.getAccessToken();

    if (accessToken === undefined) return;

    return { Authorization: `Bearer ${accessToken}` };
  }

  /**
   * The function `handleError` in TypeScript handles errors by extracting error messages and
   * optionally displaying them as a toast.
   * @param {unknown} e - The parameter `e` in the `handleError` function is used to represent the
   * error that needs to be handled. It can be of type `unknown`, which means it can be any type of
   * value. The function checks if `e` is an AxiosError and extracts the error message accordingly.
   * @param {FridayOptions} [options] - The `options` parameter in the `handleError` function is of type
   * `FridayOptions`. It is an optional parameter that allows you to pass additional options to the
   * function. These options can include properties like `showToast`, which is a boolean value
   * indicating whether a toast message should be displayed
   */
  private handleError(e: unknown, options?: FridayOptions): undefined {
    if (options?.enableThrowHttpError == false) return;

    let errorMessage: string | undefined;

    if ((e as AxiosError)?.response) {
      const error = e as AxiosError;
      errorMessage = (error.response?.data as Error).message;
    } else {
      errorMessage = (e as Error).message;
    }
    if (errorMessage) {
      this.throwError(errorMessage);
    }
  }

  /**
   * The throwError function in TypeScript throws an error with a specified error message.
   * @param {string} errorMessage - The `errorMessage` parameter is a string that represents the
   * message you want to associate with the error that will be thrown.
   */
  throwError(errorMessage: string): void {
    throw new Error(errorMessage);
  }

  /**
   * The `cleanUrl` function in TypeScript takes a URL as input, removes any empty parameters from the
   * query string, and returns the cleaned URL.
   * @param {string} url - The `cleanUrl` function takes a URL as a parameter and cleans up the query
   * string by removing any empty parameters. If there are no query parameters, it returns the original
   * URL.
   * @returns The `cleanUrl` function returns a cleaned version of the input URL by removing any empty
   * parameters from the query string. If the query string is empty after cleaning, it returns the base
   * URL without the query string.
   */
  private cleanUrl(url: string): string {
    // Split the URL into base and query string
    const [base, query] = url.split("?");

    if (!query) return url; // Return the original URL if there's no query string

    // Initialize URLSearchParams to handle query string
    const searchParams = new URLSearchParams(query);

    // Remove any empty parameters
    for (const [key, value] of searchParams.entries()) {
      if (value === "") {
        searchParams.delete(key);
      }
    }

    // Construct and return the cleaned URL
    const cleanedQuery = searchParams.toString();
    return cleanedQuery ? `${base}?${cleanedQuery}` : base;
  }

  /**
   * The `get` function makes an asynchronous GET request using Axios with error handling and returns
   * the response data.
   * @param {URL} url - The `url` parameter in the `get` function is of type `URL`, which represents a
   * Uniform Resource Locator and is used to specify the address of a resource on the internet. It is
   * the endpoint from which the data will be fetched in the `get` request.
   * @param {FridayOptions} [options] - The `options` parameter in the `get` function is of type
   * `FridayOptions`. It is an optional parameter that can be passed to the function to provide
   * additional configuration or settings for the HTTP request. This parameter allows for customization
   * of the request behavior based on the specific needs of the application
   * @returns The `get` function is returning the data from the response if the request is successful.
   * If there is an error during the request, it will handle the error using the `handleError` method
   * with the provided options.
   */
  async get(url: URL, options?: FridayOptions) {
    try {
      return await this.axiosInstance.get(url.href, {
        headers: {
          ...this.getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * This TypeScript function sends a POST request using Axios with optional parameters and handles any
   * errors that occur.
   * @param {URL} url - The `url` parameter in the `post` function is a URL object that represents the
   * endpoint where the POST request will be sent. It specifies the location where the data will be
   * posted to.
   * @param {FridayOptions} [options] - The `options` parameter in the `post` function is an optional
   * parameter of type `FridayOptions`. It is used to provide additional configuration options for the
   * HTTP POST request, such as the request body and headers. If `options` is provided, the function
   * will use the `body`
   * @returns The `post` function is returning the data from the response if the request is successful.
   * If there is an error during the request, it will handle the error using the `handleError` method
   * and return the result of that handling.
   */
  async post(url: URL, options?: FridayOptions) {
    try {
      return await this.axiosInstance.post(url.href, options?.body, {
        headers: {
          ...options?.headers,
          ...this.getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * This TypeScript function sends a PUT request using Axios with specified options and handles any
   * errors that occur.
   * @param {URL} url - The `url` parameter in the `put` function is a URL object that represents the
   * URL where the PUT request will be sent. It is used to specify the destination of the request.
   * @param {FridayOptions} [options] - The `options` parameter in the `put` function is an optional
   * object that may contain the following properties:
   * @returns The `put` function is returning the data from the response if the request is successful.
   * If there is an error during the request, it will handle the error using the `handleError` method
   * and return the result of that handling.
   */
  async put(url: URL, options?: FridayOptions) {
    try {
      return await this.axiosInstance.put(url.href, options?.body, {
        headers: {
          ...options?.headers,
          ...this.getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * This TypeScript function sends a PATCH request using Axios with specified options and handles any
   * errors that occur.
   * @param {URL} url - The `url` parameter in the `patch` function is a URL object that represents the
   * URL where the PATCH request will be sent. It is used to specify the destination of the request.
   * @param {FridayOptions} [options] - The `options` parameter in the `patch` function is an optional
   * object that may contain the following properties:
   * @returns The `patch` function is returning the data from the response if the request is successful.
   * If there is an error during the request, it will handle the error using the `handleError` method
   * and return the result of that handling.
   */
  async patch(url: URL, options?: FridayOptions) {
    try {
      return await this.axiosInstance.patch(url.href, options?.body, {
        headers: {
          ...options?.headers,
          ...this.getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * The `delete` function sends a DELETE request to a specified URL with optional headers and body,
   * handling errors and returning the response data.
   * @param {URL} url - The `url` parameter is a `URL` object that represents the URL of the resource
   * you want to delete. It is used to specify the location of the resource that you want to delete.
   * @param {FridayOptions} [options] - The `options` parameter in the `delete` function is an optional
   * parameter of type `FridayOptions`. It is used to provide additional configuration options for the
   * HTTP request, such as request body and headers. The function uses the `body` property from the
   * `options` object as the data
   * @returns The `delete` method is returning the data from the response if the request is successful.
   * If there is an error during the request, it will handle the error and return the result of the
   * `handleError` method with the provided options.
   */
  async delete(url: URL, options?: FridayOptions) {
    try {
      return await this.axiosInstance.delete(url.href, {
        data: options?.body,
        headers: {
          ...options?.headers,
          ...this.getAuthorizationHeader(),
        },
      });
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * The `upload` function makes an asynchronous POST request using Axios with error handling and returns
   * the response data.
   * @param {URL} url - The `url` parameter in the `upload` function is of type `URL`, representing the
   * Uniform Resource Locator where the data will be uploaded. It specifies the endpoint to which the
   * data will be sent in the `POST` request.
   * @param {FormData} body - The `body` parameter in the `upload` function is of type `FormData`, which
   * contains the data to be uploaded in the request. It includes the content that will be sent to the
   * server in the upload operation.
   * @returns The `upload` function is returning the data from the response if the request is successful.
   * If an error occurs during the request, it will handle the error using the `handleError` method.
   */
  async upload(url: URL, body: FormData) {
    try {
      return await this.axiosInstance.post(url.href, body, {
        headers: {
          ...this.getAuthorizationHeader(),
        },
      });
    } catch (e) {
      return this.handleError(e);
    }
  }
}
