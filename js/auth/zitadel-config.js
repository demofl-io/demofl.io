export const ZITADEL_CONFIG = {
    // Your Zitadel instance URL
    authority: 'https://demoflio.us1.zitadel.cloud',
    
    // Client ID from your Zitadel User Agent application
    client_id: '295055243803173051',
    
    // Redirect URI - must match the one configured in Zitadel
    // Use a public URL instead of chrome-extension://
    redirect_uri: 'https://my.demofl.io/ext/callback',
    
    // Response type for User Agent applications
    response_type: 'code',
    
    // Requested scopes
    scope: 'openid profile email urn:zitadel:iam:org:project:id:294068329776184241:aud',
    
    // Additional endpoints
    authorization_endpoint: 'https://demoflio-zrzu8s.us1.zitadel.cloud/oauth/v2/authorize',
    token_endpoint: 'https://demoflio-zrzu8s.us1.zitadel.cloud/oauth/v2/token',
    userinfo_endpoint: 'https://demoflio-zrzu8s.us1.zitadel.cloud/oidc/v1/userinfo',
    
    // PKCE is required for User Agent applications
    usePkce: true
};