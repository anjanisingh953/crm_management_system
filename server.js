const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import custom modules
const connectDB = require('./config/db');

//Import routes and controllers
const policyRoutes = require('./routes/policyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const cpuMonitor = require('./controllers/cpuMonitor');

// Connect to Database
connectDB();

// Middleware
app.use(express.json());

app.get('/api/health',(req,res)=>{
    res.status(200).json({msg:'Working...'})
})

// Routes
app.use('/api/policy', policyRoutes);
app.use('/api', scheduleRoutes);

// Start CPU monitor
cpuMonitor();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));