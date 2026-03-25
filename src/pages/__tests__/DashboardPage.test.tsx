import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';
import type { Alert } from '../../types';

// Track subscribe calls
let subscribeCalls: Array<{ region: string | undefined; callback: (alerts: Alert[]) => void }> = [];
let unsubSpy = vi.fn();

vi.mock('../../services/dashboard', () => ({
    subscribeToAlerts: (region: string | undefined, callback: (alerts: Alert[]) => void) => {
        subscribeCalls.push({ region, callback });
        return unsubSpy;
    },
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        userProfile: { role: 'official', region: undefined },
    }),
}));

const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
    id: 'alert-1',
    disease: 'AWD',
    region: 'North Gaza',
    caseCount: 10,
    threshold: 5,
    windowHours: 24,
    severity: 'critical',
    status: 'active',
    immediateAlert: false,
    createdAt: new Date(),
    ...overrides,
});

describe('DashboardPage refresh', () => {
    beforeEach(() => {
        subscribeCalls = [];
        unsubSpy = vi.fn();
    });

    it('renders the Refresh button', () => {
        render(<DashboardPage />);
        expect(screen.getByText('Refresh')).toBeTruthy();
    });

    it('subscribes to alerts on mount', () => {
        render(<DashboardPage />);
        expect(subscribeCalls.length).toBe(1);
    });

    it('shows loading state initially then renders alerts after callback', async () => {
        render(<DashboardPage />);
        expect(screen.getByText('Loading alerts...')).toBeTruthy();

        act(() => {
            subscribeCalls[0].callback([makeAlert()]);
        });

        await waitFor(() => {
            expect(screen.getByText('10 cases')).toBeTruthy();
        });
    });

    it('clicking Refresh re-subscribes and shows loading state', async () => {
        render(<DashboardPage />);

        // Initial subscription fires
        act(() => {
            subscribeCalls[0].callback([makeAlert()]);
        });
        await waitFor(() => expect(screen.getByText('10 cases')).toBeTruthy());

        // Click refresh
        fireEvent.click(screen.getByText('Refresh'));

        // Should have unsubscribed from old and created new subscription
        expect(unsubSpy).toHaveBeenCalled();
        expect(subscribeCalls.length).toBe(2);

        // Should show loading state
        expect(screen.getByText('Loading alerts...')).toBeTruthy();

        // Fire new data
        act(() => {
            subscribeCalls[1].callback([makeAlert({ disease: 'SARI', caseCount: 20 })]);
        });
        await waitFor(() => {
            expect(screen.getByText('20 cases')).toBeTruthy();
        });
    });

    it('updates "Last updated" text after data arrives', async () => {
        render(<DashboardPage />);

        // Before data: shows default
        expect(screen.getByText(/Last updated:.*just now/i)).toBeTruthy();

        // Fire callback
        act(() => {
            subscribeCalls[0].callback([makeAlert()]);
        });

        await waitFor(() => {
            // After data arrives, should still show "Just now" (since <1 min elapsed)
            expect(screen.getByText(/Last updated:.*Just now/i)).toBeTruthy();
        });
    });
});
