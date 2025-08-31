module.exports = {
    proxy: "http://localhost:3000", // Proxy para o servidor do Socket.IO
    files: ["public/*.html", "public/*.css", "public/*.js"], // Monitora mudanças
    port: 3001, // Porta do BrowserSync
    open: true, // Abre o navegador automaticamente
    notify: true // Mostra notificação quando recarregar
};