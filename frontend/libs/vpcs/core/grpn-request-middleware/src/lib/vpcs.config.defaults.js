const ConfigDefaults = {
  'grpn-request-middleware': {
    handlers: {
      'akamai-bot-detection': {
        response: [
          {
            url: '/botland',
            status: 200,
            action: 'redirect',
          },
        ],
      },
    },
  },
};
export { ConfigDefaults };
