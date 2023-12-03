
import { useSession } from 'next-auth/react';
import { SessionUserProfile } from '../types';

interface Auth {
    loggedIn: boolean;
    loading: boolean;
    isAdmin: boolean;
    profile?: SessionUserProfile;
}

export default function useAuth(): Auth {

  const session = useSession();
  const user = session?.data?.user;

  return {
    loading: session.status === 'loading',
    loggedIn: session.status === 'authenticated',
    isAdmin: user?.role === "admin" ? true : false,
    profile: user,
  }
}
