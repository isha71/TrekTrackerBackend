# TrekTracker
TrekTracker is a web application that allows users to track their travels by marking the countries they have visited on a world map. Users can register, log in, add countries they have visited, and log out. The application provides a visual representation of visited countries on a world map using React.js and VectorMap.

# Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Contributing](#contributing)
7. [License](#license)

### Features

- **User registration** with username, and password
- **User authentication and login** with username and password
- **Adding countries visited to the map**
- **Visual representation of visited countries on a world map**
- **Token-based authentication** with JSON Web Tokens (JWT)
- **Secure password storage** with bcrypt hashing
- Frontend built with **React.js**
- Backend built with **Node.js** and **Express**
- Database management with **PostgreSQL**
- **Log out functionality**

### Technologies Used

- React.js
- Node.js
- Express.js
- PostgreSQL
- Axios
- bcrypt
- cors
- jwt
- MUI (Material-UI)

### Getting Started

#### Prerequisites

- Node.js installed on your machine
- PostgreSQL installed and running locally or accessible via a URL.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/isha71/TrekTrackerBackend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Usage

1. Ensure your PostgreSQL server is running. 
2. Create .env file in backend directory and write down your database credentials and JWT secret token.
   To run this project, you will need to add the following environment variables to your .env file
   ```bash
   `PG_USER` = ""
   `PG_HOST` = ""
   `PG_DATABASE` = ""
   `PG_PASSWORD` = ""
   `PG_PORT` = ""
   `JWT_SECRET_TOKEN` = ""
   ```

3. You need to set up the necessary tables in    your PostgreSQL database. Below are the SQL queries to create the required tables:
    ```bash
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );

    CREATE TABLE users_visited_countries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        country_code VARCHAR(255),
    );
    ```
   
4.  Start the backend server:
   ```bash
   nodemon server.js
   ```

### API Endpoints

- **POST /register:** Register a new user.
- **POST /login:** Authenticate and log in a user.
- **POST /addCountry:** Add a new country for the authenticated user.
- **DELETE /deleteCountry:** Delete a country for the authenticated user.
- **POST /getUserData:** Retrieve user data and existing countries for the authenticated user.

### Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

### License

This project is licensed under the MIT License.
