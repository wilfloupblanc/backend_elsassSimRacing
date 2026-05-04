import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777368528582
 * Generated at: 2026-04-28T09:28:48.582Z
 */
export class Migration_1777368528582 implements MigrationInterface {
  readonly version = "1777368528582"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` ADD COLUMN \`access\` VARCHAR(50)`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` DROP COLUMN \`access\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`event\` ADD COLUMN \`access\` VARCHAR(50)"
    ]
  }
}
