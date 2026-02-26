import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/auth';
import { ROLES } from '../constants';
import OfflineIndicator from '../components/common/OfflineIndicator';

const DRAWER_WIDTH = 240;

export default function AppLayout() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Navigation items based on user role
    const getNavItems = () => {
        if (!userProfile) return [];

        switch (userProfile.role) {
            case 'volunteer':
                return [
                    { label: 'My Reports', path: '/volunteer', icon: <AssignmentIcon /> },
                    { label: 'New Report', path: '/volunteer/report', icon: <AddCircleIcon /> },
                ];
            case 'supervisor':
                return [
                    { label: 'Dashboard', path: '/supervisor', icon: <DashboardIcon /> },
                ];
            case 'official':
                return [
                    { label: 'Dashboard', path: '/official', icon: <DashboardIcon /> },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" fontWeight={700}>
                    SAHA-Care
                </Typography>
            </Toolbar>
            <Divider />
            {userProfile && (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                        {userProfile.displayName}
                    </Typography>
                    <Chip
                        label={ROLES[userProfile.role]}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        {userProfile.region}
                    </Typography>
                </Box>
            )}
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleSignOut}>
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Sign Out" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" fontWeight={700}>
                        SAHA-Care
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
                }}
                open
            >
                {drawer}
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: '64px',
                }}
            >
                <Outlet />
            </Box>
            <OfflineIndicator />
        </Box>
    );
}
