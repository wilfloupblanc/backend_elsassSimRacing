# Database Backups

This directory stores automatic database backups created by the LyraJS migration system.

## Purpose

The `backups/` folder contains SQL dump files that serve as safety checkpoints for your database. These backups are automatically created before destructive migration operations to ensure data can be recovered if needed.

## When Backups Are Created

Backups are automatically generated in the following scenarios:

- **Before destructive migrations**: When running migrations marked as `isDestructive = true`
- **Before rollback operations**: When using `maestro migration:rollback`
- **Before refresh operations**: When using `maestro migration:refresh`
- **Before fresh migrations**: When using `maestro migration:fresh`

## Backup File Format

Backup files follow this naming convention:

```
backup_YYYY-MM-DD_HH-MM-SS_<version>.sql
```

Example: `backup_2026-01-05_14-30-45_1767607917120.sql`

Where:
- **Date/Time**: Timestamp of when the backup was created
- **Version**: Migration version number associated with the backup

## Managing Backups

### List All Backups

```bash
npx maestro list:backups
```

### Restore a Backup

```bash
npx maestro restore:backup <filename>
```

Example:
```bash
npx maestro restore:backup backup_2026-01-05_14-30-45_1767607917120.sql
```

### Clean Up Old Backups

```bash
npx maestro cleanup:backups --days=30
```

This removes backups older than 30 days (default: 7 days).

## Best Practices

1. **Keep backups**: Don't delete backups immediately after migrations succeed
2. **Regular cleanup**: Use `cleanup:backups` to manage disk space
3. **External backups**: Consider copying important backups to external storage
4. **Test restores**: Periodically test backup restoration in development

## Storage Considerations

- Backup files can be large depending on database size
- Regular cleanup is recommended to prevent disk space issues
- The migration system tracks backup paths in the `migrations` table

## Security

- Backup files contain your complete database schema and data
- Keep this directory secure and excluded from version control
- The `.gitignore` should include `backups/*.sql`

## Related Commands

```bash
# View migration status with backup information
npx maestro migration:status

# Run migration with automatic backup
npx maestro migration:migrate

# Rollback with automatic backup
npx maestro migration:rollback
```

---

For more information, visit the [LyraJS Documentation](https://lyrajs.dev/).
