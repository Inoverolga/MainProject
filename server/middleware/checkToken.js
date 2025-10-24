import jwt from "jsonwebtoken";

export const checkToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Токен отсутствует" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log("🔍 FULL Decoded token:", JSON.stringify(user, null, 2));
    console.log("🔍 Available fields:", Object.keys(user));
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Недействительный токен" });
  }
};
