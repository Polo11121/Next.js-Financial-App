import { Hono } from "hono";
import { db } from "@/db";
import {
  categories as categoriesSchema,
  transactions as transactionsSchema,
  accounts as accountsSchema,
  insertTransactionSchema,
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";
import { z } from "zod";

export const transactions = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { accountId, from, to } = c.req.valid("query");

      if (!auth?.userId) {
        return c.json(
          {
            message: "Unauthorized",
          },
          401
        );
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactionsSchema.id,
          category: categoriesSchema.name,
          categoryId: transactionsSchema.categoryId,
          payee: transactionsSchema.payee,
          amount: transactionsSchema.amount,
          notes: transactionsSchema.notes,
          account: accountsSchema.name,
          accountId: transactionsSchema.accountId,
          date: transactionsSchema.date,
        })
        .from(transactionsSchema)
        .innerJoin(
          accountsSchema,
          eq(transactionsSchema.accountId, accountsSchema.id)
        )
        .leftJoin(
          categoriesSchema,
          eq(transactionsSchema.categoryId, categoriesSchema.id)
        )
        .where(
          and(
            accountId ? eq(transactionsSchema.accountId, accountId) : undefined,
            eq(accountsSchema.userId, auth.userId),
            gte(transactionsSchema.date, startDate),
            lte(transactionsSchema.date, endDate)
          )
        )
        .orderBy(desc(transactionsSchema.date));

      return c.json({
        data,
      });
    }
  )
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
          id: transactionsSchema.id,
          categoryId: transactionsSchema.categoryId,
          payee: transactionsSchema.payee,
          amount: transactionsSchema.amount,
          notes: transactionsSchema.notes,
          account: accountsSchema.name,
          accountId: transactionsSchema.accountId,
          date: transactionsSchema.date,
        })
        .from(transactionsSchema)
        .innerJoin(
          accountsSchema,
          eq(transactionsSchema.accountId, accountsSchema.id)
        )
        .where(
          and(
            eq(transactionsSchema.id, id),
            eq(accountsSchema.userId, auth.userId)
          )
        );

      if (!data) {
        return c.json(
          {
            message: "Transaction not found",
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
    zValidator("json", insertTransactionSchema.omit({ id: true })),
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

      const transactionToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactionsSchema.id })
          .from(transactionsSchema)
          .innerJoin(
            accountsSchema,
            eq(transactionsSchema.accountId, accountsSchema.id)
          )
          .where(
            and(
              eq(transactionsSchema.id, id),
              eq(accountsSchema.userId, auth.userId)
            )
          )
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactionsSchema)
        .set(values)
        .where(
          inArray(
            transactionsSchema.id,
            sql`(select id from ${transactionToUpdate})`
          )
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
    zValidator("json", insertTransactionSchema.omit({ id: true })),
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
        .insert(transactionsSchema)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
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
        .insert(transactionsSchema)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          }))
        )
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

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactionsSchema.id })
          .from(transactionsSchema)
          .innerJoin(
            accountsSchema,
            eq(transactionsSchema.accountId, accountsSchema.id)
          )
          .where(
            and(
              inArray(transactionsSchema.id, values.ids),
              eq(accountsSchema.userId, auth.userId)
            )
          )
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactionsSchema)
        .where(
          inArray(
            transactionsSchema.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning();

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

      const transactionToDelete = db.$with("transaction_to_delete").as(
        db
          .select({ id: transactionsSchema.id })
          .from(transactionsSchema)
          .innerJoin(
            accountsSchema,
            eq(transactionsSchema.accountId, accountsSchema.id)
          )
          .where(
            and(
              eq(transactionsSchema.id, id),
              eq(accountsSchema.userId, auth.userId)
            )
          )
      );

      const [data] = await db
        .with(transactionToDelete)
        .delete(transactionsSchema)
        .where(
          inArray(
            transactionsSchema.id,
            sql`(select id from ${transactionToDelete})`
          )
        )
        .returning({
          id: transactionsSchema.id,
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
