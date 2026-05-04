import { Repository } from "@lyra-js/core"

import { CartItemRecipient } from "@entity/CartItemRecipient"

export class CartItemRecipientRepository extends Repository<CartItemRecipient> {
  constructor() {
    super(CartItemRecipient)
  }
}
