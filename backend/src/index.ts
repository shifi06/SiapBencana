import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`🚀 SiapBencana API jalan di http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error("Gagal start server!:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
