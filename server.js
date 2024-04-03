import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import jwt from "jsonwebtoken";

// Load environment variables from .env file
env.config();

// Initialize Express app
const app = express();
const port = 5000;

// Set up bcrypt
const saltRounds = 10;

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_TOKEN;

// Connect to PostgreSQL database
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());

// Middleware function to verify JWT token
export default function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    } else {
      req.user = decoded; // Store decoded user information in request object
    }
    next(); // Proceed to the next middleware or route handler
  });
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const checkResult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (checkResult.rows.length > 0) {
      res.status(400).json({ message: "Username already exists!" });
    } else {
      // Hash the password
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          try {
            // Insert new user into the database
            await db.query(
              "INSERT INTO users (username, password) VALUES ($1, $2)",
              [username.trim(), hash]
            );
            res.status(200).json({
              message:
                "Thankyou very much for registering! Please proceed to log in.",
            });
          } catch (err) {
            res.status(400).json({ message: "Error executing registeration" });
          }
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: "Error executing sql query" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  try {
    // Query the database to find user with the provided username
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      // If user found
      const user = result.rows[0]; // Get the user data from the result
      const storedHashPassword = user.password; // Get the hashed password from the database
      // Compare the provided password with the hashed password
      bcrypt.compare(password, storedHashPassword, async (err, result) => {
        if (result) {
          // If passwords match
          // Create payload for JWT token
          const payload = {
            id: user.id,
            username: user.username,
          };
          // Generate JWT token with payload and secret key
          const token = jwt.sign(payload, secretKey, { expiresIn: "4d" });
          // Send success response with token
          res.status(200).json({
            message: "You are logged in!",
            token: token,
          });
        } else {
          // Send error response if passwords don't match
          res.status(401).json({ message: "Incorrect password" });
        }
      });
    } else {
      // Send error response if user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    // Send error response if there's an error executing the database query
    res.status(400).json({ message: "Error executing query" });
  }
});

app.post("/getUserData", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract the ID of the user from the request object
  const username = req.user.username; // Extract the username of the user from the request object
  try {
    // Query the database to fetch user data
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      try {
        // Fetch existing countries of the user from the database
        const existedCountriesArray = await db.query(
          "SELECT id, country_code FROM users_visited_countries WHERE user_id = $1;",
          [user.id]
        );
        // Send success response with username and existing countries array
        res.status(200).json({
          username: username,
          existedCountries: existedCountriesArray.rows,
        });
      } catch (e) {
        // Send error response if there's an error executing the query
        res.status(400).json("Error executing query" + e.message);
      }
    } else {
      // Send error response if user not found
      res.status(400).json("User not found");
    }
  } catch (e) {
    // Send error response if there's an invalid request
    res.status(400).json({ message: "Invalid Request" + e.message });
  }
});

app.post("/addCountry", verifyToken, async (req, res) => {
  const { code, country } = req.body; // Extract the country code from the request body
  const userId = req.user.id; // Extract the user ID from the request object
  // Query the database to check if the user exists
  const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  if (result.rows.length > 0) {
    try {
      const countryAlreadyExists = await db.query(
        "SELECT * FROM users_visited_countries WHERE user_id = $1 AND country_code = $2",
        [userId, code]
      );
      if (countryAlreadyExists.rows.length === 0) {
        try {
          // Insert the new country into the database and return the added country
          const addedCountry = await db.query(
            "INSERT INTO users_visited_countries (user_id, country_code) VALUES ($1, $2) RETURNING *;",
            [userId, code]
          );
          // Send success response with the ID of the added country
          res.status(200).json({ addedCountryId: addedCountry.rows[0].id });
        } catch {
          // Send error response if there's an error adding the country to the database
          res.status(400).json("Error adding country in database");
        }
      }
      else{
        res.status(400).json(`${country} already exists`);
      }
    } catch {
      res.status(400).json("Error executing query");
    }
  } else {
    // Send error response if user does not exist
    res.status(400).json("User not exists!");
  }
});

// Endpoint for deleting a country
app.delete("/deleteCountry", verifyToken, async (req, res) => {
  const { countryIdToDelete } = req.body; // Extract the ID of the country to delete from the request body
  try {
    // Delete the country from the database
    await db.query("DELETE FROM users_visited_countries WHERE id = $1", [countryIdToDelete]);
    // Send success response
    res.status(200).json("country deleted successfully");
  } catch {
    // Send error response if there's an error deleting the country from the database
    res.status(400).json("Error deleting country from database");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
