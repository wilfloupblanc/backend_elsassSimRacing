import { Controller, Delete, isAuthenticated, Patch, Post, Route } from "@lyra-js/core"

@Route({ path: "/cartItems", middlewares: [isAuthenticated] })
export class CartItemsController extends Controller {
  @Post({ path: "/" })
  async create() {
    try {
      const { session_id, quantity } = this.req.body
      let cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      if (!cart) {
        cart = await this.cartRepository.save({ user_id: this.req.user.id })
      }
      const cartitems = await this.cartItemsRepository.findOneBy({ session_id, cart_id: cart.id })
      if (cartitems !== null) {
        cartitems.quantity += 1
        const updatedCartItems = await this.cartItemsRepository.save(cartitems)
        return this.res.status(200).json({ message: "CartItems updated successfully", updatedCartItems })
      } else {
        const newCartItems = await this.cartItemsRepository.save({ session_id, cart_id: cart.id, quantity })
        return this.res.status(201).json({ message: "CartItems created successfully", newCartItems })
      }
      this.res.status(201).json({ message: "CartItems created successfully", cartitems })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/:cartitems" })
  async update() {
    try {
      const data = this.req.body
      const cartItems = await this.cartItemsRepository.findOneBy({ id: this.req.params.cartitems })
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      if (!cartItems?.id) {
        return this.res.status(400).json({ message: "Invalid CartItems id" })
      }
      if (cartItems.cart_id !== cart.id) {
        return this.res.status(403).json({ message: "Cart not found" })
      }
      Object.assign(cartItems, data)
      const updatedCartItems = await this.cartItemsRepository.save(cartItems)
      this.res.status(200).json({ message: "CartItems updated successfully", updatedCartItems })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:cartitems" })
  async delete() {
    try {
      const cartItems = await this.cartItemsRepository.find(parseInt(this.req.params.cartitems))
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      if (!cartItems?.id) {
        return this.res.status(400).json({ message: "Invalid CartItems id" })
      }
      if (cartItems.cart_id !== cart.id) {
        return this.res.status(403).json({ message: "Cart not found" })
      }
      await this.cartItemsRepository.delete(cartItems.id)
      this.res.status(200).json({ message: "CartItems deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
