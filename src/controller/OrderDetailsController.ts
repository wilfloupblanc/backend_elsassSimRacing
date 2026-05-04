import { Controller, Delete, Get, Post, Put, Route } from "@lyra-js/core"

import { OrderDetails } from "@entity/OrderDetails"

@Route({ path: "/orderDetails" })
export class OrderDetailsController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const orderdetailses = await this.orderdetailsRepository.findAll()
      this.res.status(200).json({ message: "OrderDetails list fetched successfully", orderdetailses })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:orderdetails", resolve: { orderdetails: OrderDetails } })
  async read(orderdetails: OrderDetails) {
    try {
      if (!orderdetails) return this.res.status(404).json({ message: "OrderDetails not found" })
      this.res.status(200).json({ message: "OrderDetails fetched successfully", orderdetails })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const orderdetails = await this.orderdetailsRepository.save(data)
      this.res.status(201).json({ message: "OrderDetails created successfully", orderdetails })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:orderdetails", resolve: { orderdetails: OrderDetails } })
  async update(orderdetails: OrderDetails) {
    try {
      const data = this.req.body
      Object.assign(orderdetails, data)
      const updatedOrderDetails = await this.orderdetailsRepository.save(orderdetails)
      this.res.status(200).json({ message: "OrderDetails updated successfully", updatedOrderDetails })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:orderdetails", resolve: { orderdetails: OrderDetails } })
  async delete(orderdetails: OrderDetails) {
    try {
      if (!orderdetails?.id) {
        return this.res.status(400).json({ message: "Invalid OrderDetails id" })
      }
      await this.orderdetailsRepository.delete(orderdetails.id)
      this.res.status(200).json({ message: "OrderDetails deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
