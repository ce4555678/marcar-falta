
import { parseAsFloat, createLoader } from 'nuqs/server'
import getPresenceByDateRange from './getPresence'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const runtime = 'edge'

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const presenceSearchParams = {
    month: parseAsFloat.withDefault(new Date().getMonth()),
    year: parseAsFloat.withDefault(new Date().getFullYear()),
}

export const loadSearchParams = createLoader(presenceSearchParams)

export const GET = async (req: Request) => {
    const searchParams = loadSearchParams(req)
    const date = new Date(`${searchParams.year}-${searchParams.month + 1}-01`);
    const dateEnd = new Date(date.getFullYear(), (date.getMonth() + 1) + 1, 0);
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await getPresenceByDateRange(date, dateEnd);

    return Response.json(response)
}