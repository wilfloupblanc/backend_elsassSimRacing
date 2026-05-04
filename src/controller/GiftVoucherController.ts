import { Controller, Delete, Get, isAuthenticated, Post, Put, Route } from "@lyra-js/core"

import { GiftVoucher } from "@entity/GiftVoucher"

@Route({ path: "/giftVoucher" })
export class GiftVoucherController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const giftvouchers = await this.giftVoucherRepository.findAll()
      this.res.status(200).json({ message: "GiftVoucher list fetched successfully", giftvouchers })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/free-session-member", middlewares: [isAuthenticated] })
  async getFreeSession() {
    try {
      const subscription = await this.subscriptionRepository.findOneBy({
        user_id: this.req.user.id,
        status: "active"
      })

      if (!subscription) return this.res.status(404).json({ message: "No active subscription" })
      if (subscription.free_sessions_remaining <= 0) return this.res.status(404).json({ message: "No free sessions remaining" })

      this.res.status(200).json({
        message: "Free session available",
        freeSessionsRemaining: subscription.free_sessions_remaining,
        plan: subscription.plan
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:giftvoucher", resolve: { giftvoucher: GiftVoucher } })
  async read(giftvoucher: GiftVoucher) {
    try {
      if (!giftvoucher) return this.res.status(404).json({ message: "GiftVoucher not found" })
      this.res.status(200).json({ message: "GiftVoucher fetched successfully", giftvoucher })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const giftvoucher = await this.giftVoucherRepository.save(data)
      this.res.status(201).json({ message: "GiftVoucher created successfully", giftvoucher })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:giftvoucher", resolve: { giftvoucher: GiftVoucher } })
  async update(giftvoucher: GiftVoucher) {
    try {
      const data = this.req.body
      Object.assign(giftvoucher, data)
      const updatedGiftVoucher = await this.giftVoucherRepository.save(giftvoucher)
      this.res.status(200).json({ message: "GiftVoucher updated successfully", updatedGiftVoucher })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:giftvoucher", resolve: { giftvoucher: GiftVoucher } })
  async delete(giftvoucher: GiftVoucher) {
    try {
      if (!giftvoucher?.id) {
        return this.res.status(400).json({ message: "Invalid GiftVoucher id" })
      }
      await this.giftvoucherRepository.delete(giftvoucher.id)
      this.res.status(200).json({ message: "GiftVoucher deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
