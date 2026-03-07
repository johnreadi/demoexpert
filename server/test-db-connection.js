
const { PrismaClient } = require('@prisma/client');

async function testConnection(dbName) {
  console.log(`\n--- Testing connection to database: ${dbName} ---`);
  
  // Construct URL based on current env var but swapping the db name
  let originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
    console.error("❌ DATABASE_URL is not set");
    return;
  }

  try {
    const url = new URL(originalUrl);
    // Keep the host, user, pass, port. Just change the pathname (db name).
    url.pathname = `/${dbName}`;
    const connectionString = url.toString();

    console.log(`URL: ${connectionString.replace(/:[^:@]*@/, ':****@')}`); // Mask password

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });

    try {
      await prisma.$connect();
      console.log("✅ Connection SUCCESSFUL!");
      
      // Check for data
      const userCount = await prisma.user.count();
      const settingsCount = await prisma.settings.count();
      console.log(`📊 Data Check:`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Settings: ${settingsCount}`);

      if (settingsCount > 0) {
        const settings = await prisma.settings.findFirst();
        console.log(`   - First Setting Key: ${settings.key}`);
      }

    } catch (err) {
      console.error(`❌ Connection FAILED: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }

  } catch (err) {
    console.error(`❌ Invalid URL or Error: ${err.message}`);
  }
}

async function main() {
  console.log("🔍 DIAGNOSTIC: Testing Database Connections");
  
  // Test 1: 'postgres' (Default)
  await testConnection('postgres');

  // Test 2: 'demoexpert-expertdb-djopvt' (Target)
  await testConnection('demoexpert-expertdb-djopvt');
}

main();
