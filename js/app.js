//write the codes to manipulate the components in the ui
//get the task-container
const listContainer = document.querySelector(".tasks-list");

//render to the front end from the db.json
function render(tasks) {
  listContainer.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card ${
      task.priority === "high" ? "priority" : ""
    }`;
    taskCard.dataset.id = task.id; //add an attribute dataset to store the id as a custom data to task-card div

    taskCard.innerHTML = `
        <div class="drag-handle">
                    <span class="material-symbols-outlined"
                      >drag_indicator</span
                    >
                  </div>
                  <input type="checkbox" class="task-checkbox" ${
                    task.completed ? "checked" : ""
                  }/>
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

//fetch all tasks on load
async function startApp() {
  try {
    const tasks = await apiCalls.getTasks();
    render(tasks);
  } catch (error) {
    console.log('unable to initialize', error); 
    listContainer.innerHTML = `<p style = "padding: 2rem; "> is Json server still running? </p>`;
  }
}

//add event listener on the whole thing with an event of loading
document.addEventListener('DOMContentLoaded', startApp); 
