/**
 * Promote a user to platform OWNER (super-admin).
 * Defaults to the username from ADMIN_EMAIL's account; pass --username=foo to override.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const usernameArg = args
    .find((a) => a.startsWith("--username="))
    ?.split("=")[1];
  const emailArg = process.env.ADMIN_EMAIL;

  let user = null;
  if (usernameArg) {
    user = await prisma.user.findUnique({ where: { username: usernameArg } });
    if (!user) throw new Error(`No user with username "${usernameArg}".`);
  } else if (emailArg) {
    user = await prisma.user.findUnique({ where: { email: emailArg } });
    if (!user) {
      throw new Error(
        `No user found for ADMIN_EMAIL="${emailArg}". Pass --username=foo instead.`
      );
    }
  } else {
    throw new Error(
      "Set ADMIN_EMAIL in .env or pass --username=foo to identify the user."
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "OWNER" },
  });

  console.log(
    `[promote] ${user.username} (${user.email}) is now an OWNER of the platform.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
