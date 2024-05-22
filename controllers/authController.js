const jwt = require('jsonwebtoken');
const common = require("../config/common");
const { User } = require('../models/user');
const JWT_SECRET = common.config()["JWT_SECRET"];
const JWT_REFRESH_SECRET = common.config()['JWT_REFRESH_SECRET'];

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send({ message: 'Invalid username or password' });
    }
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.send(tokens);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token is required' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json(tokens);
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.send({ message: 'Logged out successfully' });
};
