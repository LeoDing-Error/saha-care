import { User, LogOut, Bell, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { signOut } from '../services/auth';

function getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function Header() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const isOnline = useOfflineStatus();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="font-semibold text-gray-900 text-lg">Saha Care</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
                {/* Online / Offline indicator */}
                <div className="flex items-center gap-1.5">
                    {isOnline ? (
                        <>
                            <Wifi className="w-4 h-4 text-teal-600" />
                            <span className="text-xs text-teal-600 font-medium hidden sm:inline">Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-amber-500" />
                            <Badge
                                variant="outline"
                                className="text-xs text-amber-600 border-amber-400 bg-amber-50 hidden sm:flex"
                            >
                                Offline
                            </Badge>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
                    <Bell className="w-5 h-5 text-gray-600" />
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                                    {getInitials(userProfile?.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-900 leading-none">
                                    {userProfile?.displayName ?? '—'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize leading-none mt-0.5">
                                    {userProfile?.role ?? '—'}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default Header;
