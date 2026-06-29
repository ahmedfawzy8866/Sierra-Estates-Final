module.exports = {
  apps: [
    {
      name: 'sierra-whatsapp-bot',
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'apps/agents/whatsapp-bot/index.ts',
      cwd: 'H:/Sierra-Estates-Final',
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        GOOGLE_AI_API_KEY: 'AIzaSyArwaR7eiJmwcFUyUzV-vqVHnsyrt5HTZc',
        NEXT_PUBLIC_GEMINI_API_KEY: 'AIzaSyArwaR7eiJmwcFUyUzV-vqVHnsyrt5HTZc',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyBZLN2jTTKV34SneGPoWRz1zoRpX5uODjs',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'sierra-blu.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'sierra-blu',
        OPENCLAW_BASE_URL: 'http://127.0.0.1:18789/v1',
        OPENCLAW_TOKEN: '02b25ffca992d1128741c5fb58a34f8b680cfef51bfbec02',
        SBR_SECRET_KEY: 'sierra-secure-2028',
        ALLOWED_CLIENTS_ONLY: process.env.ALLOWED_CLIENTS_ONLY || 'true',
        ADMIN_PHONES: process.env.ADMIN_PHONES || '',
      },
      log_file: 'H:/Sierra-Estates-Final/logs/whatsapp-bot.log',
      out_file: 'H:/Sierra-Estates-Final/logs/whatsapp-bot-out.log',
      error_file: 'H:/Sierra-Estates-Final/logs/whatsapp-bot-error.log',
      time: true,
    }
  ]
}
