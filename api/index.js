import app from '../backend/src/app.js';

// Deixa o Express controlar o corpo (necessario para multer)
export const config = {
  api: {
    bodyParser: false,
    maxDuration: 10
  }
};

export default app;
