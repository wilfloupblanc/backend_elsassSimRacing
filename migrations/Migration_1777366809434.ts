import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777366809434
 * Generated at: 2026-04-28T09:00:09.434Z
 */
export class Migration_1777366809434 implements MigrationInterface {
  readonly version = "1777366809434"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` ADD COLUMN \`price\` FLOAT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` DROP COLUMN \`price\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`event\` ADD COLUMN \`price\` FLOAT"
    ]
  }
}
