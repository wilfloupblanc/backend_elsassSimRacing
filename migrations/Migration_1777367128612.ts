import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777367128612
 * Generated at: 2026-04-28T09:05:28.612Z
 */
export class Migration_1777367128612 implements MigrationInterface {
  readonly version = "1777367128612"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` ADD COLUMN \`vehicles\` TEXT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`event\` DROP COLUMN \`vehicles\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`event\` ADD COLUMN \`vehicles\` TEXT"
    ]
  }
}
