const { sequelize } = require("../dataBase.js");
const User = require("../models/user.js");

async function seedUsers() {
  await sequelize.sync();

  await User.bulkCreate([
    {
      id: "134fc2b4-0d13-4fce-8d36-e87d32ac0978",
      username: "Hamana",
      email: "hamana@gmail.com",
      password: "$2a$10$/zkkL9AgFnR7lM.xRnEKzu5vEa8NKViIT2Cz1mgd37bQjpKlCVn1m",
      role: "user",
      createdAt: new Date("2025-05-11T01:09:48.664Z"),
      updatedAt: new Date("2025-05-11T01:09:48.664Z"),
    },
    {
      id: "530383ef-4f0f-4b33-8ef1-8cc3ebd0abed",
      username: "erik2",
      email: "erik2@gmail.com",
      password: "$2a$10$m7JfgorISxUyJRg4onhmrOoJQ4/GBYjlL1EwD3tV6SGfBV9S3vw2W",
      role: "user",
      createdAt: new Date("2025-01-25T14:09:46.902Z"),
      updatedAt: new Date("2025-01-25T14:09:46.902Z"),
    },
    {
      id: "5689af4f-315c-4a86-9da6-946447ee0b86",
      username: "admin",
      email: "admin@gmail.com",
      password: "$2a$10$2uDf9AcRD6ztizBFXUtagOsm59E61fv4Koi0lVAi5KPgRZvPTIAji",
      role: "admin",
      createdAt: new Date("2025-04-02T20:26:42.878Z"),
      updatedAt: new Date("2025-04-02T20:26:42.878Z"),
    },
    {
      id: "6042e445-ad13-4b01-807d-9007ba22295e",
      username: "barni",
      email: "barni@gmail.com",
      password: "$2a$10$Ouw8eNXP.u0fitAxl1JbLeBujVOQtksWPCgSNL/WNhy3ZF1fec12a",
      role: "user",
      createdAt: new Date("2025-01-25T14:37:26.161Z"),
      updatedAt: new Date("2025-01-25T14:37:26.161Z"),
    },
    {
      id: "61875eec-950a-4208-a245-3ad51f830749",
      username: "Birkl",
      email: "birkl@kerik.com",
      password: "$2a$10$hLwRhC3pTOuGPah.XG.U3OhoDSezh/qj/YqRN6aS8gSlf1RjZqYeS",
      role: "user",
      createdAt: new Date("2025-01-26T10:50:44.884Z"),
      updatedAt: new Date("2025-01-26T10:50:44.884Z"),
    },
    {
      id: "80525604-1f66-4775-9ce1-8a8b1f480775",
      username: "Elrich",
      email: "elrich.020114@gmail.com",
      password: "$2a$10$oO9tUBwfafJjL2YSkvdOier.O974TcgCIWUDiLV47Qf2T/wmv8AgC",
      role: "admin",
      createdAt: new Date("2025-03-22T16:23:44.834Z"),
      updatedAt: new Date("2025-03-22T16:23:44.834Z"),
    },
    {
      id: "c3b20c20-db47-4457-a532-709757d5e273",
      username: "erik",
      email: "erik@gmail.com",
      password: "$2a$10$vS0papmT8FZCNmyXbHEhXuFbCSA0PTG5V4Iw3u2R1bsQ8cZ5sH0m2",
      role: "user",
      createdAt: new Date("2025-04-02T20:26:42.817Z"),
      updatedAt: new Date("2025-04-02T20:26:42.817Z"),
    },
    {
      id: "e293fafc-51cf-4a27-bb5e-612e6da51739",
      username: "qwert",
      email: "qwert@qwert.com",
      password: "$2a$10$opvBEaaKitFV/2wKBBwBveL9L2EzNqGVzdmRopOcIWxocRBH5FLgK",
      role: "user",
      createdAt: new Date("2025-01-26T17:06:44.398Z"),
      updatedAt: new Date("2025-01-26T17:06:44.398Z"),
    },
    {
      id: "f4f921bd-b5db-445e-9714-c1e38f2df604",
      username: "qwe",
      email: "qwe@qwe.com",
      password: "$2a$10$OUI9wRBsNHTNNzd31T.RW.lEkTv9vFlElofDu.4rVC5R8zOqLwQWe",
      role: "user",
      createdAt: new Date("2025-01-25T17:31:16.943Z"),
      updatedAt: new Date("2025-01-25T17:31:16.943Z"),
    },
  ]);

  console.log("✅ Userek sikeresen felseedelve!");
  process.exit(0);
}

seedUsers();
