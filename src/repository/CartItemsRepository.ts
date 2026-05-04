import { Repository } from "@lyra-js/core"

import { CartItems } from "@entity/CartItems"

export class CartItemsRepository extends Repository<CartItems> {
  constructor() {
    super(CartItems)
  }
}
