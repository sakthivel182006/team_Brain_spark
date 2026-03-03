const NeoUser = require('../models/NeoUser');
const jwt = require('jsonwebtoken');

const generateTokens = (userId, username, isPro) => {
  const accessToken = jwt.sign(
    { userId, username, isPro },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// 1. REGISTER METHOD
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and email are required'
      });
    }

    const existingUser = await NeoUser.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const newUser = new NeoUser({
      username,
      password,
      email,
      isPro: true,
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      tokenLimit: 1000,
      tokensUsed: 0
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(
      newUser._id,
      newUser.username,
      newUser.isPro
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Pro access granted.',
      accessToken,
      refreshToken,
      isPro: true,
      username: newUser.username,
      account: {
        username: newUser.username,
        isPro: true,
        subscriptionPlan: 'pro',
        tokensUsed: 0,
        tokenLimit: 1000
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 2. LOGIN METHOD
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await NeoUser.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // AUTO PRO FOR ALL
    if (!user.isPro) {
      user.isPro = true;
      user.subscriptionPlan = 'pro';
      user.subscriptionStatus = 'active';
      user.tokenLimit = 1000;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.username,
      true
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      isPro: true,
      username: user.username,
      account: {
        username: user.username,
        isPro: true,
        subscriptionPlan: user.subscriptionPlan,
        tokensUsed: user.tokensUsed,
        tokenLimit: user.tokenLimit
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 3. GET ACCOUNT METHOD
exports.getAccount = async (req, res) => {
  try {
    const user = await NeoUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      account: {
        username: user.username,
        isPro: user.isPro,
        subscriptionPlan: user.subscriptionPlan,
        tokensUsed: user.tokensUsed,
        tokenLimit: user.tokenLimit
      }
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};