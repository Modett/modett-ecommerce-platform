// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting seed...');

//   // Create demo users
//   const user1 = await prisma.user.create({
//     data: {
//       email: 'jane.doe@example.com',
//       password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvQy5cKJjPg0/Fe', // hashed 'password123'
//       name: 'Jane Doe',
//       role: 'customer',
//       profile: {
//         create: {
//           firstName: 'Jane',
//           lastName: 'Doe',
//           phone: '+1234567890',
//           gender: 'female',
//         }
//       },
//       addresses: {
//         create: [
//           {
//             type: 'shipping',
//             name: 'Home',
//             street: '123 Main St',
//             city: 'New York',
//             state: 'NY',
//             zip: '10001',
//             country: 'US',
//             isDefault: true,
//           },
//           {
//             type: 'billing',
//             name: 'Office',
//             street: '456 Business Ave',
//             city: 'New York',
//             state: 'NY',
//             zip: '10002',
//             country: 'US',
//           }
//         ]
//       }
//     }
//   });

//   const admin = await prisma.user.create({
//     data: {
//       email: 'admin@modett.com',
//       password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvQy5cKJjPg0/Fe', // hashed 'admin123'
//       name: 'Admin User',
//       role: 'admin',
//       profile: {
//         create: {
//           firstName: 'Admin',
//           lastName: 'User',
//         }
//       }
//     }
//   });

//   console.log('✅ Seed completed successfully');
//   console.log('Demo users created:', { user1: user1.email, admin: admin.email });
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
