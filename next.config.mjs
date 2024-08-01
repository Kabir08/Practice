/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/api/auth/callback',
          destination: '/api/auth0-callback',
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  