import express from 'express';

const router = express.Router();

// Signup endpoint
router.post('/signup', (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    // Validate required fields
    const { email, password, firstName, lastName, phoneNumber, language } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email or phone number is required'
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Password is required'
      });
    }
    
    // Generate a secure JWT token and hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomBytes(16).toString('hex');
    const token = jwt.sign(
      { 
        userId,
        email: email || null,
        phoneNumber: phoneNumber || null,
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
      },
      process.env.JWT_SECRET
    );
    
    res.status(200).json({
      message: 'Signup successful',
      token: token,
      user: {
        email: email || '',
        phoneNumber: phoneNumber || '',
        username: email ? email.split('@')[0] : phoneNumber,
        firstName: firstName || '',
        lastName: lastName || '',
        language: language || 'en',
        id: 'user-' + Date.now()
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Signin endpoint
router.post('/signin', (req, res) => {
  try {
    console.log('Signin request received:', { 
      email: req.body.email || 'not provided', 
      phoneNumber: req.body.phoneNumber ? 'provided' : 'not provided',
      password: '***' 
    });
    
    // Validate required fields
    const { email, phoneNumber, password, language } = req.body;
    
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email/phone number and password are required'
      });
    }
    
    // Validate credentials against database
    const user = await db.findUserByEmailOrPhone(email || phoneNumber);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
      },
      process.env.JWT_SECRET
    );
    
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        username: user.username,
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        language: language || 'en',
        profileImage: null
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
});

// Add CSRF token endpoint
router.get('/csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', 'csrf-token-' + Date.now(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });
  
  res.json({ message: 'CSRF token set' });
});

// Add refresh token endpoint
router.post('/refresh', (req, res) => {
  // Get user from request or use a mock user
  const user = req.body.user || { 
    id: 'user-' + Date.now(),
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    profileImage: null
  };
  
  res.json({
    token: 'refreshed-token-' + Date.now(),
    user
  });
});

// Add verify token endpoint
router.post('/verify', (req, res) => {
  res.json({ valid: true });
});

// User profile endpoint
router.get('/profile', (req, res) => {
  // In a real app, you would get this from the authenticated user
  const user = {
    id: 'user-' + Date.now(),
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    profileImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(user);
});

// Update profile endpoint
router.put('/profile', (req, res) => {
  const updates = req.body;
  
  // In a real app, you would update the user in the database
  const updatedUser = {
    id: 'user-' + Date.now(),
    email: updates.email || 'user@example.com',
    firstName: updates.firstName || 'Test',
    lastName: updates.lastName || 'User',
    profileImage: updates.profileImage || null,
    updatedAt: new Date().toISOString()
  };
  
  res.json({ user: updatedUser });
});

// Add user update endpoint
router.put('/user', (req, res) => {
  try {
    console.log('User update request received');
    const updates = req.body;
    
    // Log the request but truncate the profileImage if present
    console.log('Update data:', {
      ...updates,
      profileImage: updates.profileImage ? `[Image data: ${updates.profileImage.substring(0, 50)}...]` : null
    });
    
    // In a real app, you would update the user in the database
    const updatedUser = {
      id: 'user-' + Date.now(),
      email: updates.email || 'user@example.com',
      firstName: updates.firstName || 'Test',
      lastName: updates.lastName || 'User',
      phone: updates.phone || null,
      profileImage: updates.profileImage || null,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Sending updated user response');
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error in user update endpoint:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

export default router;