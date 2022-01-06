## Installation

### Install Node (v16.13.0) 

**Homebrew**

```bash
brew install node@16
```

LTS version intalls are keg-only so might need to run
```bash
brew link --force node@16
```
and follow directions.

**Chocolatey**

```bash
choco install nodejs-lts --version 16.13.0 -y
```

**Manual Installation**
[Node](https://nodejs.org/ko/blog/release/v16.13.0/)

### Install project dependencies
```bash
npm i
```

## Development

You can run the project in development mode via:
```bash
npm run start
```