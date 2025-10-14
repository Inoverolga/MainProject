import express from "express";
import bcrypt from "bcrypt";
const routerRegister = express.Router();

const usersInMemory = [];

routerRegister.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: hashedPassword,
    };

    usersInMemory.push(newUser);
    console.log(usersInMemory);

    const responseNewUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
    console.log(`отправка на фронт нового пользователя`, responseNewUser);
    res.json(responseNewUser);
  } catch (error) {
    //     error.code === "23505"
    //       ? res.status(400).json({ error: "Почта уже используется" })
    //       : res.status(500).json({ error: "Ошибка на сервере" });
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

export default routerRegister;
