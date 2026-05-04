import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1776771905898
 * Generated at: 2026-04-21T11:45:05.898Z
 */
export class Migration_1776771905898 implements MigrationInterface {
  readonly version = "1776771905898"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`cartitemrecipient\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255), \`cart_item_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`cartitemrecipient\` ADD INDEX \`fk_cartitemrecipient_cart_item_id\` (\`cart_item_id\`)`)
    await connection.query(`ALTER TABLE \`cartitemrecipient\` ADD CONSTRAINT \`fk_cartitemrecipient_cart_item_id\` FOREIGN KEY (\`cart_item_id\`) REFERENCES \`cartitems\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`cartitemrecipient\` DROP FOREIGN KEY \`fk_cartitemrecipient_cart_item_id\``)
    await connection.query(`DROP TABLE IF EXISTS \`cartitemrecipient\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`cartitemrecipient\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255), \`cart_item_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "ALTER TABLE \`cartitemrecipient\` ADD INDEX \`fk_cartitemrecipient_cart_item_id\` (\`cart_item_id\`)",
      "ALTER TABLE \`cartitemrecipient\` ADD CONSTRAINT \`fk_cartitemrecipient_cart_item_id\` FOREIGN KEY (\`cart_item_id\`) REFERENCES \`cartitems\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE"
    ]
  }
}
