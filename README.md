# @sabuj0338/axios-friday
This is an Axios-based customized class `Friday` that appears to be designed for making API requests with authentication and token refresh capabilities.

This library uses `cookie` to store `access_token` and `refresh_token`.

`@sabuj0338/axios-friday` is a TypeScript library for dealing with API requests.

## Installation


```bash
npm install @sabuj0338/axios-friday
```

## Usage

```python
import { Friday } from "@sabuj0338/axios-friday";

# Configure and use

const baseURL = "https://sabuj0338.github.io/portfolio";

const friday = new Friday({ 
    baseURL: baseURL,
    # accessTokenKey: "access_token",
    # refreshTokenKey: "refresh_token",
    # refreshTokenAPI: "/api/refresh",
    # enableRefreshToken: false,
    # enableAccessToken: true,
});

# returns 'AxiosResponse'
const response = await friday.get(new URL(baseURL));

```

## Example of using a class that Extends `Friday`

```python
import { Friday } from "@sabuj0338/axios-friday";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export const API_URL = import.meta.env.VITE_BASE_API_URL;
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const REFRESH_TOKEN_API = import.meta.env.VITE_REFRESH_TOKEN_API;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;

class MyFriday extends Friday {
  constructor(baseURL: string = BASE_API_URL) {
    super({
      baseURL: baseURL,
      refreshTokenEndpoint: REFRESH_TOKEN_API,
      accessTokenKey: ACCESS_TOKEN_KEY,
      refreshTokenKey: REFRESH_TOKEN_KEY,
      enableRefreshToken: true,
      enableAccessToken: true,
    });
  }

  override resetTokens(res: AxiosResponse<any, any>) {
    Cookies.set(ACCESS_TOKEN_KEY, res.data.tokens.access.token);
    Cookies.set(REFRESH_TOKEN_KEY, res.data.tokens.refresh.token);
  }

  override throwError(message: string): void {
    toast.error(message);
  }
}

export const friday = new MyFriday();


# returns 'AxiosResponse'
const response = await friday.get(new URL(baseURL));

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)