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
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl text-gray-900">SAHA-Care</h1>
                        <p className="text-sm text-gray-500">Disease Surveillance System</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Badge
                        variant={isOnline ? 'default' : 'secondary'}
                        className={
                            isOnline
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-600'
                        }
                    >
                        {isOnline ? (
                            <Wifi className="h-3 w-3 mr-1" />
                        ) : (
                            <WifiOff className="h-3 w-3 mr-1" />
                        )}
                        {isOnline ? 'Online' : 'Offline'}
                    </Badge>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="relative"
                        onClick={() => navigate('/notifications')}
                    >
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            3
                        </span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 p-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={undefined} />
                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                        {getInitials(userProfile?.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm text-gray-900">
                                        {userProfile?.displayName ?? '—'}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {userProfile?.role ?? '—'}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

export default Header;
