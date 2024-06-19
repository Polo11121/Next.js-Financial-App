import { Hono } from "hono";
import { db } from "@/db";
import { accounts as accountsSchema, insertAccountSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const accounts = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          message: "Unauthorized",
        },
        401
      );
    }

    const data = await db
      .select({
        id: accountsSchema.id,
        name: accountsSchema.name,
      })
      .from(accountsSchema)
      .where(eq(accountsSchema.userId, auth.userId));

    return c.json({
      data,
    });
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json(
          {
            message: "Unauthorized",
          },
          401
        );
      }

      const [data] = await db
        .insert(accountsSchema)
        .values({
          id: createId(),
          ...values,
          userId: auth.userId,
        })
        .returning();

      return c.json({ data });
    }
  );
