import { Controller, Get, Route } from "@lyra-js/core"

@Route({ path: "/plan" })
export class PlanController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const plans = await this.planRepository.findAll()
      this.res.status(200).json({ message: "Plans fetched successfully", plans })
    } catch (error) {
      this.next(error)
    }
  }
}