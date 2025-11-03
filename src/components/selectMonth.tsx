"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useQueryState } from "nuqs";
import Link from "next/link";

export default function SelectMonth() {
  const date = new Date();
  const [month, setMonth] = useQueryState("month", {
    defaultValue: date.getMonth().toString(),
  });
  const [year, setYear] = useQueryState("year", {
    defaultValue: date.getFullYear().toString(),
  });

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const handleReset = () => {
    setMonth(date.getMonth().toString());
    setYear(currentYear.toString());
  };

  // const handleApply = () => {
  //   console.log(`Selecionado: ${months[parseInt(month)]} de ${year}`);
  // };

  return (
    <div className="flex items-center w-full justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          Seletor de Período
        </h1>

        <div className="space-y-6">
          {/* Mês */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Mês
            </label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Ano
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resultado */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">Período selecionado:</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">
              {months[parseInt(month)]} de {year}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Limpar
            </Button>
            <Link className="flex-1" href={"#lista"}>
              <Button
                // onClick={handleApply}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Aplicar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
