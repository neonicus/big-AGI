import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/server/prisma/schema.prisma",
  datasource: {
    url: "file:./dev.db",
  },
});
