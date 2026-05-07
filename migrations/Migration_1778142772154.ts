import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1778142772154
 * Generated at: 2026-05-07T08:32:52.154Z
 */
export class Migration_1778142772154 implements MigrationInterface {
  readonly version = "1778142772154"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`setting\` (\`id\` BIGINT AUTO_INCREMENT, \`key\` VARCHAR(100), \`value\` VARCHAR(255), PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` DROP INDEX \`qr_token\``)
    await connection.query(`ALTER TABLE \`giftvoucher\` DROP INDEX \`qr_code\``)
    await connection.query(`ALTER TABLE \`plan\` DROP INDEX \`plan\``)
    await connection.query(`ALTER TABLE \`subscription\` DROP INDEX \`stripe_subscription_id\``)
    await connection.query(`ALTER TABLE \`user\` DROP INDEX \`email\``)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`DROP TABLE IF EXISTS \`setting\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`setting\` (\`id\` BIGINT AUTO_INCREMENT, \`key\` VARCHAR(100), \`value\` VARCHAR(255), PRIMARY KEY (\`id\`))"
    ]
  }
}
