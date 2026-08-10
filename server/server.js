import app from './src/app.js';
import connectDB from './src/config/db.js';
import ENV from './src/config/ENV.js';

const PORT = ENV.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log('failed to start server:', error);
  }
}

startServer();
