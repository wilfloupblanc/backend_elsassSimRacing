import { Controller, Delete, Get, isAdmin, isAuthenticated, Post, Route } from "@lyra-js/core"

@Route({ path: "/discount-code" })
export class DiscountCodeController extends Controller {
  @Get({ path: "/", middlewares: [isAuthenticated, isAdmin] })
  async list() {
    try {
      const codes = await this.discountCodeRepository.findAll()
      this.res.status(200).json({ message: "Discount codes fetched successfully", codes })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/", middlewares: [isAuthenticated, isAdmin] })
  async create() {
    try {
      const { code, type, value, applies_to, expires_at, max_uses } = this.req.body

      if (!code || !type || !value || !applies_to) {
        return this.badRequest("Missing required fields")
      }

      if (!["percent", "fixed"].includes(type)) {
        return this.badRequest("Invalid type")
      }

      if (!["session", "gift_voucher", "both"].includes(applies_to)) {
        return this.badRequest("Invalid applies_to")
      }

      if (type === "percent" && (value <= 0 || value > 100)) {
        return this.badRequest("Percent value must be between 1 and 100")
      }

      const existing = await this.discountCodeRepository.findOneBy({ code: code.toUpperCase() })
      if (existing) return this.badRequest("Code already exists")

      await this.discountCodeRepository.save({
        code: code.toUpperCase(),
        type,
        value,
        applies_to,
        expires_at: expires_at ?? null,
        max_uses: max_uses ?? null,
        uses_count: 0,
        is_active: 1,
        created_at: new Date()
      })

      this.res.status(201).json({ message: "Discount code created successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/validate", middlewares: [isAuthenticated] })
  async validate() {
    try {
      const { code, applies_to } = this.req.body

      if (!code) return this.badRequest("Missing code")

      const discount = await this.discountCodeRepository.findOneBy({ code: code.toUpperCase() })

      if (!discount || !discount.is_active) {
        return this.res.status(404).json({ error: "Code invalide ou inactif." })
      }

      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        return this.res.status(400).json({ error: "Ce code a expiré." })
      }

      if (discount.max_uses !== null && discount.uses_count >= discount.max_uses) {
        return this.res.status(400).json({ error: "Ce code a atteint sa limite d'utilisation." })
      }

      if (discount.applies_to !== "both" && discount.applies_to !== applies_to) {
        return this.res.status(400).json({ error: "Ce code n'est pas applicable ici." })
      }

      this.res.status(200).json({
        message: "Code valide",
        discount: {
          code: discount.code,
          type: discount.type,
          value: discount.value,
          applies_to: discount.applies_to
        }
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:id", middlewares: [isAuthenticated, isAdmin] })
  async remove() {
    try {
      const { id } = this.req.params
      const discount = await this.discountCodeRepository.find(Number(id))
      if (!discount) return this.res.status(404).json({ message: "Discount code not found" })
      await this.discountCodeRepository.delete(Number(id))
      this.res.status(200).json({ message: "Discount code deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
