import { Repository } from "@lyra-js/core"

import { Simulator } from "@entity/Simulator"

export class SimulatorRepository extends Repository<Simulator> {
  constructor() {
    super(Simulator)
  }
}
