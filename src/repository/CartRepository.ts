import { QueryBuilder, Repository } from "@lyra-js/core"

import { Cart } from "@entity/Cart"

export interface CartInterface {
  id: number
  price: number
  quantity: number
  duration_minutes: number
  price_normal: number
  price_member: number
}

export class CartRepository extends Repository<Cart> {
  constructor() {
    super(Cart)
  }

  async findUserCartItems(cartId: number | string) {
    const query = new QueryBuilder()
      .selectFrom("session", [
        "session.id",
        "session.duration_minutes",
        "session.price_normal",
        "session.price_member",
        "cartitems.quantity",
        "cartitems.id",
        "cartitems.session_id"
      ])
      .join("cartitems", "cartitems.session_id = session.id")
      .where("cartitems.cart_id", "=", cartId)

    const [rows] = await query.execute()

    return rows
  }
}
