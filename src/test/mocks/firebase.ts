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
  region: 'north-gaza',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock pending user profile
export const mockPendingUserProfile = {
  ...mockUserProfile,
  status: 'pending' as const,
};

// Mock case definition
export const mockCaseDefinition = {
  id: 'acute-watery-diarrhea',
  disease: 'Acute Watery Diarrhea',
  symptoms: [
    { id: 'loose-stools', name: '3+ loose/watery stools in 24 hours', required: true },
    { id: 'dehydration', name: 'Signs of dehydration', required: false },
  ],
  dangerSigns: ['Severe dehydration', 'Unable to drink'],
  guidance: 'Provide ORS, refer if danger signs present.',
  active: true,
  threshold: 10,
};

// Mock report
export const mockReport = {
  id: 'report-123',
  disease: 'acute-watery-diarrhea',
  symptoms: ['loose-stools'],
  temp: 38.5,
  dangerSigns: [],
  location: { lat: 31.5, lng: 34.45, name: 'Gaza City' },
  status: 'pending' as const,
  reporterId: 'test-uid-123',
  reporterName: 'Test User',
  region: 'north-gaza',
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
