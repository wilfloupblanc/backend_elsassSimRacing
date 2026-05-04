import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1776775040087
 * Generated at: 2026-04-21T12:37:20.087Z
 */
export class Migration_1776775040087 implements MigrationInterface {
  readonly version = "1776775040087"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`orderdetails\` ADD COLUMN \`gift_voucher_id\` BIGINT`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_gift_voucher_id\` (\`gift_voucher_id\`)`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`orderdetails\` DROP FOREIGN KEY \`fk_orderdetails_gift_voucher_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP INDEX \`fk_orderdetails_gift_voucher_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP COLUMN \`gift_voucher_id\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`orderdetails\` ADD COLUMN \`gift_voucher_id\` BIGINT",
      "ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_gift_voucher_id\` (\`gift_voucher_id\`)",
      "ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT"
    ]
  }
}
