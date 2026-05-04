import { createRouter } from "@lyra-js/core"

import { exampleRoutes } from "./exampleRoutes"

export const routes = createRouter()

routes.use("/example", exampleRoutes)
