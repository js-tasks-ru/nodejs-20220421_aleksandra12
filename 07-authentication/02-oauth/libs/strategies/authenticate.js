const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    done(null, false, 'Не указан email');
    return;
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    try {
      const userNew = await User.create({
          email: email,
          displayName: displayName,
      })
      done(null, userNew);
    } catch(err) {
      done(err);
    }
    return;
  }
  done(null, user);
};
