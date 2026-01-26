module.exports = {
  apps: [
    {
      name: 'josenizzo-server',
      script: './server/server.js',
      instances: 'max', // Usa todos los núcleos disponibles
      exec_mode: 'cluster', // Modo cluster para balanceo de carga
      watch: false, // No usar watch en producción
      max_memory_restart: '500M', // Reiniciar si supera 500MB
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Configuración de logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Reinicio automático
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Monitoreo
      instance_var: 'INSTANCE_ID'
    }
  ],

  // Configuración de deploy (opcional, para uso con pm2 deploy)
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:AGMontenegro/josenizzo-info.git',
      path: '/var/www/josenizzo.info',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};