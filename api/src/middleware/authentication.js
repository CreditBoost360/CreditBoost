import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate API requests using JWT token
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }
    
    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to authenticate partner API requests using JWT token
 */
export const authenticatePartner = (req, res, next) => {
  try {
    // First, authenticate token
    authenticateToken(req, res, () => {
      // Check if user is a partner
      if (req.user.type !== 'partner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Partner authentication required.'
        });
      }
      
      // Partner is authenticated
      next();
    });
  } catch (error) {
    console.error('Partner authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to validate API key

