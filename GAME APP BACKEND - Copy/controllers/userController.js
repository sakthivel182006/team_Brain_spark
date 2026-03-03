  const User = require('../models/User.js');
  const bcrypt = require('bcryptjs');
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  const transporter = require('../config/mail.js');
  const generateOTP = require('../utils/generateOTP.js');
  const path = require('path');
  const fs = require('fs');

  exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body; // role added
    let imagePath = 'default-avatar.png'; // default image

    try {
      // If an image file is uploaded (optional)
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      // Check if email already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Check if username already exists
      user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: 'User with this username already exists' });
      }

      // Generate OTP (valid for 10 minutes)
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);



      user = new User({
        username,
        email,
        password,
        otp,
        otpExpires,
        role: role || 'user', // default to 'user' if not provided
        image: imagePath,
      });

      // Save user to database
      await user.save();


     // Prepare email content
      const mailOptions = {
        from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Crack Quiz With Sakthi - Verify Your Account',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <!-- Header with Branding -->
            <div style="background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Crack Quiz With Sakthi</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 16px;">Expand Your Knowledge Horizons</p>
            </div>
            
            <!-- Email Content -->
            <div style="padding: 30px 25px;">
              <h2 style="color: #333; margin-top: 0;">Welcome ${username}!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Thank you for joining our community of knowledge seekers! We're excited to have you on board.</p>
              
              <!-- OTP Section -->
              <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0; border: 1px dashed #6e48aa;">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #6e48aa; margin: 10px 0;">${otp}</div>
                <p style="margin: 0; font-size: 12px; color: #ff6b6b;">Valid for 10 minutes only</p>
              </div>
              
              <!-- Website Features -->
              <div style="margin: 25px 0;">
                <h3 style="color: #6e48aa; margin-bottom: 15px;">Start Your Knowledge Journey:</h3>
                <div style="display: flex; margin-bottom: 15px;">
                  <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px; margin-right: 10px;">
                    <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📚 Diverse Quizzes</p>
                    <p style="margin: 0; font-size: 14px; color: #555;">Test your knowledge across various subjects</p>
                  </div>
                  <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px;">
                    <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">🏆 Earn Badges</p>
                    <p style="margin: 0; font-size: 14px; color: #555;">Get recognized for your achievements</p>
                  </div>
                </div>
                <div style="display: flex;">
                  <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px; margin-right: 10px;">
                    <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📊 Track Progress</p>
                    <p style="margin: 0; font-size: 14px; color: #555;">Monitor your learning journey</p>
                  </div>
                  <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px;">
                    <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">👥 Community</p>
                    <p style="margin: 0; font-size: 14px; color: #555;">Compete with fellow learners</p>
                  </div>
                </div>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://crackquizwithsakthi.vercel.app" style="display: inline-block; background: #6e48aa; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Start Quizzing Now</a>
                <p style="color: #888; font-size: 14px;">Verify your account and dive into our quiz collection!</p>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                <p style="color: #888; font-size: 14px; line-height: 1.5;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                <p style="color: #888; font-size: 14px; margin-bottom: 0;">Happy Learning!<br><strong>The Crack Quiz With Sakthi Team</strong></p>
              </div>
            </div>
            
            <!-- Bottom Bar -->
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
              <p style="margin: 5px 0 0;">
                <a href="https://crackquizwithsakthi.vercel.app" style="color: #6e48aa; text-decoration: none;">Home</a> | 
                <a href="https://crackquizwithsakthi.vercel.app/privacy" style="color: #6e48aa; text-decoration: none;">Privacy Policy</a> | 
                <a href="https://crackquizwithsakthi.vercel.app/contact" style="color: #6e48aa; text-decoration: none;">Contact Us</a>
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

    res.status(201).json({
        message: 'Registration successful! Please go to login.',
        userId: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        message: 'Server error during registration',
        error: error.message,
      });
    }
  };

 exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send thank you email
    const mailOptions = {
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Welcome Aboard! Your Account is Now Verified',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <!-- Header with Branding -->
          <div style="background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%); padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Crack Quiz With Sakthi!</h1>
            <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.9;">Your Knowledge Journey Begins Now</p>
          </div>
          
          <!-- Email Content -->
          <div style="padding: 30px 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.username},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Thank you for verifying your account! We're thrilled to have you as part of our learning community.
            </p>
            
            <!-- Celebration Section -->
            <div style="text-align: center; margin: 25px 0;">
              <div style="font-size: 48px;">🎉</div>
              <h3 style="color: #6e48aa;">Your account is now fully activated!</h3>
            </div>
            
            <!-- Getting Started -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #6e48aa; margin-top: 0;">Get Started:</h4>
              <ol style="padding-left: 20px; margin-bottom: 0;">
                <li style="margin-bottom: 8px;">Explore our quiz categories</li>
                <li style="margin-bottom: 8px;">Take your first quiz</li>
                <li style="margin-bottom: 8px;">Track your progress in your dashboard</li>
                <li>Earn badges and achievements</li>
              </ol>
            </div>
            
            <!-- Website Features -->
            <div style="margin: 30px 0;">
              <h3 style="color: #6e48aa; text-align: center; margin-bottom: 20px;">Why You'll Love Crack Quiz With Sakthi</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📚 1000+ MCQs</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Comprehensive question bank</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📊 Detailed Analytics</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Track your strengths & weaknesses</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">🏆 Leaderboards</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Compete with other learners</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📱 Mobile Friendly</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Learn anywhere, anytime</p>
                </div>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://crackquizwithsakthi.vercel.app/login" style="display: inline-block; background: #6e48aa; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">Start Learning Now</a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin-bottom: 5px;">Need help or have questions?</p>
              <p style="color: #888; font-size: 14px; margin: 0;">
                Contact us at <a href="mailto:support@crackquizwithsakthi.vercel.app" style="color: #6e48aa;">support@crackquizwithsakthi.vercel.app</a>
              </p>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
            <p style="margin: 5px 0 0;">
              <a href="https://crackquizwithsakthi.vercel.app" style="color: #6e48aa; text-decoration: none;">Home</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/privacy" style="color: #6e48aa; text-decoration: none;">Privacy Policy</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/contact" style="color: #6e48aa; text-decoration: none;">Contact Us</a>
            </p>
          </div>
        </div>
      `
    };

    // Send email (don't await to speed up response)
    transporter.sendMail(mailOptions)
      .then(() => console.log(`Thank you email sent to ${user.email}`))
      .catch(err => console.error('Error sending thank you email:', err));

    // Send response
    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        website: {
          name: 'Crack Quiz With Sakthi',
          url: 'https://crackquizwithsakthi.vercel.app',
          features: [
            'Comprehensive MCQ collection',
            'Detailed performance analytics',
            'Personalized learning paths',
            'Competitive exam preparation'
          ],
          loginUrl: 'https://crackquizwithsakthi.vercel.app/login'
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message
    });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Use model method (cleaner)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Generate login time
    const loginTime = new Date().toLocaleString();

    // 4️⃣ Send login alert email (non-blocking)
    transporter.sendMail({
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 New Login Alert",
      html: `
        <h2>Hello ${user.username}</h2>
        <p>Your account was logged in.</p>
        <p><strong>Login Time:</strong> ${loginTime}</p>
        <p>If this wasn't you, reset your password immediately.</p>
      `
    }).catch(err => console.log("Email error:", err));

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 6️⃣ Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      image: user.image || null,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/user/profile/update
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email already exists for another user
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }

    // Check if new username already exists for another user
    if (username && username !== user.username) {
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser && existingUsernameUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/user/password/update
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password', error: error.message });
  }
};

// @desc    Upload user profile image
// @route   POST /api/user/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image if it exists
    if (user.image) {
      const oldImagePath = path.join(__dirname, '..', 'public', user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image path (relative to public folder)
    const imagePath = `/uploads/${req.file.filename}`;
    user.image = imagePath;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl: imagePath
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error uploading image', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpires'); // Exclude sensitive fields
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password -otp -otpExpires');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};


// controllers/authController.js (or your controller file)

exports.verifyEmailAddress = async (req, res) => {
  const { userId, otp } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.isVerified) {
      return res.status(400).send('Email already verified.');
    }

    if (user.otp !== otp) {
      return res.status(400).send('Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).send('OTP expired');
    }

    // Update user verification
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Redirect or confirm success
    return res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 0 15px rgba(0,0,0,0.1);
              text-align: center;
            }
            .btn {
              margin-top: 20px;
              padding: 10px 25px;
              background: #6e48aa;
              color: white;
              border: none;
              border-radius: 5px;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🎉 Your email has been verified!</h2>
            <p>You can now log in and start your learning journey.</p>
            <a href="https://crackquizwithsakthi.vercel.app/login" class="btn">Go to Login</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error verifying email via link:', error);
    res.status(500).send('Server error while verifying email');
  }
};


exports.sendVerificationLink = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not registered." });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    // Generate unique code
    const uniqueCode = crypto.randomBytes(16).toString("hex");
    user.verificationCode = uniqueCode;
    await user.save();

    // Create verification link
    const link = `https://gameappbackend-i8zv.onrender.com/api/auth/verify-email-address?code=${uniqueCode}&email=${email}`;

    // Mail options
    const mailOptions = {
  from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔐 Verify Your Email Address",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
      .header { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); padding: 24px; border-radius: 12px 12px 0 0; }
      .content { padding: 24px; }
      .button { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
      .footer { padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1 style="color: white; font-size: 24px; font-weight: 700; text-align: center; margin: 0;">Verify Your Email</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Hi there,</p>
          <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Thank you for registering with Crack Quiz With Sakthi! Please click the button below to verify your email address:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" class="button">Verify Email Address</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">If you didn't create an account with us, please ignore this email.</p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Didn't work? Copy and paste this link in your browser:</p>
            <p style="font-size: 13px; color: #475569; word-break: break-all;">${link}</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `
};

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification email sent successfully." });

  } catch (err) {
    console.error("Error in sending verification email:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
exports.verifyEmailAddress = async (req, res) => {
  const { code, email } = req.query;

  try {
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed | Crack Quiz With Sakthi</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
          </style>
        </head>
        <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div class="w-full max-w-md">
            <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
              <h1 class="text-2xl font-bold">Verification Failed</h1>
            </div>
            
            <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
              <div class="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Invalid or Expired Link</h2>
              <p class="text-gray-600 mb-6">The verification link you used is invalid or has expired. Please request a new verification email.</p>
              
              <a href="https://crackquizwithsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
                Return to Home
              </a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified | Crack Quiz With Sakthi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
          .checkmark-circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }
          .checkmark {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: block;
            stroke-width: 2;
            stroke: #fff;
            stroke-miterlimit: 10;
            margin: 10% auto;
            box-shadow: inset 0px 0px 0px #6b46c1;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
          }
          .checkmark-check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
          }
          @keyframes stroke {
            100% { stroke-dashoffset: 0; }
          }
          @keyframes scale {
            0%, 100% { transform: none; }
            50% { transform: scale3d(1.1, 1.1, 1); }
          }
          @keyframes fill {
            100% { box-shadow: inset 0px 0px 0px 30px #6b46c1; }
          }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div class="w-full max-w-md">
          <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
            <h1 class="text-2xl font-bold">Email Verified</h1>
          </div>
          
          <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
            <div class="mb-4">
              <svg class="checkmark mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark-circle" fill="none" cx="26" cy="26" r="25"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Successfully Verified!</h2>
            <p class="text-gray-600 mb-6">Your email address has been successfully verified. You can now login to your account.</p>
            
            <a href="https://crackquizwithsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
              Continue to Login
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error | Crack Quiz With Sakthi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div class="w-full max-w-md">
          <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
            <h1 class="text-2xl font-bold">Verification Error</h1>
          </div>
          
          <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Server Error</h2>
            <p class="text-gray-600 mb-6">We encountered an error while verifying your email. Please try again later.</p>
            
            <a href="https://learnfromsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
              Return to Home
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
};


// @desc    Forgot Password - Send reset link email
// @route   POST /api/users/forgot-password
// @access  Public


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // 👇 Use your frontend URL – must match where your reset form lives
    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
const resetUrl = `http://localhost:5000/api/reset-password?token=${resetToken}`;
    // Send email with button
    await transporter.sendMail({
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h3>Hello ${user.username},</h3>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #8e44ad; color: white; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
// @access  Public

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 🔥 DO NOT HASH HERE
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // pre-save middleware hashes it

    res.status(200).json({
      success: true,
      message: 'Password reset successful.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Resend Reset Link
// @route   POST /api/users/resend-reset
// @access  Public
exports.resendResetLink = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
    const resetUrl = `${frontendUrl}/login.html?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'New Password Reset Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h3>Hello ${user.username},</h3>
          <p>Here is your new password reset link:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #8e44ad; color: white; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            Reset Password
          </a>
          <p>Link: ${resetUrl}</p>
          <p>Valid for 10 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'New reset link sent to your email',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Render reset password HTML form
// @route   GET /reset-password
// @access  Public


exports.renderResetPasswordForm = (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Missing token');
  }

  // Optional: verify token exists and not expired before serving form
  // (but you can also let the frontend handle that via API call)

  // Serve a simple HTML page with the token embedded
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password | Learn From Sakthi</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 100%;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo i {
      font-size: 50px;
      color: #8e44ad;
      background: rgba(142,68,173,0.1);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
    }
    .logo h2 {
      color: #2c3e50;
      font-size: 24px;
    }
    .form-group {
      margin-bottom: 20px;
      position: relative;
    }
    .form-group i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #7f8c8d;
      font-size: 18px;
    }
    .form-group input {
      width: 100%;
      padding: 15px 15px 15px 45px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f9f9f9;
    }
    .form-group input:focus {
      outline: none;
      border-color: #8e44ad;
      background: white;
      box-shadow: 0 0 0 3px rgba(142,68,173,0.1);
    }
    .btn {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #8e44ad, #9b59b6, #e74c3c);
      color: white;
      box-shadow: 0 5px 15px rgba(142,68,173,0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(142,68,173,0.6);
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    .message {
      text-align: center;
      padding: 10px;
      border-radius: 8px;
      margin-top: 15px;
      font-weight: 500;
    }
    .message.success {
      background: rgba(46,204,113,0.1);
      color: #2ecc71;
      border: 1px solid rgba(46,204,113,0.3);
    }
    .message.error {
      background: rgba(231,76,60,0.1);
      color: #e74c3c;
      border: 1px solid rgba(231,76,60,0.3);
    }
    .hidden {
      display: none;
    }
    .fa-spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <i class="fas fa-key"></i>
      <h2>Reset Your Password</h2>
      <p style="color:#7f8c8d; margin-top:10px;">Enter your new password below</p>
    </div>
    <form id="resetForm">
      <div class="form-group">
        <i class="fas fa-lock"></i>
        <input type="password" id="password" placeholder="New password" required minlength="6">
      </div>
      <div class="form-group">
        <i class="fas fa-lock"></i>
        <input type="password" id="confirmPassword" placeholder="Confirm new password" required minlength="6">
      </div>
      <button type="submit" class="btn" id="resetBtn">
        <i class="fas fa-sync-alt"></i> Reset Password
      </button>
      <p id="message" class="message hidden"></p>
    </form>
  </div>
  <script>
    const BACKEND_URL = ''; // relative to current origin
    const token = new URLSearchParams(window.location.search).get('token');
    const resetForm = document.getElementById('resetForm');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const messageDiv = document.getElementById('message');
    const resetBtn = document.getElementById('resetBtn');

    if (!token) {
      showMessage('Invalid reset link. No token provided.', 'error');
    }

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + type;
      messageDiv.classList.remove('hidden');
    }

    function setLoading(isLoading) {
      if (isLoading) {
        resetBtn.disabled = true;
        resetBtn.innerHTML = '<i class="fas fa-spinner"></i> Processing...';
      } else {
        resetBtn.disabled = false;
        resetBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Reset Password';
      }
    }

    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = passwordInput.value;
      const confirm = confirmInput.value;

      if (password !== confirm) {
        showMessage('Passwords do not match.', 'error');
        return;
      }
      if (password.length < 6) {
        showMessage('Password must be at least 6 characters.', 'error');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(\`/api/reset-password/\${token}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (res.ok) {
          showMessage('Password reset successful! You can now login.', 'success');
          resetForm.reset();
          // Optionally redirect to login page after a few seconds
          setTimeout(() => {
            window.location.href = ''; // adjust if needed
          }, 3000);
        } else {
          showMessage(data.message || 'Something went wrong.', 'error');
        }
      } catch (error) {
        showMessage('Network error. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    });
  </script>
</body>
</html>
  `);
};