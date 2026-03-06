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
} from '@mui/material';
import { signIn, getUserProfile, signOut } from '../../services/auth';
import type { UserRole } from '../../types';

const ROLE_HOME: Record<UserRole, string> = {
    volunteer: '/volunteer',
    supervisor: '/supervisor',
    official: '/official',
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [warning, setWarning] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setWarning('');
        setLoading(true);

        try {
            const user = await signIn(email, password);
            const profile = await getUserProfile(user.uid);

            if (!profile) {
                setError('Account profile not found. Please contact support.');
                await signOut();
                setLoading(false);
                return;
            }

            if (profile.status === 'pending') {
                const approver = profile.role === 'volunteer' ? 'supervisor' : 'health official';
                setInfo(
                    `Your account is pending approval from a ${approver} in your region. ` +
                    `You'll be able to access the app once approved.`
                );
                await signOut();
                setLoading(false);
                return;
            }

            if (profile.status === 'rejected') {
                const reason = profile.rejectionReason;
                setWarning(
                    `Your account registration was not approved.` +
                    (reason ? ` Reason: ${reason}` : '')
                );
                await signOut();
                setLoading(false);
                return;
            }

            // Approved — navigate to role home
            navigate(ROLE_HOME[profile.role] || '/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
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
                }}
            >
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
                        SAHA-Care
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Sign in to continue
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {info && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {info}
                        </Alert>
                    )}
                    {warning && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {warning}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            id="login-email"
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
                            id="login-password"
                            label="Password"
                            type="password"
                            fullWidth
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            id="login-submit"
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </Button>
                    </Box>

                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/register">
                            Register
                        </Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
