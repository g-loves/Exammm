const API_BASE = 'http://localhost:5000/api';

let currentUserId = null;
let currentUserName = null;


function switchToRegister() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('registerPage').classList.remove('hidden');
}


function switchToLogin() {
  document.getElementById('registerPage').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
}


document.getElementById('registerBtn').addEventListener('click', async () => {
  const name = document.getElementById('registerName').value;
  const password = document.getElementById('registerPassword').value;

  if (!name || !password) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Registration successful! Please login.');
      document.getElementById('registerName').value = '';
      document.getElementById('registerPassword').value = '';
      switchToLogin();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});


document.getElementById('loginBtn').addEventListener('click', async () => {
  const name = document.getElementById('loginName').value;
  const password = document.getElementById('loginPassword').value;

  if (!name || !password) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    const data = await response.json();
    if (response.ok) {
      currentUserId = data.userId;
      currentUserName = data.userName;
      localStorage.setItem('userId', currentUserId);
      localStorage.setItem('userName', currentUserName);
      
      document.getElementById('loginName').value = '';
      document.getElementById('loginPassword').value = '';
      
      showApp();
      loadTasks();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});


document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUserId = null;
  currentUserName = null;
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('appSection').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('registerPage').classList.add('hidden');
});


function showApp() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');
}


document.getElementById('addTaskBtn').addEventListener('click', async () => {
  const title = document.getElementById('taskInput').value;

  if (!title) {
    alert('Please enter a task');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, title }),
    });

    if (response.ok) {
      document.getElementById('taskInput').value = '';
      loadTasks();
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});


async function loadTasks() {
  try {
    const response = await fetch(`${API_BASE}/tasks/${currentUserId}`);
    const tasks = await response.json();

    const todoList = document.getElementById('todoList');
    const doneList = document.getElementById('doneList');

    todoList.innerHTML = '';
    doneList.innerHTML = '';

    tasks.forEach(task => {
      if (task.completed) {
        doneList.appendChild(createTaskElement(task, true));
      } else {
        todoList.appendChild(createTaskElement(task, false));
      }
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}


function createTaskElement(task, isCompleted) {
  const div = document.createElement('div');
  div.className = 'flex items-center justify-between bg-gray-50 p-3 rounded border-2 border-gray-200';
  
  div.innerHTML = `
    <span class="${isCompleted ? 'line-through text-gray-500' : ''}">${task.title}</span>
    <div class="flex gap-2">
      ${!isCompleted ? `
        <button class="text-green-500 hover:text-green-700 text-xl" onclick="markDone('${task._id}')">✓</button>
      ` : ''}
      <button class="text-red-500 hover:text-red-700 text-xl" onclick="deleteTask('${task._id}')">✕</button>
    </div>
  `;

  return div;
}

// Mark as Done
async function markDone(taskId) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    if (response.ok) {
      loadTasks();
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Delete Task
async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadTasks();
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Check if user is already logged in
window.addEventListener('load', () => {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  if (userId) {
    currentUserId = userId;
    currentUserName = userName;
    showApp();
    loadTasks();
  }
});
