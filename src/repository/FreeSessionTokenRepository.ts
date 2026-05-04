import { Repository } from "@lyra-js/core"

import { FreeSessionToken } from "@entity/FreeSessionToken"

export class FreeSessionTokenRepository extends Repository<FreeSessionToken> {
  constructor() {
    super(FreeSessionToken)
  }
}
