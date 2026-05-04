import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777551439597
 * Generated at: 2026-04-30T12:17:19.597Z
 */
export class Migration_1777551439597 implements MigrationInterface {
  readonly version = "1777551439597"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`subscriptiontokens\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`valid_from\` DATE, \`valid_until\` DATE, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`subscriptiontokens\` ADD UNIQUE INDEX \`idx_subscriptiontokens_qr_token\` (\`qr_token\`)`)
    await connection.query(`ALTER TABLE \`subscriptiontokens\` ADD INDEX \`fk_subscriptiontokens_sub_id\` (\`sub_id\`)`)
    await connection.query(`ALTER TABLE \`subscriptiontokens\` ADD CONSTRAINT \`fk_subscriptiontokens_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`subscriptiontokens\` DROP FOREIGN KEY \`fk_subscriptiontokens_sub_id\``)
    await connection.query(`DROP TABLE IF EXISTS \`subscriptiontokens\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`subscriptiontokens\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`valid_from\` DATE, \`valid_until\` DATE, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "ALTER TABLE \`subscriptiontokens\` ADD UNIQUE INDEX \`idx_subscriptiontokens_qr_token\` (\`qr_token\`)",
      "ALTER TABLE \`subscriptiontokens\` ADD INDEX \`fk_subscriptiontokens_sub_id\` (\`sub_id\`)",
      "ALTER TABLE \`subscriptiontokens\` ADD CONSTRAINT \`fk_subscriptiontokens_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT"
    ]
  }
}
