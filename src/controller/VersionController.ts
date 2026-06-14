import { Controller, Get, Route } from "@lyra-js/core"

@Route({ path: "/version" })
export class VersionController extends Controller {
  @Get({ path: "" })
  async version() {
    this.res.status(200).json({
      version: process.env.npm_package_version,
      built_at: process.env.BUILD_DATE ?? "not set"
    })
  }
}