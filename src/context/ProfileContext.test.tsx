import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProfileProvider, useProfiles } from './ProfileContext';
import { AuthProvider } from '@/hooks/useAuth';
import React from 'react';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    onAuthStateChanged: vi.fn((cb) => {
      cb({ uid: 'user123', email: 'test@test.com' });
      return () => {};
    }),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn((_ref, cb) => {
    cb({ 
      docs: [],
      forEach: vi.fn(),
      exists: () => true,
      data: () => ({ linkedDoctorId: 'doc123' })
    });
    return () => {};
  }),
  query: vi.fn(),
  where: vi.fn(),
}));

describe('ProfileContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <ProfileProvider>{children}</ProfileProvider>
    </AuthProvider>
  );

  it('provides empty profiles initially', () => {
    const { result } = renderHook(() => useProfiles(), { wrapper });
    
    expect(result.current.profiles).toEqual([]);
    expect(result.current.activeProfileId).toBeNull();
  });

  it('allows adding a new profile', async () => {
    const { result } = renderHook(() => useProfiles(), { wrapper });
    
    await act(async () => {
      await result.current.addProfile('John Doe', 'Back Pain');
    });
    
    expect(result.current.profiles.length).toBe(1);
    expect(result.current.profiles[0].name).toBe('John Doe');
  });
});
