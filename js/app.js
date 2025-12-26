//write the codes to manipulate the components in the ui

//1. list all the tasks
//get the task-container
const listContainer = document.querySelector(".tasks-list");

//detail pannel elements to update
const detailsPanel = document.querySelector(".details-panel");
const titleInput = document.querySelector(".title-input");
const noteInput = document.querySelector(".notes-textarea");
const closePanelBtn = document.querySelector(".btn-close");
const deleteTask = detailsPanel.querySelector(".btn-delete");
const deadlineInput = document.querySelector(".deadline-input");
const categoryInput = document.querySelector(".category-input");

let currentTaskId = null;

//render the current time
const dateDisplay = document.querySelector(".page-date");
if (dateDisplay) {
  dateDisplay.innerHTML = `
    <span class="material-symbols-outlined date-icon">calendar_today</span>
    ${new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    })}
  `;
}
//render to listContainer in the front end
function render(tasks) {
  listContainer.innerHTML = "";
  tasks.reverse().forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card`;
    taskCard.dataset.id = task.id; //adinid an attribute dataset to store the id as a custom data to task-card div

    const isCompleted = task.completed ? "checked" : "";
    const completedClass = task.completed ? "completed" : "";

    taskCard.className = `task-card ${completedClass}`;
    taskCard.innerHTML = `
        <div class="drag-handle">
                    <span class="material-symbols-outlined"
                      >drag_indicator</span
                    >
                  </div>
                  <input type="checkbox" class="task-checkbox" ${isCompleted}/>
                  <div class="task-content">
                    <p class="task-title">${task.title}</p>
                    <div class="task-meta">
                      ${
                        task.dueDate
                          ? `<span class="task-time">
                        <span class="material-symbols-outlined">schedule</span>
                        ${task.dueDate}
                      </span>`
                          : ""
                      }
                      <span class="task-category">
                        <span class="material-symbols-outlined">folder</span>
                        ${task.category || "General"}
                      </span>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit task">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-btn delete-btn" title="Delete task">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
        `;

    listContainer.appendChild(taskCard);
  });
}
//before starting the app handle deletion
listContainer.addEventListener("click", handleDelete);

//fetch all tasks on load
async function startApp() {
  try {
    const tasks = await apiCalls.getTasks();
    render(tasks);
  } catch (error) {
    console.log("unable to initialize", error);
    listContainer.innerHTML = `<p style = "padding: 2rem; "> is Json server still running? </p>`;
  }
}

//add event listener on the whole thing with an event of loading
document.addEventListener("DOMContentLoaded", startApp);

//post new tasks from the ui
//get the button and input area of the task
const taskInputArea = document.querySelector(".add-task-input");
const taskInputBtn = document.querySelector(".add-task-btn");

//when you add a task then you are creating a new cardTask, as you did above
async function addTask(event) {
  if (event) event.preventDefault();
  //get the title from the inputarea
  const title = taskInputArea.value.trim();
  if (title.length === 0) return;
  //first create an object, then fill it with the info from the input area
  const addedTask = {
    title,
    description: "",
    category: "Work",
    dueDate: new Date().toLocaleDateString(),
  };

  //add this task to the db.json usin gthe addTask() method from the api call
  try {
    const newTask = await apiCalls.createTask(addedTask);

    //re render the tasks after the aboev addition
    const newList = await apiCalls.getTasks();
    render(newList);

    taskInputArea.value = "";
  } catch (err) {
    console.log(err);
  }
}

//event listeners
taskInputBtn.addEventListener("click", addTask);

//pressing enter to submit
taskInputArea.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask(event);
  }
});

//delete tasks
//adding eventListeners to each buttons ain't the right way, we add event listener on the whole list container and get the specific event using
async function handleDelete(e) {
  //use closest to find the closest child with the class name of task-card
  const taskCard = e.target.closest(".task-card");

  if (!taskCard) return; //if nothing in the db just return

  //get the id from the taskCard dataset, saved while rendering
  const id = taskCard.dataset.id;

  //handleDeletion
  if (e.target.closest(".delete-btn")) {
    try {
      await apiCalls.deleteTask(id);
      //remove it from the list
      taskCard.remove();
    } catch (err) {
      alert("failed to delete task");
    }
  }

  //handle edit
  if (e.target.closest(".edit-btn")) {
    const title = taskCard.querySelector(".task-title").innerText;

    //show the details panel
    detailsPanel.style.display = "flex";

    //add titles and description if there is any
    titleInput.value = title;
    currentTaskId = id;

    //get description to populate the notes input area for those with descriptions
    const tasks = await apiCalls.getTasks();
    //find the task with the specific id
    const currentTask = tasks.find((task) => task.id === id);
    noteInput.value = currentTask.description || "";
    deadlineInput.value = currentTask.dueDate || "";

    categoryInput.value = currentTask.category || "";
  }

  // handle checkbox
  if (e.target.classList.contains("task-checkbox")) {
    const isCompleted = e.target.checked;
    try {
      await apiCalls.updateTask(id, { completed: isCompleted });

      taskCard.classList.toggle("completed", isCompleted);
    } catch (err) {
      e.target.checked = !isCompleted;
      alert("Failed to sync status with server");
    }
  }
}

//remove the details panel
closePanelBtn.addEventListener("click", () => {
  detailsPanel.style.display = "none";
  currentTaskId = null;
});

//also delete from the details panel
deleteTask.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await apiCalls.deleteTask(currentTaskId);
  } catch (err) {
    alert("failed to delete task");
  }
});

//save the texts(title and notes) in the details panel to the db
async function saveChanges() {
  if (!currentTaskId) return;

  const changed = {
    title: titleInput.value,
    description: noteInput.value,
    dueDate: deadlineInput.value,
    category: categoryInput.value.trim(),
  };

  //now udate the task
  try {
    //update the task with an api end point
    await apiCalls.updateTask(currentTaskId, changed);
  } catch (err) {}
}

titleInput.addEventListener("blur", saveChanges);
noteInput.addEventListener("blur", saveChanges);
deadlineInput.addEventListener("change", saveChanges);
categoryInput.addEventListener("blur", saveChanges);

//search feature
const searchInput = document.querySelector("#taskSearch");

searchInput.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.toLowerCase();

  try {
    // Fetch the tasks from your API
    const allTasks = await apiCalls.getTasks();

    // Filter based on Title or Category
    const filteredTasks = allTasks.filter((task) => {
      const title = task.title.toLowerCase();
      const category = (task.category || "").toLowerCase();
      return title.includes(searchTerm) || category.includes(searchTerm);
    });

    // Use your existing render function to show only matches
    render(filteredTasks);
  } catch (err) {
    console.error("Search failed", err);
  }
});
