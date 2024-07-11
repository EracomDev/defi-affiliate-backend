module.exports = {
  // Registration errors
  REGISTRATION_FAILED: { code: 400, message: "Registration failed." },
  INVALID_USERNAME: { code: 400, message: "Please enter a valid username." },
  USERNAME_ALREADY_EXISTS: { code: 409, message: "Username already exists." },
  INVALID_EMAIL: { code: 400, message: "Please enter a valid email address." },
  EMAIL_ALREADY_EXISTS: { code: 409, message: "Email already exists." },
  INVALID_MOBILE_NUMBER: { code: 400, message: "Please enter a valid mobile number." },
  MOBILE_NUMBER_ALREADY_EXISTS: { code: 409, message: "Mobile number already exists." },
  PASSWORD_TOO_SHORT: { code: 400, message: "Password should be minimum 8 characters." },
  PASSWORD_TOO_WEAK: { code: 400, message: "Password should be stronger." },
  SPONSOR_NOT_ACTIVE: { code: 403, message: "Sponsor is not active." },
  INVALID_SPONSOR: { code: 400, message: "Invalid sponsor." },
  
  // Authentication errors
  INVALID_CREDENTIALS: { code: 401, message: "Invalid username or password." },
  AUTHENTICATION_FAILED: { code: 401, message: "Authentication failed." },
  TOKEN_EXPIRED: { code: 419, message: "Token has expired." },
  UNAUTHORIZED_ACCESS: { code: 403, message: "Unauthorized access." },

  // Profile update errors
  PROFILE_UPDATE_FAILED: { code: 400, message: "Profile update failed." },
  MISSING_AUTH_TOKEN: { code: 419, message: "Authorization token is missing." },
  UNAUTHORIZED_PROFILE_ACCESS: { code: 403, message: "Unauthorized profile access." },
  INVALID_ADDRESS: { code: 400, message: "Invalid address." },

  // General errors
  SOMETHING_WENT_WRONG: { code: 500, message: "Something went wrong. Please try again later." },
  INTERNAL_SERVER_ERROR: { code: 500, message: "Internal server error." },
  FORBIDDEN: { code: 403, message: "Forbidden: You do not have permission to access this route." },
  INVALID_REQUEST: { code: 400, message: "Invalid request. useWallet and allowedFor must be empty arrays." },
  
  // New error messages
  ACTIVITY_NOT_ACTIVE: { code: 403, message: "This activity is not active." },
  INVALID_TRANSACTION_ID: { code: 400, message: "Invalid transaction ID." },
  
  
  //withdraw errors 
  INVALID_AMOUNT: { code: 400, message: "Invalid Amount"},
  INSUFFICIENT_FUND: { code: 400, message: "Insufficient fund in your wallet"}
};
