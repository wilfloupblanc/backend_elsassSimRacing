import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1776768725286
 * Generated at: 2026-04-21T10:52:05.286Z
 */
export class Migration_1776768725286 implements MigrationInterface {
  readonly version = "1776768725286"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` ADD COLUMN \`pilots\` INT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` DROP COLUMN \`pilots\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`booking\` ADD COLUMN \`pilots\` INT"
    ]
  }
}
