const cookieOptions = () => {
  return {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  };
};

module.exports = cookieOptions;
