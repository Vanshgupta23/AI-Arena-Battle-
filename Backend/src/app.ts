// import express from 'express';
// import runGraph from './ai/graph.ai.js';
// import cors from 'cors';
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const app = express();

// app.use(express.json());  
// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true
// }));

// // ==============================
// // ✅ TEMP USER DB
// // ==============================
// const users: any[] = [];

// // ==============================
// // ✅ AUTH ROUTES (ADD THIS)
// // ==============================

// // Signup
// app.post("/api/auth/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exist = users.find(u => u.email === email);
//     if (exist) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const user = {
//       id: Date.now(),
//       name,
//       email,
//       password: hashed
//     };

//     users.push(user);

//     res.json({ msg: "Signup successful" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Signup error" });
//   }
// });

// // Login
// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = users.find(u => u.email === email);
//     if (!user) {
//       return res.status(400).json({ msg: "User not found" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(400).json({ msg: "Wrong password" });
//     }

//     const token = jwt.sign({ id: user.id }, "secret123");

//     res.json({ token, user });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Login error" });
//   }
// });

// // ==============================
// // ✅ EXISTING AI ROUTES (UNCHANGED)
// // ==============================

// app.get('/', async (req, res) => {
//   const result = await runGraph("Write code for sum of array");
//   res.json(result);
// });

// app.post("/invoke", async (req, res) => {
//   try {
//     const { input } = req.body;

//     const response = await runGraph(input);

//     res.json({ result: response });

//   } catch (error) {
//     console.error("❌ Backend Error FULL:", error);

//     res.status(500).json({
//       message: "AI service temporarily unavailable",
//       error: error.message
//     });
//   }
// });

// export default app;
import express from 'express';
import runGraph from './ai/graph.ai.js';
import cors from 'cors';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

// ==============================
// ✅ TEMP USER DB
// ==============================
const users: any[] = [];

// ==============================
// ✅ AUTH ROUTES
// ==============================

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = users.find(u => u.email === email);

    if (exist) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now(),
      name,
      email,
      password: hashed
    };

    users.push(user);

    const token = jwt.sign(
      { id: user.id },
      "secret123"
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      msg: "Signup error",
      error: err.message
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({
        msg: "User not found"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        msg: "Wrong password"
      });
    }

    const token = jwt.sign(
      { id: user.id },
      "secret123"
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      msg: "Login error",
      error: err.message
    });
  }
});

// ==============================
// ✅ EXISTING AI ROUTES
// ==============================

app.get('/', async (req, res) => {
  const result = await runGraph("Write code for sum of array");

  res.json(result);
});

app.post("/invoke", async (req, res) => {
  try {
    const { input } = req.body;

    const response = await runGraph(input);

    res.json({
      result: response
    });

  } catch (error: any) {
    console.error(
      "❌ Backend Error FULL:",
      error
    );

    res.status(500).json({
      message: "AI service temporarily unavailable",
      error: error.message
    });
  }
});

export default app;