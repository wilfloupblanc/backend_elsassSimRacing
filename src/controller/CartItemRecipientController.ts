import { Controller, Delete, Get, Post, Put, QueryBuilder, Route } from "@lyra-js/core"
import { CartItemRecipient } from "@entity/CartItemRecipient"

@Route({ path: "/cartItemRecipient" })
export class CartItemRecipientController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const cartItemRecipients = await this.cartItemRecipientRepository.findAll()
      this.res.status(200).json({ message: "CartItemRecipient list fetched successfully", cartItemRecipients })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/by-cart-item/:cartItemId" })
  async listByCartItem() {
    try {
      const cartItemId = parseInt(this.req.params.cartItemId)
      const query = new QueryBuilder()
        .selectFrom("cartitemrecipient", ["*"])
        .where("cart_item_id", "=", cartItemId)
      const [recipients] = await query.execute()
      this.res.status(200).json({ message: "Recipients fetched successfully", recipients })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:cartitemrecipient", resolve: { cartitemrecipient: CartItemRecipient } })
  async read(cartitemrecipient: CartItemRecipient) {
    try {
      if (!cartitemrecipient) return this.res.status(404).json({ message: "CartItemRecipient not found" })
      this.res.status(200).json({ message: "CartItemRecipient fetched successfully", cartitemrecipient })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const cartItemRecipient = await this.cartItemRecipientRepository.save(data)
      this.res.status(201).json({ message: "CartItemRecipient created successfully", cartItemRecipient })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:cartitemrecipient", resolve: { cartitemrecipient: CartItemRecipient } })
  async update(cartitemrecipient: CartItemRecipient) {
    try {
      const data = this.req.body
      Object.assign(cartitemrecipient, data)
      const updatedCartItemRecipient = await this.cartItemRecipientRepository.save(cartitemrecipient)
      this.res.status(200).json({ message: "CartItemRecipient updated successfully", updatedCartItemRecipient })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:cartitemrecipient", resolve: { cartitemrecipient: CartItemRecipient } })
  async delete(cartitemrecipient: CartItemRecipient) {
    try {
      if (!cartitemrecipient?.id) {
        return this.res.status(400).json({ message: "Invalid CartItemRecipient id" })
      }
      await this.cartItemRecipientRepository.delete(cartitemrecipient.id)
      this.res.status(200).json({ message: "CartItemRecipient deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}