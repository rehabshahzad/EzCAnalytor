require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./src/models/Admin");

const admins = [
  { name: "Admin Islamabad", email: "admin.islamabad@police.gov.pk", city: "Islamabad" },
  { name: "Admin Lahore", email: "admin.lahore@police.gov.pk", city: "Lahore" },
  { name: "Admin Karachi", email: "admin.karachi@police.gov.pk", city: "Karachi" },
  { name: "Admin Peshawar", email: "admin.peshawar@police.gov.pk", city: "Peshawar" }
];

const PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";

async function seedAdmins() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  for (const admin of admins) {
    const existing = await Admin.findOne({ email: admin.email });
    if (existing) {
      console.log(`⚠ Skipped existing admin: ${admin.email}`);
      continue;
    }

    await Admin.create({
      ...admin,
      password: hashedPassword
    });
    console.log(`✓ Created admin: ${admin.email} (${admin.city})`);
  }

  await mongoose.disconnect();
  console.log("Admin seeding complete.");
}

seedAdmins().catch((error) => {
  console.error(error);
  process.exit(1);
});
