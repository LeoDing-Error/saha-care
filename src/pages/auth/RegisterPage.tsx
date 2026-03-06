import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { signUp, signOut } from '../../services/auth';
import { REGISTRATION_ROLES, ROLES, REGIONS } from '../../constants';
import type { UserRole } from '../../types';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<UserRole>('volunteer');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!region) {
            setError('Please select a region');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, displayName, role, region);
            // Sign out so the pending user starts fresh at login
            await signOut();
            setRegistered(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to register';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Success screen after registration ---
    if (registered) {
        return (
            <Container maxWidth="xs">
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        py: 4,
                    }}
                >
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircleOutlineIcon
                            color="success"
                            sx={{ fontSize: 64, mb: 2 }}
                        />
                        <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
                            Registration Successful
                        </Typography>
                        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                            Your account has been created and is <strong>pending approval</strong> from a{' '}
                            {role === 'volunteer' ? 'supervisor' : 'health official'} in your region.
                            You will receive access once approved.
                        </Alert>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Region: {region} · Role: {ROLES[role]}
                        </Typography>
                        <Button
                            id="register-go-to-login"
                            variant="contained"
                            fullWidth
                            size="large"
                            component={RouterLink}
                            to="/login"
                            sx={{ mt: 3 }}
                        >
                            Go to Sign In
                        </Button>
                    </Paper>
                </Box>
            </Container>
        );
    }

    // --- Registration form ---
    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
                        SAHA-Care
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Create your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            id="register-name"
                            label="Full Name"
                            fullWidth
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            id="register-email"
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            id="register-password"
                            label="Password"
                            type="password"
                            fullWidth
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            id="register-confirm-password"
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="register-role-label">Role</InputLabel>
                            <Select
                                id="register-role"
                                labelId="register-role-label"
                                label="Role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                            >
                                {REGISTRATION_ROLES.map((r) => (
                                    <MenuItem key={r} value={r}>
                                        {ROLES[r]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="register-region-label">Region</InputLabel>
                            <Select
                                id="register-region"
                                labelId="register-region-label"
                                label="Region"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            >
                                {REGIONS.map((r) => (
                                    <MenuItem key={r} value={r}>
                                        {r}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            id="register-submit"
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account…' : 'Register'}
                        </Button>
                    </Box>

                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login">
                            Sign In
                        </Link>
                    </Typography>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        Your account will require approval before you can submit reports.
                    </Alert>
                </Paper>
            </Box>
        </Container>
    );
}
