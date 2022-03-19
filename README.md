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

### Configure dev domain and HTTPS
#### **Dev Domain**
To your hosts file add the entry
```bash
127.0.0.1 api.karly-capstone.dev
```
#### **Self Signed Certificates**
Install mkcert

**Homebrew (macOS)**
```bash
brew install mkcert
brew install nss # if you use Firefox
```
**Chocolatey (Windows)**
```bash
choco install mkcert
```
**Local CA**
```bash
mkcert -install
```

**Create SSL Certs**
```bash
mkcert api.karly-capstone.dev
```
after they are created a message should pop up with the location of the certs:
```bash
The certificate is at "./api.karly-capstone.dev.pem" and the key at "./api.karly-capstone.dev-key.pem"
```

**Add SSL Certs for webpack server**<br>
Under project root create a directory: `ssl/` and move the created `.pem` files to it
```bash
project-root
|
 - src/
|
 - ssl/
    |
     - api.karly-capstone.dev.pem
     - api.karly-capstone.dev-key.pem
```

## Development

You can run the project in development mode via:
```bash
npm run start
```