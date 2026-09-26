import type { Migration } from '../migrations.types';
import { sql } from 'drizzle-orm';
import { getRuntimeTableColumns } from '../../modules/app/database/database.usecases';

export const documentsOcrMigration = {
  name: 'documents-ocr',

  up: async ({ db }) => {
    const existingColumns = await getRuntimeTableColumns({ tableName: 'documents', db });
    const hasColumn = (columnName: string) => existingColumns.includes(columnName);

    if (!hasColumn('ocr_storage_key')) {
      await db.run(sql`ALTER TABLE documents ADD COLUMN ocr_storage_key TEXT`);
    }
    if (!hasColumn('ocr_size')) {
      await db.run(sql`ALTER TABLE documents ADD COLUMN ocr_size INTEGER`);
    }
    if (!hasColumn('ocr_file_encryption_key_wrapped')) {
      await db.run(sql`ALTER TABLE documents ADD COLUMN ocr_file_encryption_key_wrapped TEXT`);
    }
    if (!hasColumn('ocr_file_encryption_kek_version')) {
      await db.run(sql`ALTER TABLE documents ADD COLUMN ocr_file_encryption_kek_version TEXT`);
    }
    if (!hasColumn('ocr_file_encryption_algorithm')) {
      await db.run(sql`ALTER TABLE documents ADD COLUMN ocr_file_encryption_algorithm TEXT`);
    }
  },

  down: async ({ db }) => {
    await db.batch([
      db.run(sql`ALTER TABLE documents DROP COLUMN ocr_storage_key`),
      db.run(sql`ALTER TABLE documents DROP COLUMN ocr_size`),
      db.run(sql`ALTER TABLE documents DROP COLUMN ocr_file_encryption_key_wrapped`),
      db.run(sql`ALTER TABLE documents DROP COLUMN ocr_file_encryption_kek_version`),
      db.run(sql`ALTER TABLE documents DROP COLUMN ocr_file_encryption_algorithm`),
    ]);
  },
} satisfies Migration;
