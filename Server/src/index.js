// import express from 'express'
// import dotenv from 'dotenv';
// import connectDB from './db/connect.js';
// import auth from './routes/auth.js';
// import goalrouter from './routes/goals.js';
// import { mongo } from 'mongoose';
// import session from 'express-session';
// import passport from 'passport';


// import './passport.js';
// import {User} from './models/user.model.js';
// import userrouter from './routes/userroute.js';
// import cors from 'cors';
// import courseRouter from "./routes/courserouter.js";
// import gamificationRouter from "./routes/gamificiation.js";
// import lead from './routes/leaderboardroute.js';
// import challengeRoutes from "./routes/challengeRoutes.js";
// import addpt from './routes/addpt.js';
// import userRoutes from './routes/userroute.js';
// // const cors = require("cors");

// import { errorHandler } from './middleware/errorHandler.js';
// dotenv.config({path: './.env'});
// const app = express()
// connectDB()
// .then(()=>{
//   app.listen(process.env.PORT,()=>{
//       console.log(`Server is running on port ${process.env.PORT}`);
//   });
// })
// .catch((error)=>{
//   console.log(error);
//   process.exit(1);
// });

// // app.use(cors({ origin: 'http://localhost:5173' })); before production 
// //after production
// const FRONTEND_URL = process.env.FRONTEND_URL|| 'http://localhost:5173';
// app.use(cors({ origin: FRONTEND_URL }));

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false
// }));


// app.use(passport.initialize());
// app.use(passport.session());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


// app.use('/userinfo',userrouter);
// app.use('/auth',auth);
// app.use('/api/user', addpt);
// app.use('/userr',lead);
// app.use(errorHandler);
// app.use('/user',goalrouter);

// app.use('/courses', courseRouter);
// app.use("/api/gamification", challengeRoutes);
// app.use("/gamification", gamificationRouter);
// app.use("/api/gamification", challengeRoutes);


// app.use((req, res, next) => {
//   res.status(404).json({ message: "Route not found" });
// });




// 28mayy

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connect.js';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

import './passport.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import auth from './routes/auth.js';
import userrouter from './routes/userroute.js';
import goalrouter from './routes/goals.js';
import addpt from './routes/addpt.js';
import lead from './routes/leaderboardroute.js';
import courseRouter from "./routes/courserouter.js";
import gamificationRouter from "./routes/gamificiation.js";
import challengeRoutes from "./routes/challengeRoutes.js";

dotenv.config({ path: './.env' });

const app = express();

// Connect DB and start server
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Root route to avoid 404 on `/`
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AuraSphere Backend API is running ✅' });
});

// API Routes
app.use('/auth', auth);
app.use('/userinfo', userrouter);
app.use('/api/user', addpt);
app.use('/userr', lead);
app.use('/user', goalrouter);
app.use('/courses', courseRouter);
app.use('/api/gamification', challengeRoutes);
app.use('/gamification', gamificationRouter);

// Error handler middleware
app.use(errorHandler);

// 404 Handler (last middleware)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});
