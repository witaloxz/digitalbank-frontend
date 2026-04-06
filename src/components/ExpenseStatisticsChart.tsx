import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Transaction {
  id: string;
  transactionType: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface ExpenseStatisticsProps {
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
}

const ExpenseStatisticsChart = ({ transactions, formatCurrency }: ExpenseStatisticsProps) => {
  const { t } = useTranslation();

  const getExpenseData = () => {
    let deposit = 0;
    let transfer = 0;
    let others = 0;

    transactions.forEach((tx) => {
      if (tx.transactionType === "DEPOSIT") {
        deposit += tx.amount;
      } else if (tx.transactionType === "TRANSFER") {
        transfer += tx.amount;
      } else {
        others += tx.amount;
      }
    });

    return [
      { name: t("dashboard.deposit"), value: deposit },
      { name: t("dashboard.transfer"), value: transfer },
      { name: t("dashboard.others"), value: others },
    ].filter((item) => item.value > 0);
  };

  const data = getExpenseData();
  const COLORS = ["hsl(233, 69%, 55%)", "hsl(174, 72%, 46%)", "hsl(0, 84%, 60%)"];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("dashboard.expenseStatistics")}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((entry, index) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseStatisticsChart;