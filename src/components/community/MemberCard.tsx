import Link from 'next/link';
import { User, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MemberCardProps {
  id: string;
  name: string;
  designation?: string;
  roles: string[];
  location: string;
  profileImage?: string;
}

export function MemberCard({ id, name, designation, roles, location, profileImage }: MemberCardProps) {
  return (
    <Link href={`/community/${id}`}>
      <Card hover className="group">
        <div className="flex items-start gap-4">
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImage} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tea-100 to-tea-200 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-tea-500" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-earth-800 group-hover:text-gamosa-600 transition-colors truncate">
              {name}
            </h3>
            <p className="text-sm text-earth-500 mt-0.5">{designation || 'Member'}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {roles.slice(0, 2).map((role) => (
                <Badge key={role} variant="tea">{role}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-earth-400">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
