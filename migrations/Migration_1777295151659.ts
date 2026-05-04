import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777295151659
 * Generated at: 2026-04-27T13:05:51.659Z
 */
export class Migration_1777295151659 implements MigrationInterface {
  readonly version = "1777295151659"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`tagline\` TEXT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`tagline\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`session\` ADD COLUMN \`tagline\` TEXT"
    ]
  }
}
