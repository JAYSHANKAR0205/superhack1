import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/KPICard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Upload, List, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Asset } from '@/types/asset';
import { mockAssets, mockKPIs, mockChartData } from '@/lib/mockData';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [kpis, setKpis] = useState(mockKPIs);

  useEffect(() => {
    const stored = localStorage.getItem('assets');
    const currentAssets = stored ? JSON.parse(stored) : mockAssets;
    setAssets(currentAssets);

    // Calculate real KPIs
    const total = currentAssets.length;
    const recovered = currentAssets.filter((a: Asset) => a.status === 'Recovered').length;
    const recoveredValue = currentAssets
      .filter((a: Asset) => a.status === 'Recovered')
      .reduce((sum: number, a: Asset) => sum + a.value, 0);

    setKpis({
      recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
      totalValueRecovered: recoveredValue,
      outreachSuccessRate: mockKPIs.outreachSuccessRate
    });
  }, []);

  const statusData = [
    {
      name: 'Active',
      value: assets.filter(a => a.status === 'Active').length,
      color: 'hsl(var(--muted))'
    },
    {
      name: 'Missing',
      value: assets.filter(a => a.status === 'Missing').length,
      color: 'hsl(var(--warning))'
    },
    {
      name: 'Recovered',
      value: assets.filter(a => a.status === 'Recovered').length,
      color: 'hsl(var(--success))'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">ReclaimIT</h1>
              </div>
              <nav className="flex gap-4">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="ghost" onClick={() => navigate('/assets')}>
                  <List className="mr-2 h-4 w-4" />
                  Assets
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Recovery Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Monitor asset recovery performance and trends
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Recovery Rate"
              value={kpis.recoveryRate.toFixed(1)}
              suffix="%"
              icon={Target}
              trend={{ value: 12.5, isPositive: true }}
            />
            <KPICard
              title="Total Value Recovered"
              value={`$${kpis.totalValueRecovered.toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 8.3, isPositive: true }}
            />
            <KPICard
              title="Outreach Success Rate"
              value={kpis.outreachSuccessRate.toFixed(1)}
              suffix="%"
              icon={TrendingUp}
              trend={{ value: 5.2, isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recovery Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData.recoveryTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="recovered"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Recovered Assets"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
