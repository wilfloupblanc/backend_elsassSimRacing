import { Fixture } from "@lyra-js/core"

import { ScheduleOverride } from "@entity/ScheduleOverride"

export class ScheduleOverrideFixtures extends Fixture {
  private overrides = [
    { date: new Date('2026-01-01'), description: "Jour de l'an", is_open: false },
    { date: new Date('2026-04-03'), description: "Vendredi Saint", is_open: false },
    { date: new Date('2026-04-06'), description: "Lundi de Pâques", is_open: false },
    { date: new Date('2026-05-01'), description: "Fête du Travail", is_open: false },
    { date: new Date('2026-05-08'), description: "Victoire 1945", is_open: false },
    { date: new Date('2026-05-14'), description: "Ascension", is_open: false },
    { date: new Date('2026-05-25'), description: "Lundi de Pentecôte", is_open: false },
    { date: new Date('2026-07-14'), description: "Fête Nationale", is_open: false },
    { date: new Date('2026-08-15'), description: "Assomption", is_open: false },
    { date: new Date('2026-11-01'), description: "Toussaint", is_open: false },
    { date: new Date('2026-11-11'), description: "Armistice", is_open: false },
    { date: new Date('2026-12-25'), description: "Noël", is_open: false },
    { date: new Date('2026-12-26'), description: "Saint-Étienne", is_open: false },
    { date: new Date('2027-01-01'), description: "Jour de l'an", is_open: false },
    { date: new Date('2027-03-26'), description: "Vendredi Saint", is_open: false },
    { date: new Date('2027-03-29'), description: "Lundi de Pâques", is_open: false },
    { date: new Date('2027-05-01'), description: "Fête du Travail", is_open: false },
    { date: new Date('2027-05-06'), description: "Ascension", is_open: false },
    { date: new Date('2027-05-08'), description: "Victoire 1945", is_open: false },
    { date: new Date('2027-05-17'), description: "Lundi de Pentecôte", is_open: false },
    { date: new Date('2027-07-14'), description: "Fête Nationale", is_open: false },
    { date: new Date('2027-08-15'), description: "Assomption", is_open: false },
    { date: new Date('2027-11-01'), description: "Toussaint", is_open: false },
    { date: new Date('2027-11-11'), description: "Armistice", is_open: false },
    { date: new Date('2027-12-25'), description: "Noël", is_open: false },
    { date: new Date('2027-12-26'), description: "Saint-Étienne", is_open: false },
  ]

  async load() {
    await this.loadScheduleOverrides()
  }

  private async loadScheduleOverrides() {
    for (const o of this.overrides) {
      const override = new ScheduleOverride()
      override.date = o.date
      override.description = o.description
      override.is_open = o.is_open
      await this.scheduleOverrideRepository.save(override)
    }
  }
}