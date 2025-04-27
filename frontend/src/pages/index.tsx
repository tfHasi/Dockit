import { useEffect } from 'react';
import { useRouter } from 'next/router';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);
  
  return <div>Redirecting...</div>;
}