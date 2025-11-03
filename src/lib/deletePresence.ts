"use server";

import db from "@/db";
import { presence } from "@/db/schema";
import { eq } from "drizzle-orm";

export const deletePresenceDb = async (id: number) => {
    await db.delete(presence).where(eq(presence.id, id));
};