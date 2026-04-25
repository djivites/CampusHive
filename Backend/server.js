const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const vivaRoutes = require('./routes/vivaRoutes');
const fileRoutes = require('./routes/fileRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io Logic
io.on('connection', (socket) => {
  socket.on('join_team', (teamId) => {
    socket.join(teamId);
  });

  socket.on('send_message', async (data) => {
    const { team, sender, text } = data;
    try {
      const newMessage = await Message.create({ team, sender, text });
      const populatedMessage = await newMessage.populate('sender', 'name email');
      io.to(team).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('Chat error:', error);
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/viva', vivaRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Chat history route
app.get('/api/messages/:teamId', async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('CampusFlow API is running with all modules...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
