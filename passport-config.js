const LocalStrategy = require('passport-local').Strategy;
const Crypto        = require('crypto-js');

// Decrypt password
async function decrypt(data) {
    return new Promise((resolve, reject) => {
        var bytes  = Crypto.AES.decrypt(data, 'TrackandTrace2021!!!');
        var decryptedData = bytes.toString(Crypto.enc.Utf8);
        resolve(decryptedData);
    });
} 

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail.email;
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      var pass = await decrypt(user.password);
      if (password == pass) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize