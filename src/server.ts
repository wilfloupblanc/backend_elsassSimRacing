import "reflect-metadata"

import { Config, createServer, LyraConsole, SecurityConfig } from "@lyra-js/core"
import bcrypt from "bcrypt"
import * as dotenv from "dotenv"
import jwt from "jsonwebtoken"
import * as process from "node:process"


dotenv.config()
process.env.TZ = process.env.TZ || "Europe/Paris"

const params = new Config().get("parameters")
const securityConfig = new SecurityConfig().getConfig()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3333
const app = createServer()

// Server settings
app.setSetting("trust proxy", false)
app.setSetting("request max size", securityConfig.limits.request_max_size || "10mb")
app.setSetting("ssr", {
  engine: "jsx", // Default template engine (support tsx and jsx files)
  templates: "./src/templates", // Path to templates directory
  options: {} // Engine-specific options (optional)
})

// Register third-party libraries for dependency injection
app.register(bcrypt, "bcrypt")
app.register(jwt, "jwt")

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.CLIENT_APP_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'app://.',
  ]
  const origin = req.headers.origin

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Headers')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  next()
})

// Enable scheduler (optional) - uncomment to activate scheduled jobs
// Jobs are auto-discovered from src/jobs directory
// Only schedules with enabled: true will run
app.enableScheduler({ timezone: "Europe/Paris" })

app.serveStatic("/assets", {
  root: "public/assets"
})


// Controllers are auto-discovered and registered from src/controller directory
// Repositories and Services are auto-injected via DIContainer
app.listen(port, () => {
  LyraConsole.info(
    `${params.api_name} v${params.api_version}`,
    `Server running at ${params.api_host}:${params.api_port}`
  )
})