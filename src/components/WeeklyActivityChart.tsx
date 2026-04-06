import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  id: string;
  transactionType: "DEPOSIT" | "WITHDRAW";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface WeeklyActivityProps {
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
}

const WeeklyActivityChart = ({ transactions, formatCurrency }: WeeklyActivityProps) => {
  const { t } = useTranslation();

  const getWeeklyData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = days.map((day) => ({ day, deposit: 0, withdraw: 0 }));

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const dayName = days[date.getDay()];
      const dayData = data.find((d) => d.day === dayName);
      if (dayData) {
        if (tx.transactionType === "DEPOSIT") {
          dayData.deposit += tx.amount;
        } else {
          dayData.withdraw += tx.amount;
        }
      }
    });
    return data;
  };

  const data = getWeeklyData();

  return (
    <div className="rounded-2xl border border-border bg-card p-11">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{t("dashboard.weeklyActivity")}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(228, 25%, 91%)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(228, 12%, 55%)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(228, 12%, 55%)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(228, 25%, 91%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "hsl(228, 12%, 55%)" }}
          />
          <Bar
            dataKey="deposit"
            fill="hsl(233, 69%, 55%)"
            radius={[6, 6, 0, 0]}
            name={t("dashboard.deposit")}
          />
          <Bar
            dataKey="withdraw"
            fill="hsl(174, 72%, 46%)"
            radius={[6, 6, 0, 0]}
            name={t("dashboard.withdraw")}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyActivityChart;