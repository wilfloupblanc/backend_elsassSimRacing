import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777283170273
 * Generated at: 2026-04-27T09:46:10.273Z
 */
export class Migration_1777283170273 implements MigrationInterface {
  readonly version = "1777283170273"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`subscription\` ADD COLUMN \`plan\` VARCHAR(10)`)
    await connection.query(`ALTER TABLE \`subscription\` ADD COLUMN \`price\` FLOAT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`subscription\` DROP COLUMN \`plan\``)
    await connection.query(`ALTER TABLE \`subscription\` DROP COLUMN \`price\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`subscription\` ADD COLUMN \`plan\` VARCHAR(10)",
      "ALTER TABLE \`subscription\` ADD COLUMN \`price\` FLOAT"
    ]
  }
}
