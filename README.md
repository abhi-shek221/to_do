# Task Tracker Application

## Project Overview

Task Tracker is a full-stack web application designed to help users manage their tasks and journals efficiently. It provides a user-friendly interface for creating, updating, and organizing tasks and journal entries, with real-time synchronization and secure user authentication.

The application features a modern React frontend with protected routes, allowing users to sign up, log in, and access their personalized task and journal data. The backend is powered by an Express server integrated with Firebase Admin SDK for authentication and Firestore as the database, enabling real-time updates and seamless data management.

## Features

- User authentication with signup and login functionality.
- Protected routes to secure user data.
- Task management: create, update, delete, and list tasks.
- Journal management: create, update, delete, and list journal entries.
- Real-time synchronization of tasks and journals using Firebase Firestore.
- Motivational quotes to inspire users.
- Task statistics and progress tracking.
- Responsive layout with header, sidebar, and footer components.
- RESTful API backend with Express and Firebase Admin SDK.
- CORS configuration and detailed logging for backend requests.

## Technologies Used

### Frontend

- **React**: JavaScript library for building user interfaces.
- **React Router DOM**: For client-side routing and navigation.
- **React Toastify**: For toast notifications.
- **React Speech Recognition**: For voice input capabilities.
- **Chart.js & react-chartjs-2**: For rendering charts and visualizing task data.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Axios**: Promise-based HTTP client for API requests.
- **Date-fns**: Modern JavaScript date utility library.

### Backend

- **Node.js & Express.js**: Server-side JavaScript runtime and web framework.
- **Firebase Admin SDK**: For server-side Firebase authentication and Firestore access.
- **Firestore (Firebase Cloud Firestore)**: NoSQL cloud database for real-time data storage.
- **Helmet**: Security middleware to set HTTP headers.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.
- **Morgan**: HTTP request logger middleware.
- **Express Rate Limit**: Middleware to limit repeated requests to public APIs.

### Development Tools

- **Nodemon**: Utility that monitors for changes and automatically restarts the server.
- **Dotenv**: Loads environment variables from a .env file.
- **PostCSS & Autoprefixer**: For processing CSS with vendor prefixes.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Firebase project with Firestore and Authentication enabled
- Firebase Admin SDK service account key

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd task-tracker
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

4. Configure Firebase Admin SDK:
   - Place your `firebase-admin-key.json` file in the `backend` directory.
   - Create a `.env` file in the `backend` directory with your Firebase database URL:
     ```
     FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
     ```

### Running the Application

- Start the backend server:
  ```
  cd backend
  npm start
  ```

- Start the frontend development server:
  ```
  npm start
  ```

- Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to use the app.

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode.
- `npm test` - Launches the test runner.
- `npm run build` - Builds the app for production.
- `npm run eject` - Ejects the Create React App configuration.

## Learn More

- [React documentation](https://reactjs.org/)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [Firebase documentation](https://firebase.google.com/docs)
- [Express documentation](https://expressjs.com/)

## License

This project is licensed under the MIT License.
