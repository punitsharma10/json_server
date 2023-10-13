const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;
const db = router.db;
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.get("/transactions", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const income = db
    .get("income")
    .filter({ userId: Number(userId) })
    .value();

  const expense = db
    .get("expense")
    .filter({ userId: Number(userId) })
    .value();

  res.status(200).json({ income, expense });
});

server.post("/users", (req, res) => {
  const { fullName, email, password } = req.body;

  const users = db.get("users");

  const newUserId = users.size().value() + 1;

  const newUser = {
    id: newUserId,

    fullName,

    email,

    password,
  };

  users.push(newUser).write();

  res

    .status(201)

    .json({ message: "User registered successfully", user: newUser });
});

server.post("/transactions/add", (req, res) => {
  const { userId, type, category, amount } = req.body;

  if (!userId || !category || !amount) {
    return res.status(400).json({
      message: "Invalid data.",
    });
  }

  const user = db

    .get("users")

    .find({ id: Number(userId) })

    .value();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const newTransaction = {
    userId: Number(userId),

    category,

    amount: Number(amount),
  };

  if (type === "income") {
    db.get("income").push(newTransaction).write();

    return res.status(201).json({
      message: "Income added successfully",

      transaction: newTransaction,
    });
  } else if (type === "expense") {
    db.get("expense").push(newTransaction).write();

    return res.status(201).json({
      message: "Expense added successfully",

      transaction: newTransaction,
    });
  } else {
    return res.status(400).json({
      message: "Invalid request.",
    });
  }
});

server.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.get("users").find({ email }).value();

  if (!user) {
    res.status(401).json({ message: "User not found" });
  } else {
    if (user.password === password) {
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  }
});

server.use(router);

server.listen(port, () => {
  console.log(`running on port ${port}`);
});
