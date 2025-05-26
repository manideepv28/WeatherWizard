import { useEffect, useRef } from "react";
import { TrendingUp, CloudRain } from "lucide-react";
import type { WeatherData, Forecast } from "@shared/schema";

interface ChartsProps {
  location: { lat: number; lon: number; name?: string };
  currentWeather: WeatherData | null;
  forecasts: Forecast[] | null;
}

declare global {
  interface Window {
    Chart: any;
  }
}

export default function Charts({ location, currentWeather, forecasts }: ChartsProps) {
  const tempChartRef = useRef<HTMLCanvasElement>(null);
  const precipChartRef = useRef<HTMLCanvasElement>(null);
  const tempChartInstance = useRef<any>(null);
  const precipChartInstance = useRef<any>(null);

  useEffect(() => {
    // Load Chart.js dynamically
    const loadChartJS = async () => {
      if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
          initializeCharts();
        };
        document.head.appendChild(script);
      } else {
        initializeCharts();
      }
    };

    loadChartJS();

    return () => {
      if (tempChartInstance.current) {
        tempChartInstance.current.destroy();
      }
      if (precipChartInstance.current) {
        precipChartInstance.current.destroy();
      }
    };
  }, [forecasts]);

  const initializeCharts = () => {
    if (!forecasts || !window.Chart) return;

    const labels = forecasts.map(f => 
      new Date(f.date).toLocaleDateString("en-US", { weekday: "short" })
    );
    const highs = forecasts.map(f => f.tempHigh);
    const lows = forecasts.map(f => f.tempLow);
    const precipitation = forecasts.map(f => f.precipitation || 0);

    // Temperature Chart
    if (tempChartRef.current) {
      if (tempChartInstance.current) {
        tempChartInstance.current.destroy();
      }

      const tempCtx = tempChartRef.current.getContext('2d');
      tempChartInstance.current = new window.Chart(tempCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'High',
            data: highs,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Low',
            data: lows,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          },
          scales: {
            x: { 
              ticks: { color: 'white' }, 
              grid: { color: 'rgba(255,255,255,0.1)' } 
            },
            y: { 
              ticks: { 
                color: 'white',
                callback: function(value: any) {
                  return Math.round(value) + '°C';
                }
              }, 
              grid: { color: 'rgba(255,255,255,0.1)' } 
            }
          }
        }
      });
    }

    // Precipitation Chart
    if (precipChartRef.current) {
      if (precipChartInstance.current) {
        precipChartInstance.current.destroy();
      }

      const precipCtx = precipChartRef.current.getContext('2d');
      precipChartInstance.current = new window.Chart(precipCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Precipitation (mm)',
            data: precipitation,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3B82F6',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          },
          scales: {
            x: { 
              ticks: { color: 'white' }, 
              grid: { color: 'rgba(255,255,255,0.1)' } 
            },
            y: { 
              ticks: { 
                color: 'white',
                callback: function(value: any) {
                  return value + 'mm';
                }
              }, 
              grid: { color: 'rgba(255,255,255,0.1)' } 
            }
          }
        }
      });
    }
  };

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Temperature Trend Chart */}
        <div className="glass rounded-2xl p-6 weather-card fade-in">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Temperature Trend (7 Days)
          </h3>
          <div className="h-64">
            <canvas ref={tempChartRef}></canvas>
          </div>
        </div>

        {/* Precipitation Chart */}
        <div className="glass rounded-2xl p-6 weather-card fade-in">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <CloudRain className="mr-2 h-5 w-5" />
            Precipitation (7 Days)
          </h3>
          <div className="h-64">
            <canvas ref={precipChartRef}></canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
