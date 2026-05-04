import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777373627971
 * Generated at: 2026-04-28T10:53:47.971Z
 */
export class Migration_1777373627971 implements MigrationInterface {
  readonly version = "1777373627971"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` ADD COLUMN \`event_id\` BIGINT`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_event_id\` (\`event_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_event_id\` FOREIGN KEY (\`event_id\`) REFERENCES \`event\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_event_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP INDEX \`fk_booking_event_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP COLUMN \`event_id\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`booking\` ADD COLUMN \`event_id\` BIGINT",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_event_id\` (\`event_id\`)",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_event_id\` FOREIGN KEY (\`event_id\`) REFERENCES \`event\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT"
    ]
  }
}
