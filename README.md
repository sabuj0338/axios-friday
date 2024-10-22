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
import Friday from '@sabuj0338/axios-friday'

# Example, Configure first

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)