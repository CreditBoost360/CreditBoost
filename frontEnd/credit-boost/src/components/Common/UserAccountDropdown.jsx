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
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';

// User Account Dropdown Component
const UserAccountDropdown = () => {
    const { user } = useContext(AppContext)
    const navigate = useNavigate();

    const handleLogout = () => {
      authService.logout();
      navigate('/login');
    };
  
    const handleProfileClick = () => {
      navigate('/account-settings');
    };
  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 hover:bg-accent rounded-full p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage loading="lazy" fetchPriority="high" src="/api/placeholder/32/32" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center p-2 space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage loading="lazy" fetchPriority="high" src="/api/placeholder/32/32" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.firstName}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
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