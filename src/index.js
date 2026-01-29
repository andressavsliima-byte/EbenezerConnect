import app from './app.js';

const PORT = process.env.PORT || 5000;

// Evita subir servidor ao rodar como função serverless na Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
