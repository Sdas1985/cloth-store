import { ensureDbInitialized, query, queryOne } from '../src/lib/db';

async function main() {
  console.log('🔄 Initializing database schema and seeds...');
  await ensureDbInitialized();

  const districtCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM districts');
  console.log(`✅ Districts in database: ${districtCount?.count}`);

  const productCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products');
  console.log(`✅ Products in database: ${productCount?.count}`);

  const adminUsers = await query('SELECT id, name, email, role FROM admin_users');
  console.log(`✅ Admin users seeded:`, adminUsers);

  const sampleDistrict = await queryOne('SELECT * FROM districts WHERE name_en = ?', ['Chattogram']);
  console.log('✅ Chattogram district record:', sampleDistrict);

  console.log('🎉 Database initialization test passed successfully!');
}

main().catch((err) => {
  console.error('❌ Database initialization error:', err);
  process.exit(1);
});
