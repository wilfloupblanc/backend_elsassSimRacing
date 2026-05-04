import { Fixture } from "@lyra-js/core"

import { Simulator } from "@entity/Simulator"

export class SimRacingFixtures extends Fixture {

  private simulators = [
    { name: "Simulateur 1", is_active: true },
    { name: "Simulateur 2", is_active: true },
    { name: "Simulateur 3", is_active: true },
    { name: "Simulateur 4", is_active: true },
    { name: "Simulateur 5", is_active: true },
    { name: "Simulateur 6", is_active: true }
  ]

  async load() {
    await this.loadSimulators()
  }

  private async loadSimulators() {
    for (const s of this.simulators) {
      const simulator = new Simulator()
      simulator.name = s.name
      simulator.is_active = s.is_active
      await this.simulatorRepository.save(simulator)
    }
  }
}
