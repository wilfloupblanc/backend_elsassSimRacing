# Database Migrations

This directory contains database migration files that track and version your database schema changes.

## Purpose

The `migrations/` folder stores TypeScript migration files that define how your database schema evolves over time. Each migration represents a specific change to your database structure.

## What Are Migrations?

Migrations are version control for your database. They allow you to:

- **Track schema changes**: Every database modification is recorded
- **Collaborate safely**: Team members can sync database changes through version control
- **Rollback changes**: Undo migrations if something goes wrong
- **Deploy consistently**: Apply the same schema changes across environments

## Migration File Structure

Migration files follow this naming convention:

```
Migration_<timestamp>.ts
```

Example: `Migration_1767607917120.ts`

Each migration file implements the `MigrationInterface` with three methods:

```typescript
import { MigrationInterface } from "@lyra-js/core"

export class Migration_1767607917120 implements MigrationInterface {
  readonly version = "1767607917120"
  readonly isDestructive = false
  readonly canRunInParallel = false

  async up(connection: any): Promise<void> {
    // SQL to apply the migration
  }

  async down(connection: any): Promise<void> {
    // SQL to undo the migration
  }

  async dryRun(connection: any): Promise<string[]> {
    // Return SQL statements for preview
  }
}
```

## Generating Migrations

### Automatic Generation (Recommended)

LyraJS automatically detects schema changes by comparing your entities to the database:

```bash
npx maestro make:migration
```

This command:
1. Introspects your current database schema
2. Compares it with your entity definitions
3. Generates migration code for detected differences
4. Includes smart rename detection to prevent data loss

### Manual Migration

For complex operations, you can create migrations manually by copying the file structure above.

## Running Migrations

### Apply Pending Migrations

```bash
npx maestro migration:migrate
```

### View Migration Status

```bash
npx maestro migration:status
```

### Rollback Last Migration

```bash
npx maestro migration:rollback
```

### Rollback Multiple Migrations

```bash
npx maestro migration:rollback --steps=3
```

### Fresh Installation (⚠️ Destructive)

Drops all tables and re-runs all migrations:

```bash
npx maestro migration:fresh
```

### Refresh Database (⚠️ Destructive)

Rolls back all migrations and re-runs them:

```bash
npx maestro migration:refresh
```

## Migration Squashing

For mature projects with many migrations, you can combine them into a single baseline migration:

```bash
# Squash all executed migrations
npx maestro migration:squash

# Squash up to a specific version
npx maestro migration:squash --to=1767607917120
```

Squashed migrations:
- Reduce migration count for fresh installations
- Improve migration performance
- Keep the migrations folder organized
- Mark old migrations as archived

## Migration Features

### Smart Rename Detection

The migration generator can detect when columns or tables are renamed (instead of dropped and recreated):

```
? Detected potential rename: firstname -> first_name (85% confidence)
  Do you want to rename instead of drop+create? (Y/n)
```

### Automatic Backups

Backups are automatically created before destructive operations:
- The backup is saved to `backups/backup_YYYY-MM-DD_HH-MM-SS_<version>.sql`
- Tracked in the migrations table for easy restoration

### Migration Batching

Migrations are organized in batches, making it easy to rollback related changes together.

### Parallel Execution

Some migrations can run in parallel for better performance (set `canRunInParallel = true`).

## Best Practices

1. **Never modify executed migrations**: Create new migrations for changes
2. **Test migrations**: Always test in development before production
3. **Write reversible migrations**: Ensure `down()` properly undoes `up()`
4. **Use transactions**: Migrations run in transactions by default
5. **Keep migrations small**: One logical change per migration
6. **Review generated SQL**: Check auto-generated migrations before running
7. **Version control**: Commit migration files to your repository

## Common Operations

### Adding a Column

```bash
# 1. Add column to your entity
# 2. Generate migration
npx maestro make:migration

# 3. Review and run
npx maestro migration:migrate
```

### Creating a Table

```bash
# 1. Create entity class
# 2. Generate migration
npx maestro make:migration

# 3. Run migration
npx maestro migration:migrate
```

### Renaming a Column

```bash
# 1. Rename field in entity
# 2. Generate migration (will detect rename)
npx maestro make:migration

# 3. Confirm rename when prompted
# 4. Run migration
npx maestro migration:migrate
```

## Troubleshooting

### Migration Failed

If a migration fails:
1. Check the error message
2. Fix the migration file or database state
3. Rollback if needed: `npx maestro migration:rollback`
4. Re-run: `npx maestro migration:migrate`

### Out of Sync

If your database is out of sync with migrations:
1. Use `npx maestro migration:status` to check state
2. Manually fix the database or migrations table
3. Or use `npx maestro migration:fresh` (⚠️ destroys data)

### Restore from Backup

If something goes wrong:

```bash
npx maestro list:backups
npx maestro restore:backup <filename>
```

## Related Commands

```bash
# Show all controllers
npx maestro show:controllers

# Show all entities
npx maestro show:entities

# Show all migrations
npx maestro show:migrations

# Show database structure
npx maestro show:routes
```

---

For more information, visit the [LyraJS Documentation](https://lyrajs.dev/).
