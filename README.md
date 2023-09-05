# Bourne Task App

### 📔 A collaborative task management app inspired by Trello.

#### Check it out [live](https://jfvillablanca.github.io/bourne-task-app/)
#### Check out the [source](https://github.com/jfvillablanca/bourne-task-app-api/) for the backend server (Express app using Nest framework) 

<details>
    <summary>"❓Why is the live site blurred initially?"</summary>

#### Initial loading behavior: 

When you visit the live site, you might notice that it loads immediately but appears blurred, and some elements may not be clickable for a period ranging from several seconds to a few minutes. While this behavior may seem unusual, it is completely normal and stems from the following reasons:

- The authorization server is hosted on a free-tier VM within Render.com. This VM operates with minimal resources: 0.1 CPU and 512MB of RAM. To optimize costs, the server goes into sleep mode when inactive.
    - Additionally, when the server wakes, it makes a database connection with a database hosted in a free-tier MongoDB Atlas cluster which has limited resources also and that adds up to the **wake up delay**. 
- Upon loading the page, the React Query initiates a request to `/api/users/me` to verify the user's login status.
- While `isInitialLoading` is `true`, a blur overlay is on top of the Authentication component.
- This request serves to wake up the backend server VM, which requires some time due to its limited resources.
- Subsequent requests to the server may exhibit improved responsiveness, but it's important to anticipate occasional delays in response times.
</details>

### Table of Contents

- [Features](#features)
- [Technical Details](#technical)
- [Motivation](#motivation)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [Contribute](#contribute)
- [License](#license)

## Features: <a name="features"></a>
## Technical Details: <a name="technical"></a>
## Motivation: <a name="motivation"></a>
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
