//communicate with the db.json server
const URL = "http://localhost:3000/todos";

const apiCalls = {
  //get all the tasks in db.json
  async getTasks(query = "") {
    //use query inorder to use it in the search functionality
    const endPoint = query ? `${URL}?q=${query}` : URL;
    const result = await fetch(endPoint);
    if (!result.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return await result.json();
  },
  //create a new task
  async createTask(task) {
    const result = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...task,
        completed: false,
        createdAt: new Date().toISOString(),
      }),
    });

    return await result.json();
  },
  //path or updated a task
  async updateTask(id, updated) {
    const result = await fetch(`${URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!result.ok) throw new Error("Failed to update task");
    return await result.json();
  },
  //delete a task
  async deleteTask(deletedId) {
    const result = await fetch(`${URL}/${deletedId}`, {
      method: "DELETE",
    });
    return await result.json();
  },
};
