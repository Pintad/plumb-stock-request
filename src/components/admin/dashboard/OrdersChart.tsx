
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
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pending = payload.find((p: any) => p.name === "En attente")?.value || 0;
    const completed = payload.find((p: any) => p.name === "Terminées")?.value || 0;
    const total = pending + completed;
    
    return (
      <div className={`bg-white p-2 rounded-md shadow-md border border-gray-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-amber-600">En attente: {pending}</p>
        <p className="text-green-600">Terminées: {completed}</p>
        <p className="mt-1 pt-1 border-t border-gray-200 font-medium">Total: {total}</p>
      </div>
    );
  }

  return null;
};

const OrdersChart = ({ ordersByDateData, chartConfig, isMobile = false }: OrdersChartProps) => {
  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-2 pt-3 px-3' : ''}>
        <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Évolution des demandes</CardTitle>
        <CardDescription className={isMobile ? 'text-xs' : ''}>Sur les 14 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'pt-0 px-2 pb-2' : 'pt-0'}`}>
        <ChartContainer
          config={chartConfig}
          className={`${isMobile ? 'h-[180px]' : 'h-[300px]'} mt-4`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ordersByDateData}
              margin={{ 
                top: 5, 
                right: isMobile ? 10 : 5, 
                left: isMobile ? 5 : 5, 
                bottom: isMobile ? 40 : 25 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="displayDate" 
                angle={-90}
                textAnchor="end"
                height={isMobile ? 40 : 60}
                tick={{ fontSize: isMobile ? 8 : 12 }}
                interval={isMobile ? 1 : 0}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: isMobile ? 8 : 12 }}
                width={isMobile ? 25 : 40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="pending" 
                name="En attente" 
                stackId="a" 
                fill={chartConfig.pending.color} 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                name="Terminées" 
                stackId="a" 
                fill={chartConfig.completed.color}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
