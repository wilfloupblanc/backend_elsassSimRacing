import { Controller, Delete, Get, Post, Put, Route } from "@lyra-js/core"

import { Payments } from "@entity/Payments"

@Route({ path: "/payments" })
export class PaymentsController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const payments = await this.paymentsRepository.findAll()
      this.res.status(200).json({ message: "Payments list fetched successfully", payments })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:payments", resolve: { payments: Payments } })
  async read(payments: Payments) {
    try {
      if (!payments) return this.res.status(404).json({ message: "Payments not found" })
      this.res.status(200).json({ message: "Payments fetched successfully", payments })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const payments = await this.paymentsRepository.save(data)
      this.res.status(201).json({ message: "Payments created successfully", payments })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:payments", resolve: { payments: Payments } })
  async update(payments: Payments) {
    try {
      const data = this.req.body
      Object.assign(payments, data)
      const updatedPayments = await this.paymentsRepository.save(payments)
      this.res.status(200).json({ message: "Payments updated successfully", updatedPayments })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:payments", resolve: { payments: Payments } })
  async delete(payments: Payments) {
    try {
      if (!payments?.id) {
        return this.res.status(400).json({ message: "Invalid Payments id" })
      }
      await this.paymentsRepository.delete(payments.id)
      this.res.status(200).json({ message: "Payments deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
