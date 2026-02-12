import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addUserProfileFields() {
  try {
    console.log('Adding user profile fields...');

    // Add title column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE user_management.users
      ADD COLUMN IF NOT EXISTS title VARCHAR(10);
    `);
    console.log('✅ Added title column');

    // Add date_of_birth column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE user_management.users
      ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    `);
    console.log('✅ Added date_of_birth column');

    // Add resident_of column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE user_management.users
      ADD COLUMN IF NOT EXISTS resident_of VARCHAR(255);
    `);
    console.log('✅ Added resident_of column');

    // Add nationality column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE user_management.users
      ADD COLUMN IF NOT EXISTS nationality VARCHAR(255);
    `);
    console.log('✅ Added nationality column');

    console.log('✅ All user profile fields added successfully');
  } catch (error) {
    console.error('Error adding user profile fields:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addUserProfileFields();
