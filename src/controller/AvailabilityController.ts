import { Controller, Delete, Get, Post, Put, QueryBuilder, Route } from "@lyra-js/core"

import { Availability } from "@entity/Availability"

@Route({ path: "/availability" })
export class AvailabilityController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const availabilities = await this.availabilityRepository.findAll()
      this.res.status(200).json({ message: "Availability list fetched successfully", availabilities })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/month" })
  async getByMonth() {
    try {
      const month = this.req.query.month as string
      if (!month || !/^\d{4}-\d{2}$/.test(month)){
        return this.res.status(400).json({ message: "Invalid month" })
      }
      const query = new QueryBuilder()
        .raw("SELECT id, date, start_time, slots_remaining, slots_total, is_open FROM availability WHERE DATE_FORMAT(date, '%Y-%m') = ? ORDER BY date, start_time", [month])
      const [availabilities] = await query.execute()
      this.res.status(200).json({message: "Availability fethed successfully", availabilities})
    } catch(error) {
      this.next(error)
    }
  }

  @Get({ path: "/week" })
  async getByWeek() {
    try {
      const start = this.req.query.start as string
      if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
        return this.res.status(400).json({ message: "Invalid start date" })
      }
      const query = new QueryBuilder()
        .raw(
          "SELECT id, date, start_time, slots_remaining, slots_total, is_open FROM availability WHERE date >= ? AND date < DATE_ADD(?, INTERVAL 7 DAY) ORDER BY date, start_time",
          [start, start]
        )
      const [availabilities] = await query.execute()
      this.res.status(200).json({ message: "Availability fetched successfully", availabilities })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:availability", resolve: { availability: Availability } })
  async read(availability: Availability) {
    try {
      if (!availability) return this.res.status(404).json({ message: "Availability not found" })
      this.res.status(200).json({ message: "Availability fetched successfully", availability })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const availability = await this.availabilityRepository.save(data)
      this.res.status(201).json({ message: "Availability created successfully", availability })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:availability", resolve: { availability: Availability } })
  async update(availability: Availability) {
    try {
      const data = this.req.body
      Object.assign(availability, data)
      const updatedAvailability = await this.availabilityRepository.save(availability)
      this.res.status(200).json({ message: "Availability updated successfully", updatedAvailability })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:availability", resolve: { availability: Availability } })
  async delete(availability: Availability) {
    try {
      if (!availability?.id) {
        return this.res.status(400).json({ message: "Invalid Availability id" })
      }
      await this.availabilityRepository.delete(availability.id)
      this.res.status(200).json({ message: "Availability deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
