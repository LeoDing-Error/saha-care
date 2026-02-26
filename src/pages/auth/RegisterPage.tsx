import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import { signUp } from '../../services/auth';
import { REGISTRATION_ROLES, ROLES, REGIONS } from '../../constants';
import type { UserRole } from '../../types';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<UserRole>('volunteer');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            navigate('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to register';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
