import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  id: string;
  transactionType: "DEPOSIT" | "WITHDRAW";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface BalanceHistoryProps {
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
}

const BalanceHistoryChart = ({ transactions, formatCurrency }: BalanceHistoryProps) => {
  const { t } = useTranslation();

  const getBalanceHistory = () => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let balance = 0;
    const history = sorted.map((tx) => {
      balance += tx.transactionType === "DEPOSIT" ? tx.amount : -tx.amount;
      return {
        date: new Date(tx.createdAt).toLocaleDateString(),
        balance,
      };
    });
    return history;
  };

  const data = getBalanceHistory();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("dashboard.balanceHistory")}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(233, 69%, 55%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(233, 69%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(228,25%,91%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(228,12%,55%)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(228,12%,55%)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid hsl(228,25%,91%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(233, 69%, 55%)"
            strokeWidth={2}
            fill="url(#balanceGrad)"
            name={t("dashboard.balance")}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceHistoryChart;