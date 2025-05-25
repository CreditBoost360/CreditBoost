import React, { useContext } from 'react';
import { 
  User, 
  LogOut} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';

// User Account Dropdown Component
const UserAccountDropdown = () => {
    const { user, logout } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
    };
  
    const handleProfileClick = () => {
      navigate('/account-settings');
    };
  
    // Get user initials for avatar fallback
    const getInitials = () => {
      if (!user) return 'U';
      
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName[0].toUpperCase();
      } else if (user.email) {
        return user.email[0].toUpperCase();
      }
      
      return 'U';
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 hover:bg-accent rounded-full p-2">
          <Avatar className="h-8 w-8">
            {user?.profileImage ? (
              <AvatarImage loading="lazy" fetchPriority="high" src={user.profileImage} alt={user?.firstName || 'User'} />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center p-2 space-x-2">
          <Avatar className="h-8 w-8">
            {user?.profileImage ? (
              <AvatarImage loading="lazy" fetchPriority="high" src={user.profileImage} alt={user?.firstName || 'User'} />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.firstName || 'User'} {user?.lastName || ''}</span>
            <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export { UserAccountDropdown };