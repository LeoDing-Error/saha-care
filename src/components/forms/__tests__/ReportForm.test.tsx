import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportForm from '../ReportForm';
import {
  mockFirebaseUser,
  mockUserProfile,
  mockCaseDefinition,
  resetFirebaseMocks,
} from '../../../test/mocks/firebase';

// Mock useAuth hook
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    firebaseUser: mockFirebaseUser,
    userProfile: mockUserProfile,
    loading: false,
    refreshProfile: vi.fn(),
  }),
}));

// Mock useCaseDefinitions hook
vi.mock('../../../hooks/useCaseDefinitions', () => ({
  useCaseDefinitions: () => ({
    definitions: [mockCaseDefinition],
    loading: false,
    error: null,
  }),
}));

// Mock location utils
vi.mock('../../../utils/location', () => ({
  getCurrentPosition: vi.fn().mockResolvedValue({
    lat: 31.5,
    lng: 34.45,
  }),
}));

// Mock createReport
const mockCreateReport = vi.fn().mockResolvedValue('new-report-id');
vi.mock('../../../services/reports', () => ({
  createReport: (...args: unknown[]) => mockCreateReport(...args),
}));

const renderReportForm = (onSuccess?: () => void) => {
  return render(<ReportForm onSuccess={onSuccess} />);
};

describe('ReportForm', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.clearAllMocks();
    mockCreateReport.mockResolvedValue('new-report-id');
  });

  describe('Step 1: Disease Selection', () => {
    it('renders disease selection step', () => {
      renderReportForm();

      expect(screen.getAllByText('Select Disease').length).toBeGreaterThan(0);
      expect(screen.getByLabelText('Disease')).toBeInTheDocument();
    });

    it('shows available diseases in the dropdown', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);

      expect(screen.getByText('Acute Watery Diarrhea')).toBeInTheDocument();
    });

    it('disables next button until disease is selected', () => {
      renderReportForm();

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('enables next button after disease selection', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
    });

    it('shows case definition and guidance after disease selection', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));

      expect(screen.getByText(mockCaseDefinition.definition)).toBeInTheDocument();
      expect(screen.getByText(mockCaseDefinition.guidance)).toBeInTheDocument();
    });

    it('shows persons count field with default value of 1 after disease selection', async () => {
      const user = userEvent.setup();
      renderReportForm();

      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));

      const personsInput = screen.getByLabelText('Number of Persons Affected');
      expect(personsInput).toBeInTheDocument();
      expect(personsInput).toHaveValue(1);
    });

    it('disables back button on first step', () => {
      renderReportForm();

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });
  });

  describe('Step 2: Assessment Questions', () => {
    const navigateToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('shows assessment questions for selected disease', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Assessment/ })).toBeInTheDocument();
      });

      // Check for specific question text from mockCaseDefinition
      expect(
        screen.getByText('Has the person had 3 or more loose/watery stools in the past 24 hours?')
      ).toBeInTheDocument();
    });

    it('shows required label for required questions', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => {
        expect(screen.getByText('Required')).toBeInTheDocument();
      });
    });

    it('shows danger sign chip for danger sign questions', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => {
        expect(screen.getByText('Danger Sign')).toBeInTheDocument();
      });
    });

    it('renders Yes/No radio buttons for each question', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => {
        const radios = screen.getAllByRole('radio');
        // 3 questions x 2 radio buttons each = 6
        expect(radios.length).toBe(6);
      });
    });

    it('disables next until required questions are answered', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
      });
    });

    it('enables next after answering required questions', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      // Answer the required question (first one) as "Yes"
      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]); // First question Yes

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
    });

    it('shows numeric follow-up input when Yes is selected for numeric questions', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      // Answer the first question (which has inputType: 'number') as "Yes"
      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);

      // Should show the numeric input
      expect(screen.getByLabelText('Number of stools per day')).toBeInTheDocument();
    });

    it('shows yesNote when a question is answered Yes', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep2(user);

      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]); // First question has yesNote: 'Count stools per day'

      expect(screen.getByText('Count stools per day')).toBeInTheDocument();
    });
  });

  describe('Step 3: Temperature & Danger Signs', () => {
    const navigateToStep3 = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1: Select disease
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Answer required question
      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('shows temperature input and danger signs', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep3(user);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Temperature & Danger Signs' })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Temperature/)).toBeInTheDocument();

      // Check for danger signs from mockCaseDefinition
      expect(screen.getByText('Severe dehydration')).toBeInTheDocument();
      expect(screen.getByText('Unable to drink')).toBeInTheDocument();
    });

    it('allows entering temperature', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep3(user);

      const tempInput = screen.getByLabelText(/Temperature/);
      await user.clear(tempInput);
      await user.type(tempInput, '38.5');

      expect(tempInput).toHaveValue(38.5);
    });

    it('shows warning when danger signs are selected', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep3(user);

      await waitFor(() => screen.getAllByRole('checkbox'));
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(screen.getByText(/Danger signs detected/)).toBeInTheDocument();
    });

    it('allows proceeding without temperature (optional)', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep3(user);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeEnabled();
      });
    });
  });

  describe('Step 4: Location & Submit', () => {
    const navigateToStep4 = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1: Select disease
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Answer required question
      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: Skip (optional)
      await waitFor(() => screen.getByRole('heading', { name: 'Temperature & Danger Signs' }));
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('shows location input and GPS button', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep4(user);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Location' })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /capture gps location/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Location Name/)).toBeInTheDocument();
    });

    it('disables submit until location is provided', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep4(user);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit report/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('enables submit after entering location name', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep4(user);

      await waitFor(() => screen.getByLabelText(/Location Name/));
      const locationInput = screen.getByLabelText(/Location Name/);
      await user.type(locationInput, 'Gaza City');

      const submitButton = screen.getByRole('button', { name: /submit report/i });
      expect(submitButton).toBeEnabled();
    });

    it('captures GPS location when button clicked', async () => {
      const user = userEvent.setup();
      const { getCurrentPosition } = await import('../../../utils/location');

      renderReportForm();
      await navigateToStep4(user);

      const gpsButton = screen.getByRole('button', { name: /capture gps location/i });
      await user.click(gpsButton);

      await waitFor(() => {
        expect(getCurrentPosition).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /gps captured/i })).toBeInTheDocument();
      });
    });

    it('enables submit after GPS capture', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await navigateToStep4(user);

      const gpsButton = screen.getByRole('button', { name: /capture gps location/i });
      await user.click(gpsButton);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit report/i });
        expect(submitButton).toBeEnabled();
      });
    });
  });

  describe('Navigation', () => {
    it('allows going back to previous step', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Go to step 2
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Verify on step 2
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Assessment/ })).toBeInTheDocument();
      });

      // Go back
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Should be back on step 1
      expect(screen.getByLabelText('Disease')).toBeInTheDocument();
    });

    it('preserves disease selection when going back', async () => {
      const user = userEvent.setup();
      renderReportForm();

      // Select disease and go to step 2
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go back
      await waitFor(() => screen.getByRole('button', { name: /back/i }));
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Guidance should still be visible
      expect(screen.getByText(mockCaseDefinition.guidance)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const completeFormAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1: Select disease
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Answer required question
      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: Add temperature (optional)
      await waitFor(() => screen.getByLabelText(/Temperature/));
      const tempInput = screen.getByLabelText(/Temperature/);
      await user.type(tempInput, '38.5');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4: Enter location and submit
      await waitFor(() => screen.getByLabelText(/Location Name/));
      const locationInput = screen.getByLabelText(/Location Name/);
      await user.type(locationInput, 'Gaza City');

      const submitButton = screen.getByRole('button', { name: /submit report/i });
      await user.click(submitButton);
    };

    it('calls createReport with correct data on submit', async () => {
      const user = userEvent.setup();
      renderReportForm();

      await completeFormAndSubmit(user);

      await waitFor(() => {
        expect(mockCreateReport).toHaveBeenCalledWith(
          expect.objectContaining({
            disease: 'Acute Watery Diarrhea',
            answers: expect.arrayContaining([
              expect.objectContaining({
                questionId: 'awd-q1',
                answer: true,
              }),
            ]),
            symptoms: expect.arrayContaining([
              'Has the person had 3 or more loose/watery stools in the past 24 hours?',
            ]),
            temp: 38.5,
            location: expect.objectContaining({
              name: 'Gaza City',
            }),
            reporterId: mockUserProfile.uid,
            reporterName: mockUserProfile.displayName,
            region: mockUserProfile.region,
            hasDangerSigns: false,
            isImmediateReport: false,
            personsCount: 1,
          })
        );
      });
    });

    it('calls onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<ReportForm onSuccess={onSuccess} />);

      await completeFormAndSubmit(user);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('shows error message on submission failure', async () => {
      const user = userEvent.setup();
      mockCreateReport.mockRejectedValueOnce(new Error('Network error'));

      renderReportForm();
      await completeFormAndSubmit(user);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();

      // Make createReport hang
      mockCreateReport.mockImplementation(() => new Promise(() => {}));

      renderReportForm();

      // Complete form up to submit
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => screen.getByRole('heading', { name: 'Temperature & Danger Signs' }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => screen.getByLabelText(/Location Name/));
      const locationInput = screen.getByLabelText(/Location Name/);
      await user.type(locationInput, 'Gaza City');

      const submitButton = screen.getByRole('button', { name: /submit report/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles GPS location failure gracefully', async () => {
      const user = userEvent.setup();
      const locationModule = await import('../../../utils/location');
      vi.mocked(locationModule.getCurrentPosition).mockResolvedValueOnce(null);

      renderReportForm();

      // Navigate to step 4
      const selectInput = screen.getByLabelText('Disease');
      await user.click(selectInput);
      await user.click(screen.getByText('Acute Watery Diarrhea'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => screen.getAllByRole('radio'));
      const yesRadios = screen.getAllByLabelText('Yes');
      await user.click(yesRadios[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => screen.getByRole('heading', { name: 'Temperature & Danger Signs' }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Try GPS
      const gpsButton = screen.getByRole('button', { name: /capture gps location/i });
      await user.click(gpsButton);

      await waitFor(() => {
        expect(screen.getByText(/could not get gps location/i)).toBeInTheDocument();
      });
    });
  });
});
