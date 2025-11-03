
import db from "@/db";
import { presence } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";

export default async function getPresenceByDateRange(startDate: Date, endDate: Date) {
    // O Drizzle ORM se encarrega de converter os objetos Date
    // para o formato de milissegundos (timestamp_ms) para a consulta SQL.
    const presences = await db.select()
        .from(presence)
        .where(
            and(
                // date >= startDate
                gte(presence.date, startDate),
                // date <= endDate
                lte(presence.date, endDate)
            )
        );

    return presences;
}