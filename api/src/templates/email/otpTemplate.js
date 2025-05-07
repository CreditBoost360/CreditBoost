/**
 * Email OTP Template
 * 
 * This template is used for sending OTP verification codes via email.
 * It includes the CreditBoost logo and a professional design.
 */

export const generateOtpEmailTemplate = (otp, userName = 'Valued Customer') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CreditBoost Verification Code</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: #0a2540;
      padding: 24px;
      text-align: center;
    }
    .email-header img {
      max-width: 180px;
      height: auto;
    }
    .email-body {
      padding: 32px 24px;
      text-align: center;
    }
    .email-footer {
      background-color: #f5f7fa;
      padding: 16px 24px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    h1 {
      color: #0a2540;
      font-size: 24px;
      margin-bottom: 16px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #0a2540;
      background-color: #f5f7fa;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      display: inline-block;
    }
    .expiry-note {
      color: #6b7280;
      font-size: 14px;
      margin-top: 24px;
    }
    .button {
      display: inline-block;
      background-color: #0a2540;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 24px;
    }
    .security-note {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="cid:logo" alt="CreditBoost Logo">
    </div>
    <div class="email-body">
      <h1>Verification Code</h1>
      <p>Hello ${userName},</p>
      <p>Please use the following verification code to complete your request:</p>
      
      <div class="otp-code">${otp}</div>
      
      <p class="expiry-note">This code will expire in 10 minutes.</p>
      
      <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
      
      <div class="security-note">
        <p><strong>Security Tip:</strong> CreditBoost will never ask for your full password, credit card information, or OTP via email or phone.</p>
      </div>
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} CreditBoost. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export default generateOtpEmailTemplate;