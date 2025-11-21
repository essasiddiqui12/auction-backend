export const verifyCronKey = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return res.status(500).json({
      success: false,
      message: "Cron secret is not configured.",
    });
  }

  const authHeader = req.headers["authorization"];
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

  const requestKey =
    req.headers["x-cron-key"] ||
    req.query.cron_key ||
    req.body.cron_key ||
    bearerToken;

  if (requestKey !== cronSecret) {
    return res.status(401).json({
      success: false,
      message: "Invalid cron key.",
    });
  }

  next();
};

