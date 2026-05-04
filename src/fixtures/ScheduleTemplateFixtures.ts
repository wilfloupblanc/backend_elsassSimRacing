import { Fixture } from "@lyra-js/core"
import { ScheduleTemplate } from "@entity/ScheduleTemplate"

export class ScheduleTemplateFixtures extends Fixture {
  private days = [
    {day_of_week: 1, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
    {day_of_week: 2, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
    {day_of_week: 3, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
    {day_of_week: 4, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
    {day_of_week: 5, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
    {day_of_week: 6, open_time: new Date('1970-01-01T10:00:00'), close_time: new Date('1970-01-01T22:30:00'), is_open: true},
    {day_of_week: 0, open_time: new Date('1970-01-01T14:00:00'), close_time: new Date('1970-01-01T20:30:00'), is_open: true},
  ]

  async load() {
    await this.loadScheduleTemplates()
  }

  private async loadScheduleTemplates() {
    for (const d of this.days) {
      const schedule = new ScheduleTemplate()
      schedule.day_of_week = d.day_of_week
      schedule.open_time = d.open_time
      schedule.close_time = d.close_time
      schedule.is_open = d.is_open
      await this.scheduleTemplateRepository.save(schedule)
    }
  }
}
