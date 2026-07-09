import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  await prisma.user.upsert({
    where: { email: "admin@smartparking.com" },
    update: {},
    create: {
      email: "admin@smartparking.com",
      passwordHash,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
      isEmailVerified: true,
      adminProfile: { create: { department: "Platform Operations" } },
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: "operator@smartparking.com" },
    update: {},
    create: {
      email: "operator@smartparking.com",
      passwordHash,
      firstName: "Olivia",
      lastName: "Operator",
      role: "OPERATOR",
      isEmailVerified: true,
      operatorProfile: { create: { companyName: "Downtown Parking Co.", isVerified: true } },
    },
    include: { operatorProfile: true },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: "driver@smartparking.com" },
    update: {},
    create: {
      email: "driver@smartparking.com",
      passwordHash,
      firstName: "Dana",
      lastName: "Driver",
      role: "DRIVER",
      isEmailVerified: true,
      driverProfile: { create: {} },
    },
    include: { driverProfile: true },
  });

  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: operatorUser.id } });
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: driverUser.id } });

  const lot = await prisma.parkingLot.create({
    data: {
      operatorId: operatorProfile.id,
      name: "MG Road Central Parking",
      description: "24/7 secure parking in the heart of Bengaluru's business district",
      addressLine: "100 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560001",
      latitude: 12.9758,
      longitude: 77.6045,
      amenities: ["CCTV", "Covered", "EV Charging"],
    },
  });

  const zones = await Promise.all([
    prisma.parkingZone.create({ data: { lotId: lot.id, name: "Zone A - Two Wheeler", vehicleType: "TWO_WHEELER" } }),
    prisma.parkingZone.create({ data: { lotId: lot.id, name: "Zone B - Three Wheeler", vehicleType: "THREE_WHEELER" } }),
    prisma.parkingZone.create({ data: { lotId: lot.id, name: "Zone C - Four Wheeler", vehicleType: "FOUR_WHEELER" } }),
  ]);

  for (const zone of zones) {
    await prisma.parkingSpace.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        lotId: lot.id,
        zoneId: zone.id,
        code: `${zone.name.slice(5, 6)}-${String(i + 1).padStart(3, "0")}`,
        vehicleType: zone.vehicleType,
      })),
    });
  }

  await Promise.all([
    prisma.pricingRule.create({
      data: { lotId: lot.id, vehicleType: "TWO_WHEELER", name: "Standard", baseRatePerHour: 1.5, dailyMaxRate: 10 },
    }),
    prisma.pricingRule.create({
      data: { lotId: lot.id, vehicleType: "THREE_WHEELER", name: "Standard", baseRatePerHour: 2, dailyMaxRate: 14 },
    }),
    prisma.pricingRule.create({
      data: { lotId: lot.id, vehicleType: "FOUR_WHEELER", name: "Standard", baseRatePerHour: 3, dailyMaxRate: 20 },
    }),
  ]);

  await prisma.vehicle.upsert({
    where: { plateNumber: "KA01AB1234" },
    update: {},
    create: { driverId: driverProfile.id, plateNumber: "KA01AB1234", type: "FOUR_WHEELER", make: "Maruti Suzuki", model: "Swift", isDefault: true },
  });

  console.log("Seed complete:");
  console.log(`  Admin:    admin@smartparking.com / Password123`);
  console.log(`  Operator: operator@smartparking.com / Password123`);
  console.log(`  Driver:   driver@smartparking.com / Password123`);
  console.log(`  Lot:      ${lot.name} (${lot.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
