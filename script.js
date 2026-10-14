
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");
const emptyMessage = document.getElementById("emptyMessage");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const taskSummary = document.getElementById("taskSummary");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("taskflow-tasks") || "[]"
  );

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  try {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  } catch {
    message.textContent = "Tasks save nahi ho paaye.";
  }
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completed;
  remainingTasks.textContent = remaining;

  taskSummary.textContent = `${remaining} tasks remaining`;
}

function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  emptyMessage.hidden = filteredTasks.length !== 0;

  if (tasks.length === 0) {
    emptyMessage.textContent = "No tasks yet. Add your first task!";
  } else if (filteredTasks.length === 0) {
    emptyMessage.textContent = "No tasks in this filter.";
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      updateStats();
      renderTasks();
    });

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      updateStats();
      renderTasks();
    });

    li.append(checkbox, span, deleteButton);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    message.textContent = "Please enter a task first.";
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: text,
    completed: false
  });

  saveTasks();
  taskInput.value = "";
  message.textContent = "";
  currentFilter = "all";

  filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  updateStats();
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderTasks();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  updateStats();
  renderTasks();
});

updateStats();
renderTasks();
