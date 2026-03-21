import { vi } from 'vitest';

// Mock user for auth
export const mockFirebaseUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

// Mock user profile from Firestore
export const mockUserProfile = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'volunteer' as const,
  status: 'approved' as const,
  region: 'North Gaza',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock pending user profile
export const mockPendingUserProfile = {
  ...mockUserProfile,
  status: 'pending' as const,
};

// Mock case definition (question-based assessment)
export const mockCaseDefinition = {
  id: 'acute-watery-diarrhea',
  disease: 'Acute Watery Diarrhea',
  definition: '3 or more loose or watery stools in a 24-hour period (no blood)',
  questions: [
    {
      id: 'awd-q1',
      text: 'Has the person had 3 or more loose/watery stools in the past 24 hours?',
      category: 'core' as const,
      required: true,
      inputType: 'number' as const,
      inputLabel: 'Number of stools per day',
      inputUnit: 'stools/day',
      yesNote: 'Count stools per day',
      isDangerSign: false,
      isImmediateReport: false,
    },
    {
      id: 'awd-q2',
      text: 'Is there blood in the stool?',
      category: 'core' as const,
      required: false,
      inputType: 'none' as const,
      yesNote: 'If YES → reclassify as Bloody Diarrhea',
      isDangerSign: false,
      isImmediateReport: false,
      reclassifyTo: 'acute-bloody-diarrhea',
    },
    {
      id: 'awd-q3',
      text: 'Can the person drink normally?',
      category: 'severity' as const,
      required: false,
      inputType: 'none' as const,
      yesNote: 'If NO → DANGER SIGN',
      isDangerSign: true,
      isImmediateReport: false,
    },
  ],
  dangerSigns: ['Severe dehydration', 'Unable to drink'],
  guidance: 'Provide ORS, refer if danger signs present.',
  active: true,
  thresholds: [
    { count: 5, windowHours: 24, severity: 'high' as const, description: '5+ cases in 24 hours' },
  ],
  prioritySurveillance: false,
};

// Mock report (question-based answers)
export const mockReport = {
  id: 'report-123',
  disease: 'Acute Watery Diarrhea',
  answers: [
    {
      questionId: 'awd-q1',
      questionText: 'Has the person had 3 or more loose/watery stools in the past 24 hours?',
      answer: true,
      numericValue: 5,
    },
  ],
  symptoms: ['Has the person had 3 or more loose/watery stools in the past 24 hours?'],
  temp: 38.5,
  dangerSigns: [],
  location: { lat: 31.5, lng: 34.45, name: 'Gaza City' },
  status: 'pending' as const,
  reporterId: 'test-uid-123',
  reporterName: 'Test User',
  region: 'North Gaza',
  hasDangerSigns: false,
  isImmediateReport: false,
  createdAt: new Date(),
};

// Firebase Auth mocks
export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockSignInWithEmailAndPassword = vi.fn();
export const mockSignOut = vi.fn();
export const mockOnAuthStateChanged = vi.fn();
export const mockUpdateProfile = vi.fn();

// Firestore mocks
export const mockGetDoc = vi.fn();
export const mockSetDoc = vi.fn();
export const mockAddDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockOnSnapshot = vi.fn();
export const mockServerTimestamp = vi.fn(() => new Date());

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  serverTimestamp: () => mockServerTimestamp(),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Reset all mocks helper
export const resetFirebaseMocks = () => {
  mockCreateUserWithEmailAndPassword.mockReset();
  mockSignInWithEmailAndPassword.mockReset();
  mockSignOut.mockReset();
  mockOnAuthStateChanged.mockReset();
  mockUpdateProfile.mockReset();
  mockGetDoc.mockReset();
  mockSetDoc.mockReset();
  mockAddDoc.mockReset();
  mockUpdateDoc.mockReset();
  mockOnSnapshot.mockReset();
};
