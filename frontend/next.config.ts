import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const apiGateway = 'https://api-gateway:3000';

    // Legacy proxy routes (kept for reference; intentionally disabled).
    // const apiRoutes = [
    //   // Public routes
    //   '/login',
    //   '/register',
    //   '/checkRegister',
    //   '/checkLogin',
    //   '/hello',
    //   '/forgotPassword',
    //   '/checkEmail',
    //   '/validateEmailCode',
    //   '/checkEmailCode',
    //   '/newPasswordPage',
    //   '/newPassword',
    //   '/checkDb',
    //   '/favicon.ico',
    //   // Private routes
    //   '/helloDb',
    //   '/home',
    //   '/logout',
    //   '/confirmUserEmail',
    //   '/confirmUserEmailCode',
    //   '/validateUserEmailCode',
    //   '/get2FAQrCode',
    //   '/check2FAQrCode',
    //   '/validate2FAQrCode',
    //   '/upload',
    //   '/changeUsername',
    //   '/setAuthUsername',
    //   '/changeNickname',
    //   '/setAuthNickname',
    //   '/changeEmail',
    //   '/setAuthEmail',
    //   '/changeYourPassword',
    //   '/setAuthPassword',
    //   '/changeDescription',
    //   '/setUserDescription',
    //   '/match',
    //   '/seeAllUsers',
    //   '/seeProfile',
    //   '/chatAllUsers',
    //   '/match/join',
    //   '/match/leave',
    //   '/deleteUserAccount',
    //   '/blockTheUser',
    //   '/friendInvite',
    //   '/flappy-bird',
    //   '/pong',
    //   '/handlerFriendsPage',
    //   '/setAcceptFriend',
    //   '/deleteAFriend',
    //   '/directMessage',
    //   '/set2FAOnOff',
    // ];

    return [
      // Static assets from api-gateway
      {
        source: '/public/:path*',
        destination: `${apiGateway}/public/:path*`,
      },
      // ...apiRoutes.map((route) => ({
      //   source: route,
      //   destination: `${apiGateway}${route}`,
      // })),
    ];
  },
};

export default nextConfig;
