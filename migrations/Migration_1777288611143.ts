import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777288611143
 * Generated at: 2026-04-27T11:16:51.143Z
 */
export class Migration_1777288611143 implements MigrationInterface {
  readonly version = "1777288611143"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`plan\` (\`id\` BIGINT AUTO_INCREMENT, \`plan\` VARCHAR(10) UNIQUE, \`price\` FLOAT, \`stripe_price_id\` VARCHAR(255), PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`plan\` ADD UNIQUE INDEX \`idx_plan_plan\` (\`plan\`)`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`DROP TABLE IF EXISTS \`plan\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`plan\` (\`id\` BIGINT AUTO_INCREMENT, \`plan\` VARCHAR(10) UNIQUE, \`price\` FLOAT, \`stripe_price_id\` VARCHAR(255), PRIMARY KEY (\`id\`))",
      "ALTER TABLE \`plan\` ADD UNIQUE INDEX \`idx_plan_plan\` (\`plan\`)"
    ]
  }
}
