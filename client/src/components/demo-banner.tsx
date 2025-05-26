import { AlertTriangle } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 mb-6 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0" />
      <div className="text-amber-100 text-sm">
        <strong>Demo Mode:</strong> This app is running with simulated weather data for demonstration purposes. 
        For live weather data, configure a real weather API service.
      </div>
    </div>
  );
}