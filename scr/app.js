const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
//const cashRoutes = require('./routes/cashRoutes');
const discountRoutes = require('./routes/discountRoutes');
const dailyRevenueRoutes = require('./routes/DailyRevenueRoutes');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const tableRoutes = require('./routes/tableRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
//app.use('/api/cash', cashRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/dailyRevenue', dailyRevenueRoutes);
app.use('/api/tables', tableRoutes);


module.exports = app;