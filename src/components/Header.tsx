import React from 'react';
import { useTelegramContext } from '@/context/TelegramContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isInTelegram } = useTelegramContext();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-primary">FreelanceHub</h1>
          <p className="text-sm text-muted-foreground">Platform Jasa Digital</p>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user.first_name} {user.last_name}
              </p>
              {user.username && (
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              )}
              {!isInTelegram && (
                <p className="text-xs text-yellow-600">Mode Development</p>
              )}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photo_url} alt={user.first_name} />
              <AvatarFallback>
                {user.photo_url ? (
                  getInitials(user.first_name, user.last_name)
                ) : (
                  <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
};