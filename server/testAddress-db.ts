import "dotenv/config";
import { prisma } from "./config/prisma.js";

async function testAddressDB() {
  try {
    console.log("================================");
    console.log("ADDRESS DATABASE TEST");
    console.log("================================");

    // 1. Check database connection
    console.log("\n1. Testing database connection...");

    await prisma.$queryRaw`SELECT 1`;

    console.log("DATABASE CONNECTION: SUCCESS ✅");

    // 2. Find an existing user
    console.log("\n2. Finding user...");

    const user = await prisma.user.findUnique({
      where: {
        email: "userme@email.com",
      },
    });

    if (!user) {
      throw new Error("User userme@email.com was not found.");
    }

    console.log("USER FOUND ✅");
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // 3. Create a NEW address
    console.log("\n3. Creating address...");

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        label: "DB Test Home",
        address: "21 South Ave",
        city: "Uttara",
        district: "Dhaka",
        zip: "1230",
        lat: 23.8759,
        lng: 90.3795,
        isDefault: false,
      },
    });

    console.log("ADDRESS CREATE SUCCESS ✅");
    console.log(newAddress);

    // 4. Read the address
    console.log("\n4. Reading address...");

    const foundAddress = await prisma.address.findUnique({
      where: {
        id: newAddress.id,
      },
    });

    console.log("ADDRESS READ SUCCESS ✅");
    console.log(foundAddress);

    // 5. Update the address
    {/*console.log("\n5. Updating address...");

    const updatedAddress = await prisma.address.update({
      where: {
        id: newAddress.id,
      },
      data: {
        label: "DB Test Updated",
        district: "Dhaka",
        zip: "1231",
      },
    });

    console.log("ADDRESS UPDATE SUCCESS ✅");
    console.log(updatedAddress);

    // 6. Show ALL addresses belonging to this user
    console.log("\n6. All addresses for this user...");

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("USER ADDRESSES:");
    console.log(addresses);

    // 7. Delete ONLY the test address
    console.log("\n7. Deleting test address...");

    await prisma.address.delete({
      where: {
        id: newAddress.id,
      },
    });

    console.log("ADDRESS DELETE SUCCESS ✅");*/}

    // 8. Final result
    console.log("\n================================");
    console.log("DATABASE TEST COMPLETED ✅");
    console.log("================================");

  } catch (error) {
    console.error("\n================================");
    console.error("DATABASE TEST FAILED ❌");
    console.error("================================");

    console.error(error);

  } finally {
    await prisma.$disconnect();
  }
}

testAddressDB();