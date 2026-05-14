import { MemberCard } from './MemberCard';

interface Member {
  id: string;
  name: string;
  designation?: string;
  roles: string[];
  location: string;
  profileImage?: string;
}

interface MemberGridProps {
  members: Member[];
}

export function MemberGrid({ members }: MemberGridProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-earth-500">No members found.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {members.map((member) => (
        <MemberCard key={member.id} {...member} />
      ))}
    </div>
  );
}
