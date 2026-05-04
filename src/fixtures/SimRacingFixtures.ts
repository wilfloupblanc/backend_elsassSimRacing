import { Fixture } from "@lyra-js/core"

import { Session } from "@entity/Session"
import { Simulator } from "@entity/Simulator"

export class SimRacingFixtures extends Fixture {

  private sessions = [
    { duration_minutes: 15, price_normal: 13.9, price_member: 11.9, is_active: true },
    { duration_minutes: 30, price_normal: 25.9, price_member: 21.9, is_active: true },
    { duration_minutes: 45, price_normal: 32.9, price_member: 27.9, is_active: true },
    { duration_minutes: 60, price_normal: 39.9, price_member: 33.9, is_active: true }
  ]

  private simulators = [
    { name: "Simulateur 1", is_active: true },
    { name: "Simulateur 2", is_active: true },
    { name: "Simulateur 3", is_active: true },
    { name: "Simulateur 4", is_active: true },
    { name: "Simulateur 5", is_active: true },
    { name: "Simulateur 6", is_active: true }
  ]

  async load() {
    await this.loadSessions()
    await this.loadSimulators()
  }

  private async loadSessions() {
    for (const s of this.sessions) {
      const session = new Session()
      session.duration_minutes = s.duration_minutes
      session.price_normal = s.price_normal
      session.price_member = s.price_member
      session.is_active = s.is_active
      await this.sessionRepository.save(session)
    }
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
