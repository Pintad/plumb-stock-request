
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy } from 'lucide-react';
import { TopRequesterData } from '@/hooks/useDashboardData';

interface TopRequestersChartProps {
  topRequestersData: TopRequesterData[];
  chartConfig: {
    pending: { color: string; label: string };
    inProgress: { color: string; label: string };
    completed: { color: string; label: string };
    items: { color: string; label: string };
  };
  isMobile?: boolean;
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

const TopRequestersChart = ({ topRequestersData, chartConfig, isMobile = false }: TopRequestersChartProps) => {
  return (
    <Card>
      <CardHeader className={`flex flex-row justify-between items-center ${isMobile ? 'pb-2 pt-3 px-3' : ''}`}>
        <div>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Meilleurs anticipateurs</CardTitle>
          <CardDescription className={isMobile ? 'text-xs' : ''}>Ouvriers avec le plus de demandes planifiées</CardDescription>
        </div>
        <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-amber-500`} />
      </CardHeader>
      <CardContent className={`${isMobile ? 'pt-0 px-3 pb-3' : 'pt-0'}`}>
        <ChartContainer
          config={chartConfig}
          className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} mt-4`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topRequestersData}
              margin={{ top: 5, right: 20, left: isMobile ? 60 : 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={isMobile ? 60 : 100}
                tick={{ fontSize: isMobile ? 8 : 12 }}
                tickFormatter={(value) => {
                  const maxLength = isMobile ? 8 : 12;
                  return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
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
