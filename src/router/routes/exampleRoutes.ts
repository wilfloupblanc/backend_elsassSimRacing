import { ExampleStaticController as ExampleController } from "@controller/ExampleStaticController"
import { createRouter } from "@lyra-js/core"

export const exampleRoutes = createRouter()

exampleRoutes.get("/item", ExampleController.exampleRouteMethod)
exampleRoutes.get("/ssr-static", ExampleController.exampleSsrRouteMethod)
