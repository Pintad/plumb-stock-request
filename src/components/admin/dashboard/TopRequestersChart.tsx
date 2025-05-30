
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
const CustomWorkerTooltip = ({ active, payload, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className={`bg-white p-2 rounded-md shadow-md border border-gray-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <p className="font-semibold">{data.name}</p>
        <p>Anticipées: {data.anticipatedOrders}</p>
        <p>Total: {data.orderCount}</p>
        <p>Articles: {data.itemCount}</p>
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
      <CardContent className={`${isMobile ? 'pt-0 px-2 pb-2' : 'pt-0'}`}>
        <ChartContainer
          config={chartConfig}
          className={`${isMobile ? 'h-[180px]' : 'h-[300px]'} mt-4`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topRequestersData}
              margin={{ 
                top: 5, 
                right: isMobile ? 10 : 20, 
                left: isMobile ? 80 : 40, 
                bottom: 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis 
                type="number" 
                allowDecimals={false} 
                tick={{ fontSize: isMobile ? 8 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={isMobile ? 80 : 100}
                tick={{ fontSize: isMobile ? 7 : 12 }}
                tickFormatter={(value) => {
                  const maxLength = isMobile ? 10 : 12;
                  return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
                }}
              />
              <Tooltip content={<CustomWorkerTooltip isMobile={isMobile} />} />
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
