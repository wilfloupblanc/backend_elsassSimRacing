import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777552088114
 * Generated at: 2026-04-30T12:28:08.114Z
 */
export class Migration_1777552088114 implements MigrationInterface {
  readonly version = "1777552088114"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`subscriptiontokens\` DROP INDEX \`qr_token\``)
  }

  async down(connection: any): Promise<void> {
    // No changes
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
    ]
  }
}
