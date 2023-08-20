# Bourne Task App

#### Check it out [live](https://jfvillablanca.github.io/bourne-task-app/)
#### Check out the [source](https://github.com/jfvillablanca/bourne-task-app-api/) for the backend server (Express app using Nest framework) 

<details>
    <summary>"Why is the live site blurred initially?"</summary>

#### Initial loading behavior: 

When you visit the live site, you might notice that it loads immediately but appears blurred, and some elements may not be clickable for a period ranging from several seconds to a few minutes. While this behavior may seem unusual, it is completely normal and stems from the following reasons:

- The authorization server is hosted on a free-tier VM within Render.com. This VM operates with minimal resources: 0.1 CPU and 512MB of RAM. To optimize costs, the server goes into sleep mode when inactive.
- Upon loading the page, the React Query initiates a request to `/api/users/me` to verify the user's login status.
- While `isInitialLoading` is `true`, a blur overlay is on top of the Authentication component.
- This request serves to wake up the backend server VM, which requires some time due to its limited resources.
- Subsequent requests to the server may exhibit improved responsiveness, but it's important to anticipate occasional delays in response times.
</details>

### This TODO app but collaborative in nature, similar to Trello.

Features:
- Authentication and authorization 
    - Continuous Authentication: The access token gets refreshed when close to expiry.
    - Security Note: The refresh and access tokens are stored in localStorage. Yes, this is not secure. Security could be improved by using a combination storing the tokens in HTTP-only cookie and in memory, but this app is for demonstration purposes only. Token rotation/revocation is not employed in the backend also.
- User owning multiple projects with their own task states
- Assigning task to multiple project members

Motivation:
- This is a personal capstone project that covers the concepts/technologies/frameworks/languages that I learned in my journey to learn the web development in the full-stack context.
- From an '<overall>' perspective, this project features my ability in writing a full-stack application
    - Extensive tests: 
        - Unit tests that assert specifications of modules and functions.
        - API calls are mocked on the network-level via `msw` so that the

### Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [Contribute](#contribute)
- [License](#license)

## Installation <a name="installation"></a>

```bash
$ yarn install
```

## Development <a name="development"></a>

```bash
# development
$ yarn dev
```

## Testing <a name="testing"></a>

```bash
$ yarn test
```

## Production <a name="production"></a>

```bash
$ yarn build
```

## Contribute <a name="contribute"></a>

Feel free to open an issue/PR if you have a question, suggestion, whatever.

## License <a name="license"></a>

The project is licensed under the MIT license.
