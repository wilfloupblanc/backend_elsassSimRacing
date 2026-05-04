import { Controller, Get, NextFunction, Request, Response, Route } from "@lyra-js/core"

/**
 * Example controller using decorator-based routing
 * Decorators provide a modern, declarative way to define routes directly in your controller classes
 * Routes are automatically discovered and registered - no manual route file registration needed
 */
@Route({ path: "/example" })
export class ExampleController extends Controller {
  /**
   * SSR endpoint using decorator-based routing
   * The @Get decorator automatically registers this method as a GET route at /example/ssr
   * Uses this.render() (instance method) for server-side rendering
   */
  @Get({ path: "/ssr" })
  async exampleSsrRouteMethod(req: Request, res: Response, next: NextFunction) {
    try {
      await this.render("ExampleRender.tsx", {
        title: "Server-Side Rendering with Decorator-Based Routing",
        content:
          "This page is rendered using the modern decorator-based approach in LyraJS. The @Route and @Get decorators automatically register this endpoint without requiring manual route file configuration. The this.render() instance method handles server-side template rendering, generating complete HTML pages that are SEO-friendly and load faster for users. Decorators make your code cleaner, more maintainable, and self-documenting.",
        documentationUrl: "https://lyrajs.dev/"
      })
    } catch (error) {
      next(error)
    }
  }
}
