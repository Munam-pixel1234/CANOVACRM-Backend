// RESET DAILY STATUS AT 12 AM
export const resetDaily = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Run only once per day
    if (req.user.lastActiveDate !== today) {

      // End active break safely
      const lastBreak = req.user.breakLogs?.at(-1);
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = new Date();
      }

      // Reset working state
      req.user.checkInTime = null;
      req.user.lastCheckout = null;
      req.user.isOnBreak = false;

      // Update daily marker
      req.user.lastActiveDate = today;

      await req.user.save();
    }

    next();
  } catch (err) {
    next();
  }
};
