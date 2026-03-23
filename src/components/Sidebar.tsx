import { LayoutDashboard, BookOpen, FileText, MessageSquare, Users, PlusCircle, MapPin } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

export function Sidebar() {
    const { userProfile } = useAuth();
    const role = userProfile?.role;

    // Build nav items based on role
    const navItems: NavItem[] = [];

    if (role === 'volunteer') {
        navItems.push(
            { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
            { to: '/guide', icon: <BookOpen className="w-5 h-5" />, label: 'Guide' },
            { to: '/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
        );
    } else if (role === 'supervisor') {
        navItems.push(
            { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
            { to: '/guide', icon: <BookOpen className="w-5 h-5" />, label: 'Guide' },
            { to: '/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
            { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
            { to: '/volunteers', icon: <Users className="w-5 h-5" />, label: 'Volunteers' },
        );
    } else if (role === 'official') {
        navItems.push(
            { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
            { to: '/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
            { to: '/volunteers', icon: <Users className="w-5 h-5" />, label: 'Supervisors' },
        );
    }

    const showSubmitButton = role === 'volunteer' || role === 'supervisor';

    return (
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col fixed left-0 top-16">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            [
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                            ].join(' ')
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Submit report CTA */}
            {showSubmitButton && (
                <div className="p-4 border-t border-gray-100">
                    <NavLink to="/report/new">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Submit Report
                        </Button>
                    </NavLink>
                </div>
            )}

            {/* Region widget */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span className="truncate">{userProfile?.region || 'Unknown Region'}</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
