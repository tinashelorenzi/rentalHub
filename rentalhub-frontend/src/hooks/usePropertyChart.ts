// src/hooks/usePropertyChart.ts
import { useState, useEffect } from 'react';
import { PropertyService } from '../services/property.service';

interface ChartData {
  status: string[];
  counts: number[];
  loading: boolean;
  error: Error | null;
}

export function usePropertyStatusChart() {
  const [chartData, setChartData] = useState<ChartData>({
    status: [],
    counts: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const properties = await PropertyService.getProperties();
        
        // Count properties by status
        const statusCount: Record<string, number> = {};
        
        properties.forEach(property => {
          statusCount[property.status] = (statusCount[property.status] || 0) + 1;
        });
        
        // Prepare data for chart
        const status = Object.keys(statusCount);
        const counts = status.map(s => statusCount[s]);
        
        setChartData({
          status,
          counts,
          loading: false,
          error: null
        });
      } catch (error) {
        setChartData({
          status: [],
          counts: [],
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to fetch property data')
        });
      }
    };

    fetchData();
  }, []);

  return chartData;
}