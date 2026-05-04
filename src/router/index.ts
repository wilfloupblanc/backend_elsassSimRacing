import { createRouter } from "@lyra-js/core"

import { routes } from "@router/routes"

export const router = createRouter()

router.use(routes)
