import { Repository } from "@lyra-js/core"

import { GiftVoucher } from "@entity/GiftVoucher"

export class GiftVoucherRepository extends Repository<GiftVoucher> {
  constructor() {
    super(GiftVoucher)
  }
}
