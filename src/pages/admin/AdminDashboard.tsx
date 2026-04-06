import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftRight, DollarSign, Loader2, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService, AdminStats, MonthlyData, StatusDistribution } from "@/service/admin.service";

interface RecentTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | string;
  from: string;
  to: string;
  amount: number;
  date: string;
}

interface CombinedChartData {
  month: string;
  users: number;
  transactions: number;
}

const AdminDashboard = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [monthlyUsers, setMonthlyUsers] = useState<MonthlyData[]>([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminService.getStats();
        setStats(data);
      } catch {
        toast.error("Erro ao carregar estatísticas");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const { data } = await adminService.getTransactions(0, 5, undefined, undefined, undefined);

        setRecentTransactions(data.content);
      } catch {
        toast.error("Erro ao carregar atividade recente");
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [usersResponse, transactionsResponse, revenueResponse, statusResponse] =
          await Promise.all([
            adminService.getMonthlyUsers(6),
            adminService.getMonthlyTransactions(6),
            adminService.getMonthlyRevenue(6),
            adminService.getStatusDistribution(),
          ]);

        setMonthlyUsers(usersResponse.data);
        setMonthlyTransactions(transactionsResponse.data);
        setMonthlyRevenue(revenueResponse.data);
        setStatusDistribution(statusResponse.data);
      } catch {
        toast.error("Erro ao carregar dados dos gráficos");
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "agora";
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;

    return `${diffDays} d atrás`;
  };

  const getActionText = (transaction: RecentTransaction) => {
    switch (transaction.type) {
      case "deposit":
        return "Depósito recebido";
      case "withdrawal":
        return "Saque realizado";
      case "transfer":
        return "Transferência enviada";
      default:
        return "Transação";
    }
  };

  const combinedChartData = useMemo<CombinedChartData[]>(() => {
    return monthlyUsers.map((userItem, index) => ({
      month: userItem.month,
      users: userItem.value,
      transactions: monthlyTransactions[index]?.value || 0,
    }));
  }, [monthlyUsers, monthlyTransactions]);

  const totalStatusDistribution = useMemo(() => {
    return statusDistribution.reduce((sum, item) => sum + item.value, 0);
  }, [statusDistribution]);

  const kpis = useMemo(
    () => [
      {
        label: t("admin.dashboard.totalUsers"),
        value: stats?.totalUsers?.toLocaleString() || "0",
        icon: Users,
      },
      {
        label: t("admin.dashboard.totalTransactions"),
        value: stats?.totalTransactions?.toLocaleString() || "0",
        icon: ArrowLeftRight,
      },
      {
        label: t("admin.dashboard.totalRevenue"),
        value: formatCurrency(stats?.totalRevenue || 0),
        icon: DollarSign,
      },
      {
        label: t("admin.dashboard.growthRate"),
        value: stats?.totalPendingLoans?.toString() || "0",
        icon: TrendingUp,
      },
    ],
    [stats, t]
  );

  if (loadingStats || loadingActivity || loadingCharts) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <kpi.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.dashboard.usersAndTransactions")}</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name={t("admin.dashboard.users")}
                />
                <Bar
                  dataKey="transactions"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                  name={t("admin.dashboard.transactions")}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.dashboard.revenueOverview")}</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name={t("admin.dashboard.revenue")}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.dashboard.transactionStatus")}</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {statusDistribution.map((entry) => {
                const percentage =
                  totalStatusDistribution > 0
                    ? ((entry.value / totalStatusDistribution) * 100).toFixed(0)
                    : "0";

                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("admin.dashboard.recentActivity")}</CardTitle>

            <Link to="/admin/transactions">
              <Button variant="link" className="text-sm">
                Ver todas
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">Nenhuma transação recente</div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getActionText(transaction)} • {transaction.from} → {transaction.to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatRelativeDate(transaction.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;