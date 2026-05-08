// backend/seed-admins.js
// Run once: node seed-admins.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./src/models/Admin");

const admins = [
  { name: "Admin Islamabad", email: "admin.islamabad@police.gov.pk", city: "Islamabad" },
  { name: "Admin Lahore",    email: "admin.lahore@police.gov.pk",    city: "Lahore"    },
  { name: "Admin Karachi",   email: "admin.karachi@police.gov.pk",   city: "Karachi"   },
  { name: "Admin Peshawar",  email: "admin.peshawar@police.gov.pk",  city: "Peshawar"  },
  // Add / remove cities as needed
];

const PASSWORD = "admin123"; // Change this to your desired default password

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const hashed = await bcrypt.hash(PASSWORD, 10);

  for (const a of admins) {
    const existing = await Admin.findOne({ email: a.email });
    if (existing) {
      console.log(`⚠ Skipped (already exists): ${a.email}`);
      continue;
    }
    await Admin.create({ ...a, password: hashed });
    console.log(`✓ Created admin: ${a.email} — city: ${a.city}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((e) => { console.error(e); process.exit(1); });