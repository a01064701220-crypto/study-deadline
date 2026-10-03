const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const courseInput = document.getElementById("course");
const typeInput = document.getElementById("type");
const deadlineInput = document.getElementById("deadline");

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const totalCount = document.getElementById("total-count");
const upcomingCount = document.getElementById("upcoming-count");
const completedCount = document.getElementById("completed-count");

const STORAGE_KEY = "studyDeadlineTasks";

let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDaysRemaining(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = parseLocalDate(deadline);
  targetDate.setHours(0, 0, 0, 0);

  const difference = targetDate - today;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline) {
  const days = getDaysRemaining(deadline);

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "D-1";
  }

  if (days > 1) {
    return `D-${days}`;
  }

  return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
}

function formatDate(deadline) {
  return parseLocalDate(deadline).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function updateSummary() {
  const completed = tasks.filter((task) => task.completed).length;
  const upcoming = tasks.filter((task) => !task.completed).length;

  totalCount.textContent = tasks.length;
  upcomingCount.textContent = upcoming;
  completedCount.textContent = completed;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = `task-card${task.completed ? " completed" : ""}`;

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("h3");
  title.textContent = task.title;

  const meta = document.createElement("p");
  meta.className = "task-meta";

  const courseText = task.course ? task.course : "No course";
  meta.textContent = `${courseText} · ${task.type} · ${formatDate(task.deadline)}`;

  const deadline = document.createElement("p");
  deadline.className = "deadline";
  deadline.textContent = task.completed
    ? "Completed"
    : formatDeadline(task.deadline);

  info.append(title, meta, deadline);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.className = "complete-button";
  completeButton.textContent = task.completed ? "Undo" : "Complete";
  completeButton.setAttribute(
    "aria-label",
    task.completed
      ? `Mark ${task.title} as incomplete`
      : `Mark ${task.title} as completed`
  );

  completeButton.addEventListener("click", () => {
    toggleTask(task.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  actions.append(completeButton, deleteButton);
  card.append(info, actions);

  return card;
}

function renderTasks() {
  taskList.innerHTML = "";

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }

    return parseLocalDate(a.deadline) - parseLocalDate(b.deadline);
  });

  sortedTasks.forEach((task) => {
    taskList.appendChild(createTaskCard(task));
  });

  emptyState.style.display = tasks.length === 0 ? "block" : "none";

  updateSummary();
}

function addTask(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const course = courseInput.value.trim();
  const type = typeInput.value;
  const deadline = deadlineInput.value;

  if (!title || !deadline) {
    return;
  }

  const newTask = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    title,
    course,
    type,
    deadline,
    completed: false,
  };

  tasks.push(newTask);

  saveTasks();
  renderTasks();

  taskForm.reset();
  titleInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", addTask);

renderTasks();
