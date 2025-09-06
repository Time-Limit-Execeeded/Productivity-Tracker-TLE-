const STORAGE_KEY = "task.checklist.v1";
const STORAGE_KEY2 = "completedTasks";
const newTaskInput = document.getElementById("newTask");
const newTimeInput = document.getElementById("newTime");
const addBtn = document.getElementById("addBtn");
const tasksEl = document.getElementById("tasks");
const countEl = document.getElementById("count");
const completionEl = document.getElementById("completion");
const progressFillEl = document.getElementById("progressFill");
const emptyMsg = document.getElementById("emptyMsg");
const filters = document.querySelectorAll(".filter-btn[data-filter]");
let filter = "all";
 let tasks = load();

console.log("Checklist loaded ✅");
function loadCompletedTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY2);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

 let completedTasks = loadCompletedTasks();
render();

addBtn.addEventListener("click", onAdd);
newTaskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onAdd();
});
newTimeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onAdd();
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  localStorage.removeItem(STORAGE_KEY2);
  completedTasks = [];
  save();
  render();
});

filters.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    filters.forEach((b) => b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    filter = e.currentTarget.dataset.filter;
    render();
  })
);

function onAdd() {
  const v = newTaskInput.value.trim();
  const duration = Number(newTimeInput.value);

  if (!v) return flash(newTaskInput);

  const t = {
    id: cryptoId(),
    text: v,
    done: false,
    created: Date.now(),
    duration: duration > 0 ? duration : null, // ✅ optional duration
  };

  tasks.unshift(t);
  newTaskInput.value = "";
  newTimeInput.value = "";
  save();
  render();
  focusTask(t.id);
}

function render() {
  tasksEl.innerHTML = "";
  let shown;
  if (filter === "active") {
    shown = tasks.filter((t) => !t.done);
  } else if (filter === "completed") {
    const currentCompleted = tasks.filter((t) => t.done);
    shown = [...currentCompleted, ...completedTasks];
  } else {
    shown = tasks;
  }

  emptyMsg.hidden = shown.length !== 0;

  shown.forEach((t) => {
    tasksEl.appendChild(elFor(t));
  });

  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  countEl.textContent = `${total} task${total !== 1 ? "s" : ""}`;
  completionEl.textContent = `${percentage}% complete`;
  progressFillEl.style.width = `${percentage}%`;
}

function elFor(t) {
  const li = document.createElement("li");
  li.className = "task-item" + (t.done ? " completed" : "");
  li.setAttribute("data-id", t.id);
  li.tabIndex = 0;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = !!t.done;
  checkbox.addEventListener("change", () => {
    toggle(t.id);
  });
  checkbox.setAttribute("aria-label", "Mark task as complete");

  const title = document.createElement("div");
  title.className = "task-text";
  title.innerHTML = `
    <span class="task-title">${t.text}</span>
    <span class="task-duration">${t.duration ? `Duration: ${t.duration} min` : ""}</span>
  `;
  title.contentEditable = false;
  title.addEventListener("dblclick", () => startEdit(t.id));

  li.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      toggle(t.id);
    }
    if (e.key === "Delete") {
      removeTask(t.id);
    }
    if (e.key === "Enter") {
      startEdit(t.id);
    }
  });

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit";
  editBtn.title = "Edit task";
  editBtn.innerHTML = "✏️";
  editBtn.addEventListener("click", () => startEdit(t.id));

  const delBtn = document.createElement("button");
  delBtn.className = "action-btn delete";
  delBtn.title = "Delete task";
  delBtn.innerHTML = "🗑️";
  delBtn.addEventListener("click", () => removeTask(t.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(title);
  li.appendChild(actions);

  setTimeout(() => li.classList.add("new-task"), 10);

  return li;
}

function toggle(id) {
  tasks = tasks.map((t) => {
    if (t.id === id) {
      const updatedTask = { ...t, done: !t.done };
      if (updatedTask.done) {
        const alreadyCompleted = completedTasks.some((ct) => ct.id === id);
        if (!alreadyCompleted) {
          completedTasks.push(updatedTask);
        }
      }
      return updatedTask;
    }
    return t;
  });
  save();
  render();
}

function removeTask(id) {
  const li = tasksEl.querySelector(`[data-id='${id}']`);
  if (li) {
    li.classList.add("removing");
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      save();
      render();
    }, 300);
  }
}

function startEdit(id) {
  const li = tasksEl.querySelector(`[data-id='${id}']`);
  if (!li) return;
  const title = li.querySelector(".task-text");
  title.contentEditable = true;
  title.focus();

  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(title);
  sel.removeAllRanges();
  sel.addRange(range);

  function finish() {
    title.contentEditable = false;
    const newText = title.textContent.trim();
    if (!newText) {
      removeTask(id);
    } else {
      tasks = tasks.map((t) => (t.id === id ? { ...t, text: newText } : t));
    }
    save();
    render();
  }

  title.addEventListener("blur", finish, { once: true });
  title.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      title.blur();
    }
    if (e.key === "Escape") {
      render();
    }
  });
}

function focusTask(id) {
  setTimeout(() => {
    const li = tasksEl.querySelector(`[data-id='${id}']`);
    if (li) li.focus();
  }, 100);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY2, JSON.stringify(completedTasks));
  } catch (e) {
    console.warn("Could not save", e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function flash(el) {
  try {
    el.animate(
      [
        { boxShadow: "0 0 0 0 rgba(239,68,68,0)" },
        { boxShadow: "0 0 0 6px rgba(239,68,68,0.4)" },
        { boxShadow: "0 0 0 0 rgba(239,68,68,0)" },
      ],
      {
        duration: 400,
        easing: "ease-out",
      }
    );
  } catch (e) {
    el.style.outline = "2px solid var(--danger)";
    setTimeout(() => {
      el.style.outline = "";
    }, 300);
  }
  el.focus();
}

function cryptoId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (window.crypto && crypto.getRandomValues) {
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    return Array.from(buf)
      .map((n) => n.toString(16).padStart(8, "0"))
      .join("");
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
