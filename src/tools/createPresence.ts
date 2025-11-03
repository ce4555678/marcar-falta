import { tool } from "ai";
import { z } from "zod";
import db from "@/db";
import { presence } from "@/db/schema";

export const createPresenceTool = tool({
    description:
        "Cria um novo registro de presença/falta com data, hora, status e observação. Use para registrar entrada, saída, intervalo ou falta.",
    inputSchema: z.object({
        day: z.number().describe("Dia do mês (1-31)"),
        month: z.number().describe("Mês (1-12, onde 1=janeiro, 12=dezembro)"),
        year: z.number().describe("Ano (ex: 2025)"),
        hour: z.number().describe("Hora (0-23)"),
        minute: z.number().describe("Minuto (0-59)"),
        status: z.enum(["entrada", "saida-intervalo", "entrada-intervalo", "saida", "falta"])
            .describe("Status do registro: entrada, saida-intervalo, entrada-intervalo, saida ou falta"),
        observation: z.string().optional().describe("Observação opcional sobre o registro"),
    }),
    execute: async ({ day, month, year, hour, minute, status, observation }) => {
        try {
            // Validar data
            if (day < 1 || day > 31 || month < 1 || month > 12) {
                return {
                    success: false,
                    error: "Data inválida. Dia deve estar entre 1-31 e mês entre 1-12.",
                };
            }

            // Validar hora e minuto
            if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                return {
                    success: false,
                    error: "Hora inválida. Hora deve estar entre 0-23 e minuto entre 0-59.",
                };
            }

            // Criar objeto Date com fuso horário correto (GMT-3)
            const date = new Date(year, month - 1, day, hour, minute, 0, 0);


            // Inserir novo registro
            const result = await db.insert(presence).values({
                date,
                status: status as "entrada" | "saida-intervalo" | "entrada-intervalo" | "saida" | "falta",
                observation: observation || null,
            }).returning();

            if (!result || result.length === 0) {
                return {
                    success: false,
                    error: "Falha ao criar registro no banco de dados.",
                };
            }

            const created = result[0];

            return {
                success: true,
                message: `Registro criado com sucesso!`,
                data: {
                    id: created.id,
                    date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
                    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
                    status: created.status,
                    observation: created.observation || "Nenhuma",
                    createdAt: new Date(created.createdAt).toLocaleString("pt-BR"),
                },
            };
        } catch (error) {
            console.error("Erro ao criar registro de presença:", error);
            return {
                success: false,
                error: `Erro ao processar: ${error instanceof Error ? error.message : "Desconhecido"}`,
            };
        }
    },
});