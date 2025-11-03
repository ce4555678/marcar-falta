import { drizzle } from 'drizzle-orm/libsql/http';
import * as schema from '../db/schema';

const db = drizzle({
    connection: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN!
    },
    schema
});

export default db;