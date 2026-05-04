import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777887895803
 * Generated at: 2026-05-04T09:44:55.803Z
 */
export class Migration_1777887895803 implements MigrationInterface {
  readonly version = "1777887895803"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`name\` VARCHAR(100)`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`level\` VARCHAR(50)`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`image\` VARCHAR(255)`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`min_age\` TINYINT`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`min_height\` VARCHAR(20)`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`min_pilots\` TINYINT`)
    await connection.query(`ALTER TABLE \`session\` ADD COLUMN \`max_pilots\` TINYINT`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` DROP INDEX \`qr_token\``)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`name\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`level\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`image\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_age\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_height\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_pilots\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`max_pilots\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "ALTER TABLE \`session\` ADD COLUMN \`name\` VARCHAR(100)",
      "ALTER TABLE \`session\` ADD COLUMN \`level\` VARCHAR(50)",
      "ALTER TABLE \`session\` ADD COLUMN \`image\` VARCHAR(255)",
      "ALTER TABLE \`session\` ADD COLUMN \`min_age\` TINYINT",
      "ALTER TABLE \`session\` ADD COLUMN \`min_height\` VARCHAR(20)",
      "ALTER TABLE \`session\` ADD COLUMN \`min_pilots\` TINYINT",
      "ALTER TABLE \`session\` ADD COLUMN \`max_pilots\` TINYINT"
    ]
  }
}
