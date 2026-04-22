import * as Clerk from "@clerk/nextjs";

/**
 * Sovereign Auth Client 
 * 
 * Automatically bypasses Clerk in development to allow local sovereign access
 * while maintaining strict enterprise security in production.
 */

const isDev = process.env.NODE_ENV === 'development';

export const useAuth = () => {
  if (isDev) {
    return {
      isSignedIn: true,
      isLoaded: true,
      userId: 'sovereign_admin',
      sessionId: 'local_session',
      getToken: async () => 'local_token',
      signOut: () => console.log('Mock Sign Out'),
    };
  }
  return Clerk.useAuth();
};

export const useUser = () => {
  if (isDev) {
    return {
      isSignedIn: true,
      isLoaded: true,
      user: {
        id: 'sovereign_admin',
        fullName: 'Sovereign Architect',
        firstName: 'Sovereign',
        lastName: 'Architect',
        imageUrl: 'https://img.clerk.com/static/profile.png',
        primaryEmailAddress: { emailAddress: 'admin@localhost' },
      },
    };
  }
  return Clerk.useUser();
};

export const useClerk = () => {
  if (isDev) {
    return {
      openSignIn: () => console.log('Mock Open Sign In'),
      openSignUp: () => console.log('Mock Open Sign Up'),
      signOut: () => console.log('Mock Sign Out'),
    };
  }
  return Clerk.useClerk();
};

export const SignInButton = isDev ? ({ children }: { children: any }) => children : Clerk.SignInButton;
export const SignUpButton = isDev ? ({ children }: { children: any }) => children : Clerk.SignUpButton;
export const UserButton = (props: any) => {
  if (isDev) return <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[10px] font-bold text-accent">SA</div>;
  return <Clerk.UserButton {...props} />;
};
