require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];

function generateID() {
  return '_' + Math.random().toString(36).slice(2, 11);
}

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: generateID(),
  };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

const checkDate = (date) => {
  if (!date) {
      return (new Date(Date.now())).toDateString();
  } else {
      const parts = date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);

      const utcDate = new Date(Date.UTC(year, month, day));
      return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000).toDateString();
  }
}

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create exercise object
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: checkDate(date),
    _id: user._id
  };

  if (!user.log) {
    user.log = [];
  }
  user.log.push(exercise);

  res.json(exercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  // Find user by ID
  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = user.log || [];

  if (from) {
    log = log.filter(exercise => new Date(exercise.date) >= new Date(from));
  }
  if (to) {
    log = log.filter(exercise => new Date(exercise.date) <= new Date(to));
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const response = {
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  };

  res.json(response);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
