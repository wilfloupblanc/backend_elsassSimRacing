import { Repository } from "@lyra-js/core"

import { Session } from "@entity/Session"

export class SessionRepository extends Repository<Session> {
  constructor() {
    super(Session)
  }
}
