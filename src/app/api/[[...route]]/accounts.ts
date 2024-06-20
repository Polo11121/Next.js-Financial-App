import { Hono } from "hono";
import { db } from "@/db";
import { accounts as accountsSchema, insertAccountSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

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
  .get(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json(
          {
            message: "Unauthorized",
          },
          401
        );
      }
      if (!id) {
        return c.json(
          {
            message: "Missing id",
          },
          400
        );
      }

      const [data] = await db
        .select({
          id: accountsSchema.id,
          name: accountsSchema.name,
        })
        .from(accountsSchema)
        .where(
          and(eq(accountsSchema.userId, auth.userId), eq(accountsSchema.id, id))
        );

      if (!data) {
        return c.json(
          {
            message: "Account not found",
          },
          404
        );
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json(
          {
            message: "Unauthorized",
          },
          401
        );
      }
      if (!id) {
        return c.json(
          {
            message: "Missing id",
          },
          400
        );
      }

      const [data] = await db
        .update(accountsSchema)
        .set(values)
        .where(
          and(eq(accountsSchema.userId, auth.userId), eq(accountsSchema.id, id))
        )
        .returning();

      if (!data) {
        return c.json(
          {
            message: "Account not found",
          },
          404
        );
      }

      return c.json({ data });
    }
  )
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
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
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
      const data = await db
        .delete(accountsSchema)
        .where(
          and(
            eq(accountsSchema.userId, auth.userId),
            inArray(accountsSchema.id, values.ids)
          )
        )
        .returning({
          id: accountsSchema.id,
        });

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json(
          {
            message: "Unauthorized",
          },
          401
        );
      }
      if (!id) {
        return c.json(
          {
            message: "Missing id",
          },
          400
        );
      }

      const [data] = await db
        .delete(accountsSchema)
        .where(
          and(eq(accountsSchema.userId, auth.userId), eq(accountsSchema.id, id))
        )
        .returning({
          id: accountsSchema.id,
        });

      if (!data) {
        return c.json(
          {
            message: "Account not found",
          },
          404
        );
      }

      return c.json({
        data,
      });
    }
  );
