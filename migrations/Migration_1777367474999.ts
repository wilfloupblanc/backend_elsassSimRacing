import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777367474999
 * Generated at: 2026-04-28T09:11:14.999Z
 */
export class Migration_1777367474999 implements MigrationInterface {
  readonly version = "1777367474999"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` ADD COLUMN \`vehicle_categories\` TEXT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` DROP COLUMN \`vehicle_categories\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`event\` ADD COLUMN \`vehicle_categories\` TEXT"
    ]
  }
}
