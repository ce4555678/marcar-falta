"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TextPart {
  type: "text";
  text: string;
}

interface ToolPart {
  type: string;
  state?:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  output?: any;
  input?: any;
  toolCallId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  parts: Array<TextPart | ToolPart>;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: { text: string }) => void;
  isLoading: boolean;
}

interface PresenceRecord {
  id: number;
  date: number;
  status:
    | "falta"
    | "entrada"
    | "saida-intervalo"
    | "entrada-intervalo"
    | "saida";
  observation?: string;
  createdAt: number;
}

// Função para formatar timestamp para DD/MM/YYYY HH:MM
const formatDateTime = (timestamp: number): { date: string; time: string } => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  };
};

// Função para traduzir status
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    entrada: "✓ Entrada",
    "entrada-intervalo": "↩ Retorno Almoço",
    "saida-intervalo": "↪ Saída Almoço",
    saida: "✓ Saída",
    falta: "✗ Falta",
  };
  return statusMap[status] || status;
};

// Função para agrupar e processar registros
const processPresenceData = (records: PresenceRecord[]) => {
  const grouped: Record<string, PresenceRecord[]> = {};

  // Validar e filtrar registros válidos
  const validRecords = records.filter((record) => {
    if (!record || typeof record.date !== "number") {
      console.warn("Registro inválido:", record);
      return false;
    }
    return true;
  });

  validRecords.forEach((record) => {
    const { date } = formatDateTime(record.date);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });

  // Ordenar por data mais recente primeiro
  return Object.entries(grouped)
    .sort((a, b) => {
      const dateA = new Date(a[0].split("/").reverse().join("-")).getTime();
      const dateB = new Date(b[0].split("/").reverse().join("-")).getTime();
      return dateB - dateA;
    })
    .map(([date, dayRecords]) => ({
      date,
      records: dayRecords.sort((a, b) => a.date - b.date),
    }));
};

export default function Chat() {
  const [input, setInput] = useState<string>("");
  const { messages, sendMessage, isLoading } =
    useChat() as unknown as ChatContextType;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect((): void => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto w-full px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">
                Bem-vindo ao Guardian
              </h2>
              <p className="text-muted-foreground max-w-sm mb-4">
                Seu assistente de presença, faltas e horas extras
              </p>
              <div className="text-sm text-muted-foreground max-w-sm text-left">
                <p className="mb-2">
                  <strong>Comandos disponíveis:</strong>
                </p>
                <ul className="space-y-1">
                  <li>• Balanço Mensal [Mês/Ano]</li>
                  <li>• Relatório de Presença [Período]</li>
                  <li>• Relatório de Faltas [Período]</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl ${
                  message.role === "user" ? "w-full" : "w-full"
                }`}
              >
                <Card
                  className={`px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground border-0 rounded-br-none ml-auto max-w-xs"
                      : "rounded-bl-none"
                  }`}
                >
                  {message.parts.map((part, i: number) => {
                    // Renderizar texto
                    if (part.type === "text") {
                      return (
                        <div
                          key={`${message.id}-text-${i}`}
                          className={message.role === "user" ? "" : ""}
                        >
                          <MemoizedMarkdown
                            id={message.id}
                            content={(part as TextPart).text}
                          />
                        </div>
                      );
                    }

                    // Renderizar tool findMonth com output disponível
                    if (part.type === "tool-findMonth" && part.output) {
                      const records = Array.isArray(part.output.data)
                        ? part.output.data
                        : [];

                      console.log(part.output.data);
                      if (records.length === 0) {
                        return (
                          <div
                            key={`${message.id}-empty-${i}`}
                            className="text-sm text-muted-foreground py-2"
                          >
                            Nenhum registro encontrado para o período.
                          </div>
                        );
                      }

                      const processedData = processPresenceData(records);

                      return (
                        <div
                          key={`${message.id}-table-${i}`}
                          className="w-full overflow-x-auto space-y-4"
                        >
                          {processedData.map((dayGroup, idx) => (
                            <div key={`day-${idx}`}>
                              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                                {dayGroup.date}
                              </h3>
                              <Table className="text-xs">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-16">
                                      Horário
                                    </TableHead>
                                    <TableHead className="w-32">
                                      Status
                                    </TableHead>
                                    <TableHead className="flex-1">
                                      Observação
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {dayGroup.records.map((record, recIdx) => {
                                    const { time } = formatDateTime(
                                      record.date
                                    );
                                    return (
                                      <TableRow
                                        key={`${dayGroup.date}-${recIdx}`}
                                      >
                                        <TableCell className="font-mono">
                                          {time}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusLabel(record.status)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                          {record.observation || "-"}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Estado de streaming/loading da tool
                    if (
                      part.type === "tool-findMonth" &&
                      (part.state === "input-streaming" ||
                        part.state === "input-available")
                    ) {
                      return (
                        <div
                          key={`${message.id}-loading-${i}`}
                          className="flex gap-2 py-2"
                        >
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                          <span className="text-sm text-muted-foreground ml-1">
                            Carregando dados...
                          </span>
                        </div>
                      );
                    }

                    // Erro na execução da tool
                    if (
                      part.type === "tool-findMonth" &&
                      part.state === "output-error"
                    ) {
                      return (
                        <div
                          key={`${message.id}-error-${i}`}
                          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded"
                        >
                          ⚠ Erro ao carregar dados:{" "}
                          {part.output?.message || "Falha desconhecida"}
                        </div>
                      );
                    }

                    return null;
                  })}
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="px-4 py-3 rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t bg-card sticky bottom-0 w-full px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form className="flex gap-3" onSubmit={handleSubmit}>
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e): void => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Balanço Mensal Novembro/2025"
              disabled={isLoading}
              className="flex-1"
              aria-label="Mensagem"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0"
              aria-label={isLoading ? "Enviando..." : "Enviar mensagem"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
