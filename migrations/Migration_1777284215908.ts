import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1777284215908
 * Generated at: 2026-04-27T10:03:35.908Z
 */
export class Migration_1777284215908 implements MigrationInterface {
  readonly version = "1777284215908"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    // No changes
  }

  async down(connection: any): Promise<void> {
    // No changes
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
    ]
  }
}
