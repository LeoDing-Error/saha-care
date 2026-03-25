import { LayoutDashboard, BookOpen, FileText, MessageSquare, Users, PlusCircle, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
    to: string;
    icon: LucideIcon;
    label: string;
}

export function Sidebar() {
    const { userProfile } = useAuth();
    const role = userProfile?.role;

    const navItems: NavItem[] = [];

    if (role === 'volunteer') {
        navItems.push(
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/guide', icon: BookOpen, label: 'Guide' },
            { to: '/reports', icon: FileText, label: 'Reports' },
            { to: '/messages', icon: MessageSquare, label: 'Messages' },
        );
    } else if (role === 'supervisor') {
        navItems.push(
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/guide', icon: BookOpen, label: 'Guide' },
            { to: '/reports', icon: FileText, label: 'Reports' },
            { to: '/messages', icon: MessageSquare, label: 'Messages' },
            { to: '/volunteers', icon: Users, label: 'Volunteers' },
        );
    } else if (role === 'official') {
        navItems.push(
            { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/reports', icon: FileText, label: 'Reports' },
            { to: '/volunteers', icon: Users, label: 'Supervisors' },
        );
    }

    const showSubmitButton = role === 'volunteer' || role === 'supervisor';

    return (
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 p-4">
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                        >
                            {({ isActive }) => (
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    className={`w-full justify-start h-12 ${
                                        isActive
                                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    asChild
                                >
                                    <span>
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                    </span>
                                </Button>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {showSubmitButton && (
                <div className="mt-6">
                    <NavLink to="/report/new">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Submit Report
                        </Button>
                    </NavLink>
                </div>
            )}

            <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="text-xs text-teal-800 mb-1">Your Region</div>
                <div className="text-sm text-teal-900">
                    {userProfile?.region || 'Unknown Region'}
                </div>
                <div className="mt-3 text-xs text-teal-600">12 Active Volunteers</div>
                <div className="mt-1 w-full bg-teal-200 rounded-full h-1.5">
                    <div className="w-4/5 bg-teal-600 h-1.5 rounded-full"></div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
