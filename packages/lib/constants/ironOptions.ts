import type { SessionOptions } from "iron-session";

// TODO Reveiw settings. Extract this to config file
// https://github.com/vvo/iron-session#ironoptions
const ironOptions: SessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default ironOptions;
