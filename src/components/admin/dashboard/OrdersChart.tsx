
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer,
  ChartLegend
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface OrdersByDateData {
  date: string;
  displayDate: string;
  pending: number;
  inProgress: number;
  completed: number;
}

interface OrdersChartProps {
  ordersByDateData: OrdersByDateData[];
  chartConfig: {
    pending: { color: string; label: string };
    inProgress: { color: string; label: string };
    completed: { color: string; label: string };
    items: { color: string; label: string };
  };
  isMobile?: boolean;
}

// Composant personnalisé pour le tooltip du graphique d'évolution
const CustomTooltip = ({ active, payload, label, isMobile }: any) => {
  if (active && payload && payload.length) {
    const pending = payload.find((p: any) => p.name === "En attente")?.value || 0;
    const inProgress = payload.find((p: any) => p.name === "En cours")?.value || 0;
    const completed = payload.find((p: any) => p.name === "Terminées")?.value || 0;
    const total = pending + inProgress + completed;
    
    return (
      <div className={`bg-white p-3 rounded-md shadow-lg border border-gray-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-amber-600">En attente: {pending}</p>
        <p className="text-blue-500">En cours: {inProgress}</p>
        <p className="text-green-600">Terminées: {completed}</p>
        <p className="mt-2 pt-1 border-t border-gray-200 font-medium">Total: {total}</p>
      </div>
    );
  }

  return null;
};

const OrdersChart = ({ ordersByDateData, chartConfig, isMobile = false }: OrdersChartProps) => {
  return (
    <Card className="h-full">
      <CardHeader className={isMobile ? 'pb-2 pt-3 px-3' : 'pb-4'}>
        <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Évolution des demandes</CardTitle>
        <CardDescription className={isMobile ? 'text-xs' : ''}>Sur les 14 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'pt-0 px-2 pb-3' : 'pt-0 pb-6'}`}>
        <ChartContainer
          config={chartConfig}
          className={`${isMobile ? 'h-[160px]' : 'h-[280px]'} w-full`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ordersByDateData}
              margin={{ 
                top: 10, 
                right: isMobile ? 5 : 15, 
                left: isMobile ? -5 : 0, 
                bottom: isMobile ? 35 : 20 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                angle={isMobile ? -90 : -45}
                textAnchor="end"
                height={isMobile ? 35 : 50}
                tick={{ fontSize: isMobile ? 9 : 11 }}
                interval={isMobile ? 1 : 0}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: isMobile ? 9 : 11 }}
                width={isMobile ? 30 : 45}
              />
              <Tooltip content={<CustomTooltip isMobile={isMobile} />} />
              <Bar 
                dataKey="pending" 
                name="En attente" 
                stackId="a" 
                fill={chartConfig.pending.color} 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="inProgress" 
                name="En cours" 
                stackId="a" 
                fill={chartConfig.inProgress.color} 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                name="Terminées" 
                stackId="a" 
                fill={chartConfig.completed.color}
                radius={[3, 3, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
