import { cn } from '@/lib/utils/cn';

interface DonationImpactProps {
  current: number;
  goal: number;
}

export function DonationImpact({ current, goal }: DonationImpactProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="bg-white rounded-xl border border-earth-200 p-6">
      <h3 className="font-heading font-semibold text-earth-800 mb-2">Annual Donation Goal</h3>
      <div className="flex items-end justify-between mb-3">
        <span className="text-2xl font-bold text-gamosa-600">${current.toLocaleString()}</span>
        <span className="text-sm text-earth-500">of ${goal.toLocaleString()} goal</span>
      </div>
      <div className="w-full h-3 bg-earth-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gamosa-500 to-muga-500 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-earth-500 mt-2">{Math.round(percentage)}% of annual goal reached</p>
    </div>
  );
}
