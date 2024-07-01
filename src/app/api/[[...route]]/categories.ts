import { Hono } from "hono";
import { db } from "@/db";
import {
  categories as categoriesSchema,
  insertCategorySchema,
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

export const categories = new Hono()
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
        id: categoriesSchema.id,
        name: categoriesSchema.name,
      })
      .from(categoriesSchema)
      .where(eq(categoriesSchema.userId, auth.userId));

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
          id: categoriesSchema.id,
          name: categoriesSchema.name,
        })
        .from(categoriesSchema)
        .where(
          and(
            eq(categoriesSchema.userId, auth.userId),
            eq(categoriesSchema.id, id)
          )
        );

      if (!data) {
        return c.json(
          {
            message: "Category not found",
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
    zValidator("json", insertCategorySchema.pick({ name: true })),
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
        .update(categoriesSchema)
        .set(values)
        .where(
          and(
            eq(categoriesSchema.userId, auth.userId),
            eq(categoriesSchema.id, id)
          )
        )
        .returning();

      if (!data) {
        return c.json(
          {
            message: "Category not found",
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
    zValidator("json", insertCategorySchema.pick({ name: true })),
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
        .insert(categoriesSchema)
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
        .delete(categoriesSchema)
        .where(
          and(
            eq(categoriesSchema.userId, auth.userId),
            inArray(categoriesSchema.id, values.ids)
          )
        )
        .returning({
          id: categoriesSchema.id,
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
        .delete(categoriesSchema)
        .where(
          and(
            eq(categoriesSchema.userId, auth.userId),
            eq(categoriesSchema.id, id)
          )
        )
        .returning({
          id: categoriesSchema.id,
        });

      if (!data) {
        return c.json(
          {
            message: "Category not found",
          },
          404
        );
      }

      return c.json({
        data,
      });
    }
  );
