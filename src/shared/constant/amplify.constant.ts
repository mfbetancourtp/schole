export const amplifyConstant = {
    Auth: {
        mandatorySignIn: true,
        region: 'us-east-1',
        userPoolId: 'us-east-1_2DJTTJrIw',
        userPoolWebClientId: '7906o3512l5b3mfo1usjbcn7e9',
        authenticationFlowType: 'USER_PASSWORD_AUTH',
        cookieStorage: {
            domain: 'localhost',
            secure: false,
        },
        // storage: AuthStorage,
        oauth: {
            domain: 'academiav1-test.auth.us-east-1.amazoncognito.com',
            scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            // redirectSignIn: environment.applications.users + '/auth/redirect',
            // redirectSignOut: environment.applications.users + '/auth/redirect',
            responseType: 'code',
        },
    },
};