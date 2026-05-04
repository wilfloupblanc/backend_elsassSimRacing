import { Controller, Delete, Get, Post, Put, Route } from "@lyra-js/core"

import { Simulator } from "@entity/Simulator"

@Route({ path: "/simulator" })
export class SimulatorController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const simulators = await this.simulatorRepository.findAll()
      this.res.status(200).json({ message: "Simulator list fetched successfully", simulators })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:simulator", resolve: { simulator: Simulator } })
  async read(simulator: Simulator) {
    try {
      if (!simulator) return this.res.status(404).json({ message: "Simulator not found" })
      this.res.status(200).json({ message: "Simulator fetched successfully", simulator })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const simulator = await this.simulatorRepository.save(data)
      this.res.status(201).json({ message: "Simulator created successfully", simulator })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:simulator", resolve: { simulator: Simulator } })
  async update(simulator: Simulator) {
    try {
      const data = this.req.body
      Object.assign(simulator, data)
      const updatedSimulator = await this.simulatorRepository.save(simulator)
      this.res.status(200).json({ message: "Simulator updated successfully", updatedSimulator })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:simulator", resolve: { simulator: Simulator } })
  async delete(simulator: Simulator) {
    try {
      if (!simulator?.id) {
        return this.res.status(400).json({ message: "Invalid Simulator id" })
      }
      await this.simulatorRepository.delete(simulator.id)
      this.res.status(200).json({ message: "Simulator deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
