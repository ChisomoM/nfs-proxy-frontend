import { useAuth } from '@/lib/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopNavBar() {
  const { user } = useAuth();

  // Get user display name and email
  const getUserDisplayName = () => {
    if (user?.team_member) {
      return `${user.team_member.first_name} ${user.team_member.last_name}`;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-transparent backdrop-blur-sm">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Logo - Left */}
        <a href="/" className="flex items-center gap-2">
          Logo
        </a>

        {/* User Profile - Right */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-full mt-4 px-6 py-3  border border-gray-200/50">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
            <p className="text-xs text-gray-600">{getUserEmail()}</p>
          </div>
          <Avatar className="h-10 w-10 ring-2 ring-primary-blue/10">
            <AvatarImage src="" alt={getUserDisplayName()} />
            <AvatarFallback className="bg-primary-blue text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
