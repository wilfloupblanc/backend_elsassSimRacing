import { Repository } from "@lyra-js/core"

import { User } from "@entity/User"

export class UserRepository extends Repository<User> {
  constructor() {
    super(User)
  }
}
