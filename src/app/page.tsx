import SelectMonth from "@/components/selectMonth";
import TableMonth from "@/components/tableMonth";

export default function Home() {
  return (
    <div className="mx-auto py-4 px-4 flex w-full items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-2xl grid grid-cols-1 gap-5">
        <SelectMonth />
        <TableMonth />
      </div>
    </div>
  );
}
