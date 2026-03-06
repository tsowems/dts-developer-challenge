import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { sql } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils';
import runMigrations from './config/runMigrations';
import taskRoutes from './routes/taskRoutes';
import cors from 'cors';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8080;
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Add this near the top of your middleware stack
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('HMCT API is running!');
});

// Database test route
app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ message: 'Database connected successfully', time: result[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

//app routes
app.use('/api/v1/tasks', taskRoutes);

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Start server
runMigrations().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to run migrations:', error);
  process.exit(1);
});

export default app;