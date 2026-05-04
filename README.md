# LyraJS

A simple framework for building web API with Node.js.

We wanted to create a framework as similar as possible to the Symfony framework, with a CLI to help you create your API faster.

By default, the framework provides :
- Routing
- Middlewares
- User and role entities, repositories, controllers and routes
- Authentication with JWT
- CORS
- ORM for MySQL database managment
- Error handling
- CLI to help you create your API faster

Our CLI includes :
- A command to create a new entity and repository
- A command to create a new controller
- A command to create a new migration
- A command to apply last migration to make database tables corresponding to entities
- A command to load fixtures data in database
- A command "help" to display all available commands

## Installation

```bash
    cd <YOUR_PROJECT_NAME>
```

```bash
    npm install
```

## Run services

```bash
    npm run dev
```