const fs = require("fs");
const files = [
  "src/components/Layout/Header.jsx",
  "src/components/Layout/Sidebar.jsx",
  "src/components/Layout/Footer.jsx",
  "src/components/Dashboard/Dashboard.jsx",
  "src/components/Dashboard/TasksChart.jsx",
  "src/components/Dashboard/GoalsProgress.jsx",
  "src/components/Dashboard/MotivationCard.jsx",
  "src/components/Tasks/TaskForm.jsx",
  "src/components/Tasks/TaskList.jsx",
  "src/components/Tasks/TaskItem.jsx",
  "src/components/Journal/JournalForm.jsx",
  "src/components/Journal/JournalList.jsx",
  "src/components/VoiceInput/VoiceInput.jsx",
  "src/context/TaskContext.jsx",
  "src/services/api.js",
  "src/utils/helpers.js",
  "src/hooks/useLocalStorage.js",
];

files.forEach((file) => fs.writeFileSync(file, "", { flag: "wx" }));
console.log("Files created successfully!");
