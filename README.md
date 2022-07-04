# Typescript Mongoose Boilerplate

## Folder Structure

```

Main Folder
└───Config
    └───index.ts # Call all config Variable
    └───logger.ts # Log handler
└───src
    │   server.ts         # Application entry point
    └───Controller
        └───index.ts  # Call all controller in one file
        └───user.controller.ts # user all controller/Logic
    └───Database
        └───index.ts # Database Config
    └───Middleware
        └───index.ts # All Middleware call from this file
        └───Authentication.Middleware.ts # Authentication middleware
        └───Error.Middleware.ts # Error Middleware
    └───Models
        └───index.ts # All Models call from this file
        └───user.model.ts # User Model Config
    └───Routes
        └───index.ts # All Routes call from this file
        └───user.Routes.ts # All User Routes
        └───user.Authentication.ts # All User Authentication Routes
    └───Utils/Services
        └───index.ts # All Services call from this file
        └───APIFeature.service.ts # Search, Pagination, Filter API
        └───SendEmail.service.ts # Mail Config File
        └───SendToken.service.ts # Token Config File
        └───ErrorHandler.service.ts # Whole Error Handler
    └───Interface
        └───index.ts # All Interface call from this file
        └───user.interface.ts # User Interface
    └───Logger
        └───index.ts # Main Log Config
└───config.env # Secret environment Variables
```

## Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

### Step 2:- Download VSCode

Download [VSCode](https://code.visualstudio.com/)

### Step 3: Configuration & Install Packages

- Primary, You need to install both

```TypeScript

npm install -g yarn
npm install -g typescript

```

- create config file using this two command

```TypeScript

yarn init
tsc --init

```

### Internally Install

- Install all dependencies with `yarn install`

### Running in dev mode

- Run `yarn start`
- The server address will be displayed to you as `http://0.0.0.0:3000`

### Externally Install

- After this you need to install some package in your project file

```TypeScript

yarn add bcrypt@5.0.1 body-parser@1.19.1 cloudinary@1.28.1 cookie-parser@1.4.6 cors@2.8.5 dayjs@1.10.7 dotenv@16.0.0 express@4.17.2 joi@17.6.0 jsonwebtoken@8.5.1 mongoose@6.2.1 nodemailer@6.7.2 pino@7.6.5 pino-pretty@7.5.1 ts-node@10.5.0

```

> Note:- You Doesn't have to mention Version for all package but for industry level its good to download package with version

- After this you need to install some Dev Dependencies in your project file

```TypeScript

yarn add @types/bcrypt@5.0.0 @types/body-parser@1.19.2 @types/cookie-parser@1.4.2 @types/cors@2.8.1 @types/dotenv@8.2.0 @types/express@4.17.13 @types/joi@17.2.  @types/jsonwebtoken@8.5.8 @types/mongoose@5.11.97 @types/nodemailer@6.4.4 @types/pino@7.0.5 @types/pino-pretty@4.7.4 typescript@4.5.5

```

- Add this in your package.json File after License Field

```TypeScript
"scripts": {
    "start": "nodemon --config nodemon.json src/Your_Application_entry_point | pino-pretty"
  },
```

## Package Information

- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [cloudinary](https://www.npmjs.com/package/cloudinary)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [cors](https://www.npmjs.com/package/cors)
- [dayjs](https://www.npmjs.com/package/dayjs)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [express](https://www.npmjs.com/package/express)
- [joi](https://www.npmjs.com/package/joi)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [nodemailer](https://www.npmjs.com/package/nodemailer)
- [pino](https://www.npmjs.com/package/pino)
- [pino-pretty](https://www.npmjs.com/package/pino-pretty)
- [ts-node](https://www.npmjs.com/package/ts-node)
