import { Spinner } from '@/components/ui/Spinner';

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
