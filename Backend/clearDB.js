const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusflow');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearDatabase();
