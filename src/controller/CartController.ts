import { Controller, Delete, Get, isAuthenticated, Route } from "@lyra-js/core"

@Route({ path: "/cart", middlewares: [isAuthenticated] })
export class CartController extends Controller {
  @Get({ path: "/" })
  async read() {
    try {
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      if (!cart || cart.length === 0) return this.res.status(404).json({ message: "Cart not found" })

      const items = await this.cartRepository.findUserCartItems(cart.id)

      this.res.status(200).json({ message: "Cart fetched successfully", items })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/" })
  async delete() {
    try {
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      if (!cart?.id) {
        return this.res.status(400).json({ message: "Invalid Cart id" })
      }

      await this.cartRepository.delete(cart.id)
      this.res.status(200).json({ message: "Cart deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
