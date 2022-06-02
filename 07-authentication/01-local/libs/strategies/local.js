const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      const user = await User.findOne({ email: email });
      if (!user) {
        done(null, false, 'Нет такого пользователя');
        return;
      }
      const check = await user.checkPassword(password);
      if (!check) {
        done(null, false, 'Неверный пароль');
        return;
      }
      done(null, user);
    },
);
