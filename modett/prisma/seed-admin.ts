import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@modett.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log(`⚠️  Admin user already exists: ${adminEmail}`);
    console.log(`   Role: ${existingAdmin.role}`);
    console.log(`   Status: ${existingAdmin.status}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'active',
      emailVerified: true,
      isGuest: false,
    }
  });

  console.log(`✅ Created admin user: ${adminEmail}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ⚠️  Please change this password in production!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Admin creation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
