import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777551344806
 * Generated at: 2026-04-30T12:15:44.806Z
 */
export class Migration_1777551344806 implements MigrationInterface {
  readonly version = "1777551344806"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` ADD COLUMN \`checked_in\` BOOL`)
    await connection.query(`ALTER TABLE \`booking\` ADD COLUMN \`checked_in_at\` TIMESTAMP`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` DROP COLUMN \`checked_in\``)
    await connection.query(`ALTER TABLE \`booking\` DROP COLUMN \`checked_in_at\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`booking\` ADD COLUMN \`checked_in\` BOOL",
      "ALTER TABLE \`booking\` ADD COLUMN \`checked_in_at\` TIMESTAMP"
    ]
  }
}
