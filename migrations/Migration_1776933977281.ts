import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1776933977281
 * Generated at: 2026-04-23T08:46:17.281Z
 */
export class Migration_1776933977281 implements MigrationInterface {
  readonly version = "1776933977281"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD COLUMN \`expires_at\` TIMESTAMP`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`giftvoucher\` DROP COLUMN \`expires_at\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`giftvoucher\` ADD COLUMN \`expires_at\` TIMESTAMP"
    ]
  }
}
