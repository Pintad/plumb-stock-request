
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy } from 'lucide-react';

interface TopRequesterData {
  name: string;
  orderCount: number;
  itemCount: number;
  anticipatedOrders: number;
}

interface TopRequestersChartProps {
  topRequestersData: TopRequesterData[];
  chartConfig: {
    pending: { color: string; label: string };
    inProgress: { color: string; label: string };
    completed: { color: string; label: string };
    items: { color: string; label: string };
  };
}

// Composant personnalisé pour le tooltip du graphique des ouvriers
const CustomWorkerTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
        <p className="font-semibold">{data.name}</p>
        <p>Commandes anticipées: {data.anticipatedOrders}</p>
        <p>Total commandes: {data.orderCount}</p>
        <p>Total articles: {data.itemCount}</p>
      </div>
    );
  }

  return null;
};

const TopRequestersChart = ({ topRequestersData, chartConfig }: TopRequestersChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg">Meilleurs anticipateurs</CardTitle>
          <CardDescription>Ouvriers avec le plus de demandes planifiées</CardDescription>
        </div>
        <Trophy className="h-6 w-6 text-amber-500" />
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] mt-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topRequestersData}
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tickFormatter={(value) => {
                  return value.length > 12 ? `${value.substring(0, 12)}...` : value;
                }}
              />
              <Tooltip content={<CustomWorkerTooltip />} />
              <Bar 
                dataKey="anticipatedOrders" 
                name="Commandes anticipées" 
                fill="#f97316"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopRequestersChart;
