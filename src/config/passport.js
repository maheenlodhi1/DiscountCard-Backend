const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const config = require("./config");

const { User } = require("../models");
const getUserService = require("../utils/userServiceFactory");

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    const userObject = await getUserService(payload.sub.aud);
    const user = await userObject.getUserById(payload.sub.id, false);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
