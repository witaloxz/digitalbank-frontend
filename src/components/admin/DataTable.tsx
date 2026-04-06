import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessor: keyof T | ((row: T) => ReactNode);
    className?: string;
  }[];
  data: T[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {t("admin.common.loading") || "Carregando..."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    {emptyMessage || t("admin.common.noData") || "Nenhum registro encontrado."}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/20">
                    {columns.map((col, j) => (
                      <TableCell key={j} className={col.className}>
                        {typeof col.accessor === "function"
                          ? col.accessor(row)
                          : (row[col.accessor] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t("admin.common.page") || "Página"} {page + 1} {t("admin.common.of") || "de"} {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isLoading}
              onClick={() => onPageChange(page - 1)}
              className="h-9 gap-1 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("admin.common.previous") || "Anterior"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
              className="h-9 gap-1 rounded-lg"
            >
              {t("admin.common.next") || "Próxima"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}