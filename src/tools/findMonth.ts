import getPresenceByDateRange from "@/app/api/date/getPresence";
import { tool } from "ai";
import { z } from "zod";

export const findMonthTool = tool({
    description:
        "Retorna todos os registros de presença, faltas e horas extras do usuário para o mês e ano solicitado.",
    inputSchema: z.object({
        month: z.number().describe("O mês (1-12: 1=Janeiro, 2=Fevereiro, ..., 12=Dezembro)"),
        year: z.number().describe("O ano (ex: 2025)"),
    }),
    execute: async ({ month, year }) => {
        try {
            // Converter de 1-12 para índice de mês JavaScript (0-11)
            const jsMonth = month - 1;

            // Primeiro dia do mês às 00:00:00
            const dateStart = new Date(year, jsMonth, 1, 0, 0, 0, 0);

            // Último dia do mês às 23:59:59
            // new Date(year, jsMonth + 1, 0) retorna o último dia do mês anterior (último dia do mês desejado)
            const dateEnd = new Date(year, jsMonth + 1, 0, 23, 59, 59, 999);

            console.log({
                dateStart,
                dateEnd
            })
            console.log(`findMonth: Buscando registros de ${dateStart.toISOString()} a ${dateEnd.toISOString()}`);

            const response = await getPresenceByDateRange(dateStart, dateEnd);

            if (!response || response.length === 0) {
                return {
                    success: true,
                    data: [],
                    message: `Nenhum registro encontrado para ${month}/${year}`,
                    period: {
                        start: dateStart.toISOString().split('T')[0],
                        end: dateEnd.toISOString().split('T')[0],
                    }
                };
            }

            // Validar e processar dados retornados
            const processedData = response.map((record: any) => {
                const recordDate = new Date(record.date);
                return {
                    id: record.id,
                    date: recordDate.getTime(), // timestamp em ms
                    status: record.status,
                    observation: record.observation || null,
                    createdAt: record.createdAt,
                };
            });

            console.log(`findMonth: ${processedData.length} registros encontrados`);

            return {
                success: true,
                data: processedData,
                message: `${processedData.length} registro(s) encontrado(s) para ${month}/${year}`,
                period: {
                    start: dateStart.toISOString().split('T')[0],
                    end: dateEnd.toISOString().split('T')[0],
                }
            };

        } catch (error) {
            console.error("Erro em findMonth:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erro ao buscar registros",
                data: [],
            };
        }
    },
});