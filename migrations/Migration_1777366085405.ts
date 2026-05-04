import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777366085405
 * Generated at: 2026-04-28T08:48:05.405Z
 */
export class Migration_1777366085405 implements MigrationInterface {
  readonly version = "1777366085405"
  readonly isDestructive = true
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`event\` (\`id\` BIGINT AUTO_INCREMENT, \`title\` VARCHAR(255), \`description\` TEXT, \`date\` DATE, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`simulators_count\` TINYINT, \`pilots_per_simulator\` TINYINT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`name\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`level\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_age\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_height\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`min_pilots\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`max_pilots\``)
    await connection.query(`ALTER TABLE \`session\` DROP COLUMN \`image\``)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`DROP TABLE IF EXISTS \`event\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`event\` (\`id\` BIGINT AUTO_INCREMENT, \`title\` VARCHAR(255), \`description\` TEXT, \`date\` DATE, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`simulators_count\` TINYINT, \`pilots_per_simulator\` TINYINT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))"
    ]
  }
}
