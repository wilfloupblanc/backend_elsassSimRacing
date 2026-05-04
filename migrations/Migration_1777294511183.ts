import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777294511183
 * Generated at: 2026-04-27T12:55:11.183Z
 */
export class Migration_1777294511183 implements MigrationInterface {
  readonly version = "1777294511183"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`intro\` TEXT`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`details\` TEXT`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`total_duration\` VARCHAR(50)`)
    await connection.query(`ALTER TABLE \`plan\` DROP INDEX \`plan\``)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`intro\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`details\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`total_duration\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`session\` ADD COLUMN \`intro\` TEXT",
      "ALTER TABLE \`session\` ADD COLUMN \`details\` TEXT",
      "ALTER TABLE \`session\` ADD COLUMN \`total_duration\` VARCHAR(50)"
    ]
  }
}
