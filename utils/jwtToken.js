export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  
  // Cookie options for development
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: "/"
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
      token,
    });
};
