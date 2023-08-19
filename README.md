# KeystoneJS Template

## Developer Setup

### Brew

That's the prefered Mac package manager.

```shell
/bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
brew update
```

### SH, SSH, SFTP

- Install your preferred SSH and SFTP client(s).

### XCode Command Line Tools

- Install a fresh version of Xcode Command Line Tools, as many common tools depend on this.

```shell
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install # follow the prompts
```

### PostresQL and SQL client

- Install or update PostgresQL 13, either with Brew, but I prefer Postgres.app from <https://postgresapp.com/downloads.html>

  - In Postgres.app, add a v13 server, initialize and start.

- Install or update Postico (PostgreSQL only SQL client) from <https://eggerapps.at/postico/>, or TablePlus (multi databases SQL client) from <https://tableplus.com/>. I prefer and use TablePlus.

### Node

- Install or update [nvm](https://github.com/creationix/nvm#installation), by running the following brew command:

```shell
brew install nvm
nvm --version ## should be >= 0.38.x
```

- Install Node 16 LTS.

```shell
nvm install v16
nvm use v16
nvm alias default v16
node --version # should be >= v16.13.x
npm --version # should be >= 8.1.x
```

### VS Code Insiders

- Install the latest VS CODE, insider edition.
- Install your prefered extentions. Mine are :
  - Coverage Gutters
  - ESLint
  - Prettier - Code formatter
  - Markdownlint
  - npm Intellisense
  - UUID Generator
- Enable 'Format on Save' in VSC settings
- Lint warnings and errors should display in your editor

### Git

- If you're a git command line guru, I assume you're good and know how to install and configure it.
- Checkout the code base from <https://github.com/williamgagnon/keystonejs-template>

## Development

### Project Creation

The node project was created with the following, an official script to create and initialize a keystone project.

```shell
npm init keystone-app
```

### Launching

- In your Postgres SQL client, there is already a database with your username. This is the default PostgreSQL database. You connect to this database first to be able to do administrative tasks like the one on the next line.
- With your SQL client (connected to the default database), create a new user in the database and grant all roles:

```shell
CREATE USER test WITH ENCRYPTED PASSWORD 'postgres';
ALTER USER test CREATEDB;
```

- Launch the server in dev mode with:

```shell
cd <project-dir>
npm run dev
```

- It will say that your database is out of sync with the Keystone schema, and ask to run the migration scripts. Say yes.
- You can now access the backend as a super user at <http://localhost:80/>.
- The database migrations include an initial user (admin@example.com/keystonejs-template).

### Automated Tests

If tests will not run because the runner hangs, this may be a known issue with Watchman. Run the following command to check for the issue:

```shell
watchman version
```

If the version info does not display, run the following:

```shell
brew uninstall watchman
launchctl unload ~/Library/LaunchAgents/com.github.facebook.watchman.plist
brew install watchman
```

Run `watchman version` again to check if the problem has been fixed.

I use Mocha, Chai and Sinon as a test harness, instead of Jest, for reasons explained in the architecture section.

Unit tests file names end with '_.test.ts', whereas integration and end-to-end tests file names end with '_.spec.ts'. Performance tests file names end with '\_.perf.ts'.

See one of each to learn how to use test-builder.ts to simplify test file scafolding.

A nice way to run a subset of the test harness while developing is to use Mocha's .only modifyer on describe and it keywords, to limit the run to these tests only. Usually, you will also want to run 'npm run test:nocoverage' while developping.

A VS Code launch configuration is provided to launch the current test file in debug mode, which allows breakpoints to be set in either the tests or src files.

### Development Commands

Change to project-dir, then:

```shell
npm run dev # starts the project in dev/watch mode
npm run dev:reset # starts the project and resets the database
npm test # runs the unit, integration and end-to-end tests (no performance tests), including code coverage.
npm run test:nocoverage # Same as test, but without code coverate.
npm run test:unit # runs the unit tests only
npm run test:spec # runs the integration and end-to-end tests only
npm run test:perf # runs the performance tests only, against the AWS test environment.
npm run lint # lints the codebase
npm run build # build production optimized release
npm start # run in production optimized mode
```

Access <http://localhost:80> to login into the admin backend.

## Important Information, tricks and pitfalls

- If you get an error such as 'field does not exist on enclosing type', delete the .keystone folder where the admin UI is generated. As a best practice, delete this folder anytime you upgrade the keystone packages or you make significant schema changes.
- A Keystone server takes around 5 seconds to start, because of the automatic generation of the GQL API and Prisma (ORM) layers, the database migration checks, and the admin UI code generation. You will have to be mindfull of cold starts if you do serverless someday.
- I had an error 'prisma-fmt\* bla bla not found'. Know Keystone issue, no fix as of now. Error was on Node 14, went away when we moved to Node 16.
- Transactions have been temporarily disabled on mutations that span multiple lists. But the KS team mentions that they will be re-instated in the near term if the list primary keys do not use auto-inc fields.

## Architecture and Design Choices

### Runtimes, Frameworks and Platforms

- Node was selected for 1) its popularity, and 2) for its deployment flexibility (full servers or lambdas) which allows to either optimize performance or costs.
- Typescript. Because.
- KeystoneJS was chosen as the basis for a SaaS backend. Unless you have specific needs, I believe that the configuration, security, access management, user management, CRUD, Admin (back-office), API and API documentation layers should be no-code or low-code. KeystoneJS meets these requirements, and our usual criteria when selecting a technology or framework.
- With Keystone, all test runs reset the database when the Keystone test environment is created. This would occur with each test files with Jest, as it was impossible with Jest to create a singleton Keystone instance for all test files. Jest is also incredibly slow. We opted to migrate to Mocha, Istanbul (nyc launcher), Chai and Sinon to create the test harness. This is the most popular combo if your are not running Jest. The test-builder.ts module is registered with Mocha on launch (see Mocha config) and we create a singleton KS instance for the complete run.

### Why Keystone

- Provides a strong foundation for a Node backend (CMS).
- Relational database support (PostgreSQL). It's a better option for MVP projects, instead of a NoSQL database like Firestore.
- Declarative model as code, with database migration scripts automatically applied at startup. The scripts are auto-generated.
- Model relations include: one-to-one, one-to-many, many-to-many.
- Many out-of-the-box constraints and validations for fields.
- Automatic CRUDs, GraphQL endpoints, OpenAPI documentation, API playground.
- Powerful, out-of-the-box GQL query resolvers.
- Powerfull internal list query APIs.
- Flexible users and access control APIs. Lacks a complete OAuth implementation though, but could be written in easily.
- Lifecycle hooks for transformations, validations, access control and business rules.
- Complete and flexible access control mechanism. Really simple but powerful.
- Nice extensible mecanism to implement filtered queries.
- Many supporting projects/libraries.
- Recognized quality, popularity, community. (5K GitHub stars)
- KeystoneJS contains lots of automated tests, but coverage unknown.
- Seems to have been built by awesome engineers. Great attention to detail. For instance, queries that are secured, unlike mutations, will return an empty result instead of raising an error. Thus, you cannot discover the existance of a list item, by making educated guesses and getting an access error. You cannot differentiate between the absence of or the unauthorise access to an item.
- Mature, evolving since 2012. Now at V6.
- Low number of reported GitHub issues, and good response time from committers.
- Heavy GitHub activity over last month, with new Keystone 6 version just reaching GA.

### Data Modeling

- This project was configured to use UUIDs PKs, instead of the default CUIDs.

## Guidelines

### Coding

- You should follow AND inforce (with ESLint) the Prettier Javascript style guide.
- When in doubt about style and best practices, refer to :
  - <https://github.com/airbnb/javascript>
- Prettier is used to enforce styling.
- Log output is done with TK.
  - Tests will log at debug level so as to keep the unit tests output clean.
  - The application will log at info level to provide feedback during execution.

### KeystoneJS

- Content types names are singular and start with a capital letter (eg User).
- Content type field names are singular and start with a lower case letter.
- You should group by and place domain related files in subfolders under src/domains.
