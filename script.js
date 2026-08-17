document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');
    const taskIdInput = document.getElementById('task-id');
    const saveBtn = document.getElementById('save-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('form-title');
    
    const tasksGrid = document.getElementById('tasks-grid');
    const emptyState = document.getElementById('empty-state');
    
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');

    let tasks = [];

    // Initialize application
    const init = () => {
        loadTasks();
        renderTasks();
        taskForm.addEventListener('submit', saveTaskEvent);
        cancelEditBtn.addEventListener('click', cancelEdit);
    };

    // Load tasks from LocalStorage
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('dailyTasks_Group19');
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
            } catch (error) {
                console.error("Error parsing tasks from local storage", error);
                tasks = [];
            }
        }
    };

    // Save tasks inside form flow
    const saveTaskEvent = (e) => {
        e.preventDefault();
        const text = taskTitle.value.trim();
        const editId = taskIdInput.value;

        if (!text) {
            taskTitle.classList.add('shake');
            setTimeout(() => taskTitle.classList.remove('shake'), 400);
            return;
        }

        if (editId) {
            // Edit existing task
            const index = tasks.findIndex(n => n.id === editId);
            if (index > -1) {
                tasks[index].text = text;
                tasks[index].updatedAt = new Date().toLocaleString();
            }
            cancelEdit(); // Reset form
        } else {
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                text,
                completed: false,
                createdAt: new Date().toLocaleString()
            };
            tasks.unshift(newTask); // Add to top
            taskTitle.value = '';
        }

        persistAndRender();
    };

    const persistAndRender = () => {
        localStorage.setItem('dailyTasks_Group19', JSON.stringify(tasks));
        renderTasks();
    };

    // Event delegation for grid buttons
    tasksGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains('btn-toggle')) toggleTask(id);
        else if (btn.classList.contains('btn-delete')) deleteTask(id);
        else if (btn.classList.contains('btn-edit')) prepareEditTask(id);
    });

    const toggleTask = (id) => {
        const index = tasks.findIndex(t => t.id === id);
        if (index > -1) {
            tasks[index].completed = !tasks[index].completed;
            persistAndRender();
        }
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        persistAndRender();
        // If they delete while editing that task, cancel edit
        if (taskIdInput.value === id) {
            cancelEdit();
        }
    };

    const prepareEditTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            taskTitle.value = task.text;
            taskIdInput.value = task.id;
            
            formTitle.textContent = 'Edit Task';
            saveBtn.textContent = 'UPDATE TASK';
            cancelEditBtn.classList.remove('hidden');
            
            // Scroll up to form
            taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            taskTitle.focus();
        }
    };

    const cancelEdit = () => {
        taskIdInput.value = '';
        taskTitle.value = '';
        formTitle.textContent = 'New Task';
        saveBtn.textContent = 'SAVE TASK';
        cancelEditBtn.classList.add('hidden');
    };

    // Update Statistics
    const updateStats = () => {
        totalTasksSpan.textContent = tasks.length;
        const completedCount = tasks.filter(t => t.completed).length;
        completedTasksSpan.textContent = completedCount;
    };

    // Render all tasks
    const renderTasks = () => {
        tasksGrid.innerHTML = '';
        
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            tasks.forEach(task => {
                const item = document.createElement('div');
                item.className = `note-item ${task.completed ? 'completed' : ''}`;
                
                // Escape text safely
                const tText = escapeHTML(task.text);
                const isCompleted = task.completed;
                const dateText = task.updatedAt ? `Updated: ${task.updatedAt}` : `Created: ${task.createdAt || 'Unknown'}`;

                item.innerHTML = `
                    <div class="note-date">${dateText}</div>
                    <div class="note-title">${tText}</div>
                    <div class="note-actions">
                        <button type="button" class="btn-sm btn-toggle" data-id="${task.id}">
                            ${isCompleted ? '✓ DONE' : 'DOING'}
                        </button>
                        <button type="button" class="btn-sm btn-edit" data-id="${task.id}">EDIT</button>
                        <button type="button" class="btn-sm btn-delete" data-id="${task.id}">DELETE</button>
                    </div>
                `;
                tasksGrid.appendChild(item);
            });
        }

        updateStats();
    };

    // Utility: prevent XSS by escaping HTML entities in task text
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    init();
});
