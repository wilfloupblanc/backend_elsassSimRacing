import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777026441465
 * Generated at: 2026-04-24T10:27:21.465Z
 */
export class Migration_1777026441465 implements MigrationInterface {
  readonly version = "1777026441465"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`payments\` ADD COLUMN \`created_at\` TIMESTAMP`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`payments\` DROP COLUMN \`created_at\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`payments\` ADD COLUMN \`created_at\` TIMESTAMP"
    ]
  }
}
