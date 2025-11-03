"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Ellipsis, Trash2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { Button } from "./ui/button";
import { presence } from "@/db/schema";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";
import { deletePresenceDb } from "@/lib/deletePresence";
import { queryClient } from "@/app/providers";

const formatDate = (dateString: string | Date) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string | Date) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

type SelectPresence = typeof presence.$inferSelect;

function DeletePresence({
  open,
  onOpenChange,
  presence,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presence: SelectPresence | null;
  onConfirm: (id: number) => void;
}) {
  if (!presence) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir esse registro {presence.status}?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente este
            registro de seus dados de nossos servidores.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(presence.id);
              onOpenChange(false);
            }}
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TableMonth() {
  const date = new Date();
  const [month] = useQueryState("month", {
    defaultValue: date.getMonth().toString(),
  });
  const [year] = useQueryState("year", {
    defaultValue: date.getFullYear().toString(),
  });

  const [selectedPresence, setSelectedPresence] =
    useState<SelectPresence | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const Status = ({ presence }: { presence: SelectPresence }) => {
    if (presence.status == "entrada")
      return <Badge className="capitalize">{presence.status}</Badge>;
    if (presence.status == "entrada-intervalo")
      return (
        <Badge className="capitalize" variant={"default"}>
          entrada intervalo
        </Badge>
      );
    if (presence.status == "falta")
      return (
        <Badge className="capitalize" variant={"destructive"}>
          {presence.status}
        </Badge>
      );
    if (presence.status == "saida")
      return (
        <Badge className="capitalize" variant={"outline"}>
          {presence.status}
        </Badge>
      );
    if (presence.status == "saida-intervalo")
      return (
        <Badge className="capitalize" variant={"outline"}>
          saida Intervalo
        </Badge>
      );
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["lista", month, year],
    queryFn: async (): Promise<SelectPresence[]> => {
      const res = await fetch(`/api/date?month=${month}&year=${year}`);

      if (!res.ok) {
        throw new Error("Erro ao buscar dados da API");
      }

      return res.json();
    },
  });

  const mutationDeletePresence = useMutation({
    mutationFn: async (id: number) => {
      await deletePresenceDb(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lista", month, year] });
    },
  });

  const handleDelete = async (id: number) => {
    mutationDeletePresence.mutate(id);
    // Aqui você faria a chamada à API para deletar
    console.log("Deletando registro com ID:", id);
    // await fetch(`/api/presence/${id}`, { method: "DELETE" });
  };

  if (!isPending && !error) {
    return (
      <section className="space-y-4" id="lista">
        <h2 className="text-center font-bold text-lg">Lista de presença</h2>
        <Table>
          <TableCaption>Lista de presença.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data &&
              Array.isArray(data) &&
              data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatTime(record.date)}</TableCell>
                  <TableCell>
                    <Status presence={record} />
                  </TableCell>
                  <TableCell>{record.observation || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPresence(record);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <DeletePresence
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          presence={selectedPresence}
          onConfirm={handleDelete}
        />
      </section>
    );
  }

  if (isPending) {
    return (
      <section
        className="space-y-4 flex items-center justify-center w-full"
        id="lista"
      >
        <Spinner className="size-14 text-blue-700" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4" id="lista">
        <h2 className="text-center font-bold text-lg">Lista de presença</h2>
        <p className="text-center text-red-600">Erro ao carregar dados</p>
      </section>
    );
  }
}
