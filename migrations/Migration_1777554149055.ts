import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777554149055
 * Generated at: 2026-04-30T13:02:29.055Z
 */
export class Migration_1777554149055 implements MigrationInterface {
  readonly version = "1777554149055"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`freesessiontoken\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`is_used\` BOOL, \`used_at\` TIMESTAMP, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD UNIQUE INDEX \`idx_freesessiontoken_qr_token\` (\`qr_token\`)`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD INDEX \`fk_freesessiontoken_sub_id\` (\`sub_id\`)`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD CONSTRAINT \`fk_freesessiontoken_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`freesessiontoken\` DROP FOREIGN KEY \`fk_freesessiontoken_sub_id\``)
    await connection.query(`DROP TABLE IF EXISTS \`freesessiontoken\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`freesessiontoken\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`is_used\` BOOL, \`used_at\` TIMESTAMP, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "ALTER TABLE \`freesessiontoken\` ADD UNIQUE INDEX \`idx_freesessiontoken_qr_token\` (\`qr_token\`)",
      "ALTER TABLE \`freesessiontoken\` ADD INDEX \`fk_freesessiontoken_sub_id\` (\`sub_id\`)",
      "ALTER TABLE \`freesessiontoken\` ADD CONSTRAINT \`fk_freesessiontoken_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT"
    ]
  }
}
