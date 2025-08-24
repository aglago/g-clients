// Quick script to test slug migration
// Run this with: node migrate-slugs-script.js

const { migrateSlugs } = require('./src/lib/migrate-slugs.ts');

async function runMigration() {
  try {
    console.log('Starting slug migration...');
    await migrateSlugs();
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();