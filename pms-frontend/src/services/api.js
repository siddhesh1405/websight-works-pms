const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const API_MODE = import.meta.env.VITE_API_MODE || "live";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "pms_token";

let projects = [
  {
    id: "P-1001",
    title: "Client Portal Redesign",
    description: "Modernize client dashboard and improve onboarding UX.",
    startDate: "2026-01-12",
    endDate: "2026-04-30",
    progress: 68,
    status: "ACTIVE",
  },
  {
    id: "P-1002",
    title: "Mobile App 2.0",
    description: "Rebuild mobile experience for task collaboration.",
    startDate: "2026-02-02",
    endDate: "2026-06-12",
    progress: 28,
    status: "PLANNING",
  },
];

let users = [
  { id: "U-1", name: "Aarav Patel", email: "aarav@pms.io", role: "Admin" },
  { id: "U-2", name: "Sofia Carter", email: "sofia@pms.io", role: "Member" },
  { id: "U-3", name: "Liam Brooks", email: "liam@pms.io", role: "Member" },
];

let roles = [
  { id: 1, roleName: "ADMIN" },
  { id: 2, roleName: "USER" },
];

let tasks = [
  {
    id: "T-2001",
    title: "Wireframe dashboard analytics",
    description: "Prepare high-fidelity wireframes for the dashboard.",
    projectId: "P-1001",
    assignedUser: "Aarav Patel",
    userId: "U-1",
    status: "ACTIVE",
    subtasks: [
      { id: "S-1", title: "Gather requirements", done: true, status: "COMPLETED", userId: "U-1" },
      { id: "S-2", title: "Create low-fidelity draft", done: false, status: "ACTIVE", userId: "U-2" },
    ],
  },
];

const parsePagedContent = (data) => (Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []);

const toTaskApiStatus = (status = "") => {
  const normalized = String(status).toUpperCase();
  if (normalized === "TODO") return "PLANNING";
  if (normalized === "IN_PROGRESS") return "ACTIVE";
  if (normalized === "COMPLETED") return "COMPLETED";
  if (["PLANNING", "ACTIVE"].includes(normalized)) return normalized;
  return "PLANNING";
};

const toUiRole = (roleName = "") => {
  const normalized = String(roleName).toUpperCase();
  if (normalized.includes("ADMIN")) return "Admin";
  return "Member";
};

const toApiRoleName = (uiRole = "") => {
  return String(uiRole).toLowerCase() === "admin" ? "ADMIN" : "USER";
};

const pickRoleForUi = (roleList, uiRole) => {
  const wantAdmin = String(uiRole).toLowerCase() === "admin";
  const byName = roleList.find((role) => {
    const name = String(role.roleName || "").toUpperCase();
    return wantAdmin ? name.includes("ADMIN") : !name.includes("ADMIN");
  });
  return byName || roleList[0] || null;
};

const projectPayloadForSpring = (payload) => ({
  title: payload.title,
  description: payload.description,
  startDate: payload.startDate,
  endDate: payload.endDate,
});

const normalizeProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  startDate: project.startDate,
  endDate: project.endDate,
  status: (project.status || "PLANNING").toUpperCase(),
  progress: Number(project.progress ?? 0),
});

const deriveTaskFromSubtasks = (task) => {
  const subtasks = task.subtasks || [];
  if (!subtasks.length) {
    return { ...task, progress: task.status === "COMPLETED" ? 100 : 0 };
  }

  const completed = subtasks.filter((subtask) => subtask.status === "COMPLETED").length;
  const planningOnly = subtasks.every((subtask) => subtask.status === "PLANNING");
  const progress = Math.round((completed / subtasks.length) * 100);

  let status = "ACTIVE";
  if (completed === subtasks.length) status = "COMPLETED";
  else if (planningOnly) status = "PLANNING";

  return { ...task, status, progress };
};

const deriveProjectFromTasks = (project, projectTasks) => {
  if (!projectTasks.length) {
    return { ...project, status: "PLANNING", progress: 0 };
  }

  const completed = projectTasks.filter((task) => task.status === "COMPLETED").length;
  const planningOnly = projectTasks.every((task) => task.status === "PLANNING");
  const progress = Math.round((completed / projectTasks.length) * 100);

  let status = "ACTIVE";
  if (completed === projectTasks.length) status = "COMPLETED";
  else if (planningOnly) status = "PLANNING";

  return { ...project, status, progress };
};

const http = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }

    let message = "";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
      else if (body?.details && typeof body.details === "object") {
        message = Object.values(body.details).join(", ");
      }
    } catch {
      message = "";
    }

    if (!message && response.status === 403) {
      message = "Not allowed for your role.";
    }

    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

const toTaskView = (task, projectMap, userMap) => {
  const projectId = String(task.projectId);
  const userId = String(task.userId);
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    projectId,
    userId,
    project: projectMap.get(projectId) || "Unknown",
    assignedUser: userMap.get(userId) || "Unknown",
  };
};

const mockApi = {
  async getProjects() {
    await wait();
    return [...projects];
  },

  async createProject(payload) {
    await wait();
    const project = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      progress: 0,
      status: payload.status || "PLANNING",
      title: payload.title,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    projects = [project, ...projects];
    return project;
  },

  async updateProject(projectId, payload) {
    await wait();
    projects = projects.map((project) =>
      String(project.id) === String(projectId)
        ? { ...project, ...payload, status: payload.status || project.status }
        : project,
    );
    return projects.find((project) => String(project.id) === String(projectId));
  },

  async deleteProject(projectId) {
    await wait();
    const relatedTaskIds = tasks
      .filter((task) => String(task.projectId) === String(projectId))
      .map((task) => task.id);
    tasks = tasks.filter((task) => String(task.projectId) !== String(projectId));
    projects = projects.filter((project) => String(project.id) !== String(projectId));
    return { id: projectId, deletedTaskIds: relatedTaskIds };
  },

  async getProjectById(projectId) {
    await wait();
    return projects.find((project) => String(project.id) === String(projectId)) || null;
  },

  async getUsers() {
    await wait();
    return [...users];
  },

  async getRoles() {
    await wait();
    return [...roles];
  },

  async createUser(payload) {
    await wait();
    const roleName = toApiRoleName(payload.role);
    const user = {
      id: `U-${Math.floor(1000 + Math.random() * 9000)}`,
      name: payload.name,
      email: payload.email,
      role: toUiRole(roleName),
    };
    users = [user, ...users];
    return user;
  },

  async updateUser(userId, payload) {
    await wait();
    users = users.map((user) =>
      String(user.id) === String(userId)
        ? {
            ...user,
            name: payload.name,
            email: payload.email,
            role: toUiRole(toApiRoleName(payload.role)),
          }
        : user,
    );
    return users.find((user) => String(user.id) === String(userId));
  },

  async deleteUser(userId) {
    await wait();
    users = users.filter((user) => String(user.id) !== String(userId));
    return { id: userId };
  },

  async getTasks(filters = {}) {
    await wait();
    const data = filters.projectId
      ? tasks.filter((task) => String(task.projectId) === String(filters.projectId))
      : tasks;
    return [...data];
  },

  async createTask(payload) {
    await wait();
    const user = users.find((entry) => String(entry.id) === String(payload.userId));
    const task = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      title: payload.title,
      description: payload.description,
      status: toTaskApiStatus(payload.status),
      projectId: payload.projectId,
      userId: payload.userId,
      assignedUser: user?.name || "Unknown",
      subtasks: [],
    };
    tasks = [task, ...tasks];
    return task;
  },

  async updateTask(taskId, payload) {
    await wait();
    const user = users.find((entry) => String(entry.id) === String(payload.userId));
    tasks = tasks.map((task) =>
      String(task.id) === String(taskId)
        ? {
            ...task,
            title: payload.title,
            description: payload.description,
            status: toTaskApiStatus(payload.status),
            projectId: payload.projectId,
            userId: payload.userId,
            assignedUser: user?.name || task.assignedUser,
          }
        : task,
    );
    return tasks.find((task) => String(task.id) === String(taskId));
  },

  async updateTaskStatus(taskId, status) {
    await wait();
    tasks = tasks.map((task) =>
      String(task.id) === String(taskId)
        ? {
            ...task,
            status: toTaskApiStatus(status),
          }
        : task,
    );
    return tasks.find((task) => String(task.id) === String(taskId));
  },

  async deleteTask(taskId) {
    await wait();
    tasks = tasks.filter((task) => String(task.id) !== String(taskId));
    return { id: taskId };
  },

  async getTasksByProject(projectId) {
    return mockApi.getTasks({ projectId });
  },

  async createSubtask(taskId, payload) {
    await wait();
    tasks = tasks.map((task) => {
      if (String(task.id) !== String(taskId)) return task;
      return {
        ...task,
        subtasks: [
          ...task.subtasks,
          {
            id: `S-${Math.floor(100 + Math.random() * 900)}`,
            title: payload.title,
            status: toTaskApiStatus(payload.status),
            done: toTaskApiStatus(payload.status) === "COMPLETED",
            userId: payload.userId,
          },
        ],
      };
    });
  },

  async deleteSubtask(taskId, subtaskId) {
    await wait();
    tasks = tasks.map((task) => {
      if (String(task.id) !== String(taskId)) return task;
      return {
        ...task,
        subtasks: task.subtasks.filter((subtask) => String(subtask.id) !== String(subtaskId)),
      };
    });
    return { id: subtaskId };
  },

  async toggleSubtask(taskId, subtaskId) {
    await wait(80);
    tasks = tasks.map((task) => {
      if (String(task.id) !== String(taskId)) return task;
      return {
        ...task,
        subtasks: task.subtasks.map((subtask) => {
          if (String(subtask.id) !== String(subtaskId)) return subtask;
          const done = !subtask.done;
          return {
            ...subtask,
            done,
            status: done ? "COMPLETED" : "ACTIVE",
          };
        }),
      };
    });
  },

  async getDashboardMetrics() {
    await wait();
    return {
      totalProjects: projects.length,
      activeTasks: tasks.filter((task) => task.status === "ACTIVE").length,
      completedTasks: tasks.filter((task) => task.status === "COMPLETED").length,
      teamMembers: users.length,
      recentProjects: projects.slice(0, 5),
      progress: projects.map((project) => ({ id: project.id, title: project.title, value: project.progress })),
    };
  },
};

const liveApi = {
  async getProjects() {
    const data = await http("/projects");
    const rawProjects = parsePagedContent(data).map(normalizeProject);
    let allTasks = [];
    try {
      allTasks = await liveApi.getTasks();
    } catch (taskErr) {
      console.warn("Failed to derive project metrics from tasks. Falling back to base project data.", taskErr);
    }

    const derivedProjects = rawProjects.map((project) =>
      deriveProjectFromTasks(
        project,
        allTasks.filter((task) => String(task.projectId) === String(project.id)),
      ),
    );

    projects = derivedProjects;
    return derivedProjects;
  },

  async createProject(payload) {
    const data = await http("/projects", {
      method: "POST",
      body: JSON.stringify(projectPayloadForSpring(payload)),
    });
    const project = normalizeProject(data);
    projects = [project, ...projects.filter((item) => String(item.id) !== String(project.id))];
    return project;
  },

  async updateProject(projectId, payload) {
    const data = await http(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(projectPayloadForSpring(payload)),
    });
    const project = normalizeProject(data);
    projects = [project, ...projects.filter((item) => String(item.id) !== String(project.id))];
    return project;
  },

  async deleteProject(projectId) {
    const projectTasks = await liveApi.getTasks({ projectId });
    await Promise.all(projectTasks.map((task) => liveApi.deleteTask(task.id)));
    await http(`/projects/${projectId}`, {
      method: "DELETE",
    });
    projects = projects.filter((project) => String(project.id) !== String(projectId));
    return { id: projectId };
  },

  async getProjectById(projectId) {
    const data = await http(`/projects/${projectId}`);
    const rawProject = normalizeProject(data);
    const projectTasks = await liveApi.getTasks({ projectId });
    const project = deriveProjectFromTasks(rawProject, projectTasks);
    projects = [project, ...projects.filter((item) => String(item.id) !== String(project.id))];
    return project;
  },

  async getUsers() {
    const data = await http("/users");
    const list = parsePagedContent(data).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: toUiRole(user.roleName),
    }));
    users = list;
    return list;
  },

  async getRoles() {
    const data = await http("/roles");
    roles = (Array.isArray(data) ? data : []).map((role) => ({
      id: role.id,
      roleName: role.roleName,
    }));
    return roles;
  },

  async createUser(payload) {
    const roleList = await liveApi.getRoles();
    const targetRole = pickRoleForUi(roleList, payload.role);
    if (!targetRole) throw new Error("Role not found");

    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      roleId: Number(targetRole.id),
    };

    const data = await http("/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await liveApi.getUsers();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: toUiRole(data.roleName),
    };
  },

  async updateUser(userId, payload) {
    const roleList = await liveApi.getRoles();
    const targetRole = pickRoleForUi(roleList, payload.role);
    if (!targetRole) throw new Error("Role not found");

    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      roleId: Number(targetRole.id),
    };

    const data = await http(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    await liveApi.getUsers();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: toUiRole(data.roleName),
    };
  },

  async deleteUser(userId) {
    await http(`/users/${userId}`, {
      method: "DELETE",
    });
    await liveApi.getUsers();
    return { id: userId };
  },

  async getTasks(filters = {}) {
    const query = new URLSearchParams();
    if (filters.projectId) query.set("projectId", filters.projectId);
    query.set("size", "200");

    const [tasksData, usersList, projectsData] = await Promise.all([
      http(`/tasks?${query.toString()}`),
      liveApi.getUsers(),
      http("/projects"),
    ]);

    const taskRows = parsePagedContent(tasksData);
    const userMap = new Map(usersList.map((user) => [String(user.id), user.name]));
    const projectsList = parsePagedContent(projectsData).map(normalizeProject);
    const projectMap = new Map(projectsList.map((project) => [String(project.id), project.title]));

    const mappedTasks = taskRows.map((task) => ({ ...toTaskView(task, projectMap, userMap), subtasks: [] }));

    const subtasksByTask = new Map();
    await Promise.all(
      mappedTasks.map(async (task) => {
        try {
          const subtaskData = await http(`/subtasks?taskId=${task.id}&size=200`);
          const subtaskRows = parsePagedContent(subtaskData).map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            status: subtask.status,
            taskId: subtask.taskId,
            userId: subtask.userId,
            assignedUser: userMap.get(String(subtask.userId)) || "Unknown",
            done: subtask.status === "COMPLETED",
          }));
          subtasksByTask.set(String(task.id), subtaskRows);
        } catch (subtaskErr) {
          console.warn(`Failed to load subtasks for task ${task.id}.`, subtaskErr);
          subtasksByTask.set(String(task.id), []);
        }
      }),
    );

    tasks = mappedTasks.map((task) =>
      deriveTaskFromSubtasks({
        ...task,
        subtasks: subtasksByTask.get(String(task.id)) || [],
      }),
    );

    return tasks;
  },

  async createTask(payload) {
    const body = {
      title: payload.title,
      description: payload.description,
      status: toTaskApiStatus(payload.status),
      projectId: Number(payload.projectId),
      userId: Number(payload.userId),
    };

    const data = await http("/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await liveApi.getTasks();
    return data;
  },

  async updateTask(taskId, payload) {
    const body = {
      title: payload.title,
      description: payload.description,
      status: toTaskApiStatus(payload.status),
      projectId: Number(payload.projectId),
      userId: Number(payload.userId),
    };

    const data = await http(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    await liveApi.getTasks();
    return data;
  },

  async updateTaskStatus(taskId, status) {
    const data = await http(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: toTaskApiStatus(status),
      }),
    });
    await liveApi.getTasks();
    return data;
  },

  async deleteTask(taskId) {
    const subtaskData = await http(`/subtasks?taskId=${taskId}&size=200`);
    const subtaskRows = parsePagedContent(subtaskData);
    await Promise.all(
      subtaskRows.map((subtask) =>
        http(`/subtasks/${subtask.id}`, {
          method: "DELETE",
        }),
      ),
    );
    await http(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    await liveApi.getTasks();
    return { id: taskId };
  },

  async getTasksByProject(projectId) {
    return liveApi.getTasks({ projectId });
  },

  async createSubtask(taskId, payload) {
    const body = {
      title: payload.title,
      status: toTaskApiStatus(payload.status),
      taskId: Number(taskId),
      userId: Number(payload.userId),
    };

    await http("/subtasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async deleteSubtask(taskId, subtaskId) {
    await http(`/subtasks/${subtaskId}`, {
      method: "DELETE",
    });
    await liveApi.getTasks();
    return { id: subtaskId, taskId };
  },

  async toggleSubtask(taskId, subtaskId) {
    const current = await http(`/subtasks/${subtaskId}`);
    const nextStatus = current.status === "COMPLETED" ? "ACTIVE" : "COMPLETED";

    await http(`/subtasks/${subtaskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: nextStatus,
      }),
    });
  },

  async getDashboardMetrics() {
    const [projectsList, taskList, usersList] = await Promise.all([
      liveApi.getProjects(),
      liveApi.getTasks(),
      liveApi.getUsers(),
    ]);

    return {
      totalProjects: projectsList.length,
      activeTasks: taskList.filter((task) => task.status === "ACTIVE").length,
      completedTasks: taskList.filter((task) => task.status === "COMPLETED").length,
      teamMembers: usersList.length,
      recentProjects: projectsList.slice(0, 5),
      progress: projectsList.map((project) => ({ id: project.id, title: project.title, value: project.progress })),
    };
  },
};

export const api = API_MODE === "live" ? liveApi : mockApi;
