class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("todoTasks")) || []
    this.currentFilter = "all"
    this.searchQuery = ""
    this.taskIdCounter = this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1

    this.initializeElements()
    this.bindEvents()
    this.render()
    this.addDemoTasks()
  }

  initializeElements() {
    // Input elements
    this.taskInput = document.getElementById("taskInput")
    this.prioritySelect = document.getElementById("prioritySelect")
    this.addBtn = document.getElementById("addBtn")
    this.searchInput = document.getElementById("searchInput")
    this.clearSearchBtn = document.getElementById("clearSearch")

    // Filter elements
    this.filterBtns = document.querySelectorAll(".filter-btn")
    this.clearCompletedBtn = document.getElementById("clearCompleted")
    this.clearAllBtn = document.getElementById("clearAll")

    // Display elements
    this.taskList = document.getElementById("taskList")
    this.emptyState = document.getElementById("emptyState")
    this.progressFill = document.getElementById("progressFill")
    this.progressText = document.getElementById("progressText")
    this.progressEmoji = document.getElementById("progressEmoji")
    this.progressMessage = document.getElementById("progressMessage")

    // Counters
    this.allCount = document.getElementById("allCount")
    this.pendingCount = document.getElementById("pendingCount")
    this.completedCount = document.getElementById("completedCount")
    this.allCountFilter = document.getElementById("allCountFilter")
    this.pendingCountFilter = document.getElementById("pendingCountFilter")
    this.completedCountFilter = document.getElementById("completedCountFilter")

    // Modal
    this.confirmModal = document.getElementById("confirmModal")
    this.confirmMessage = document.getElementById("confirmMessage")
    this.confirmYes = document.getElementById("confirmYes")
    this.confirmNo = document.getElementById("confirmNo")
  }

  addDemoTasks() {
    if (this.tasks.length === 0) {
      const demoTasks = [
        {
          id: this.taskIdCounter++,
          text: "🚀 Complete the amazing todo list project",
          completed: false,
          priority: "high",
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: this.taskIdCounter++,
          text: "📚 Review JavaScript code and best practices",
          completed: true,
          priority: "medium",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: this.taskIdCounter++,
          text: "📝 Update README with beautiful documentation",
          completed: false,
          priority: "low",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          completedAt: null,
        },
        {
          id: this.taskIdCounter++,
          text: "🎨 Design beautiful UI components",
          completed: false,
          priority: "high",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          completedAt: null,
        },
      ]
      this.tasks = demoTasks
      this.saveToStorage()
      this.render()
    }
  }

  bindEvents() {
    // Add task
    this.addBtn.addEventListener("click", () => this.addTask())
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask()
    })

    // Search
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase()
      this.render()
      this.clearSearchBtn.style.display = this.searchQuery ? "block" : "none"
    })

    this.clearSearchBtn.addEventListener("click", () => {
      this.searchInput.value = ""
      this.searchQuery = ""
      this.render()
      this.clearSearchBtn.style.display = "none"
    })

    // Filters
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.currentFilter = e.target.closest('.filter-btn').dataset.filter
        this.updateFilterButtons()
        this.render()
      })
    })

    // Global actions
    this.clearCompletedBtn.addEventListener("click", () => {
      this.showConfirmModal("🗑️ Delete all completed tasks?", () => this.clearCompleted())
    })

    this.clearAllBtn.addEventListener("click", () => {
      this.showConfirmModal("⚠️ Delete all tasks? This action cannot be undone! 😱", () => this.clearAll())
    })

    // Modal
    this.confirmNo.addEventListener("click", () => this.hideConfirmModal())
    this.confirmModal.addEventListener("click", (e) => {
      if (e.target === this.confirmModal) this.hideConfirmModal()
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideConfirmModal()
      }
    })
  }

  addTask() {
    const text = this.taskInput.value.trim()
    if (!text) {
      this.taskInput.focus()
      this.showNotification("⚠️ Please enter a task!", "warning")
      return
    }

    const task = {
      id: this.taskIdCounter++,
      text: text,
      completed: false,
      priority: this.prioritySelect.value,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }

    this.tasks.unshift(task)
    this.taskInput.value = ""
    this.taskInput.focus()

    this.saveToStorage()
    this.render()
    this.showNotification("🎉 Task added successfully!", "success")
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? new Date().toISOString() : null
      this.saveToStorage()
      this.render()
      
      if (task.completed) {
        this.showNotification("✅ Task completed! Great job!", "success")
        this.celebrateCompletion()
      } else {
        this.showNotification("🔄 Task marked as pending", "info")
      }
    }
  }

  deleteTask(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`)
    if (taskElement) {
      taskElement.classList.add("removing")
      setTimeout(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id)
        this.saveToStorage()
        this.render()
        this.showNotification("🗑️ Task deleted", "warning")
      }, 500)
    }
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id)
    if (!task) return

    const newText = prompt("✏️ Edit your amazing task:", task.text)
    if (newText !== null && newText.trim() !== "") {
      task.text = newText.trim()
      this.saveToStorage()
      this.render()
      this.showNotification("✏️ Task updated successfully!", "success")
    }
  }

  clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length
    this.tasks = this.tasks.filter((t) => !t.completed)
    this.saveToStorage()
    this.render()
    this.showNotification(`🧹 ${completedCount} completed tasks cleared!`, "success")
  }

  clearAll() {
    const totalCount = this.tasks.length
    this.tasks = []
    this.saveToStorage()
    this.render()
    this.showNotification(`💥 All ${totalCount} tasks cleared!`, "warning")
  }

  getFilteredTasks() {
    let filtered = this.tasks

    // Filter by status
    switch (this.currentFilter) {
      case "pending":
        filtered = filtered.filter((t) => !t.completed)
        break
      case "completed":
        filtered = filtered.filter((t) => t.completed)
        break
    }

    // Filter by search
    if (this.searchQuery) {
      filtered = filtered.filter((t) => t.text.toLowerCase().includes(this.searchQuery))
    }

    return filtered
  }

  render() {
    const filteredTasks = this.getFilteredTasks()

    // Display tasks
    if (filteredTasks.length === 0) {
      this.taskList.style.display = "none"
      this.emptyState.style.display = "block"

      if (this.searchQuery) {
        this.emptyState.innerHTML = `
          <div class="empty-emoji">🔍</div>
          <h3>🤔 No results found</h3>
          <p>No tasks match "${this.searchQuery}" 😅</p>
        `
      } else if (this.currentFilter === "completed") {
        this.emptyState.innerHTML = `
          <div class="empty-emoji">🏆</div>
          <h3>🎉 No completed tasks yet</h3>
          <p>Complete some tasks to see them here! 💪</p>
        `
      } else if (this.currentFilter === "pending") {
        this.emptyState.innerHTML = `
          <div class="empty-emoji">⏰</div>
          <h3>🎊 All tasks completed!</h3>
          <p>Amazing work! You've completed everything! 🎉</p>
        `
      } else {
        this.emptyState.innerHTML = `
          <div class="empty-emoji">📝</div>
          <h3>🌟 Ready to be productive?</h3>
          <p>Add your first amazing task above! 🚀</p>
        `
      }
    } else {
      this.taskList.style.display = "block"
      this.emptyState.style.display = "none"

      this.taskList.innerHTML = filteredTasks.map((task) => this.createTaskHTML(task)).join("")
    }

    // Update counters
    this.updateCounts()

    // Update progress bar
    this.updateProgress()
  }

  createTaskHTML(task) {
    const createdDate = new Date(task.createdAt).toLocaleDateString("en-US")
    const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString("en-US") : null

    return `
      <li class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? "checked" : ""}" 
             onclick="todoApp.toggleTask(${task.id})">
          ${task.completed ? '<i class="fas fa-check"></i>' : '<div class="checkbox-dot"></div>'}
        </div>
        <div class="task-content">
          <div class="task-text ${task.completed ? "completed" : ""}">${this.escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="priority-badge priority-${task.priority}">
              ${this.getPriorityIcon(task.priority)}
              ${this.getPriorityText(task.priority)}
            </span>
            <span class="task-date">
              <i class="fas fa-calendar-plus"></i>
              📅 ${createdDate}
            </span>
            ${completedDate ? `
              <span class="task-date completed-date">
                <i class="fas fa-check-circle"></i>
                ✅ ${completedDate}
              </span>
            ` : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn edit-btn" onclick="todoApp.editTask(${task.id})" 
                  title="Edit Task">
            <i class="fas fa-edit"></i> ✏️
          </button>
          <button class="task-btn delete-btn" onclick="todoApp.deleteTask(${task.id})" 
                  title="Delete Task">
            <i class="fas fa-trash"></i> 🗑️
          </button>
        </div>
      </li>
    `
  }

  updateCounts() {
    const all = this.tasks.length
    const completed = this.tasks.filter((t) => t.completed).length
    const pending = all - completed

    // Update stat cards
    this.allCount.textContent = all
    this.completedCount.textContent = completed
    this.pendingCount.textContent = pending

    // Update filter buttons
    this.allCountFilter.textContent = all
    this.completedCountFilter.textContent = completed
    this.pendingCountFilter.textContent = pending
  }

  updateProgress() {
    const total = this.tasks.length
    const completed = this.tasks.filter((t) => t.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    this.progressFill.style.width = `${percentage}%`
    this.progressText.textContent = `${percentage}%`

    // Update emoji and message based on progress
    let emoji, message
    if (percentage === 100) {
      emoji = "🎉"
      message = "🎊 Amazing! You've completed everything! 🎊"
    } else if (percentage > 75) {
      emoji = "🔥"
      message = "🔥 You're on fire! Almost there! 🔥"
    } else if (percentage > 50) {
      emoji = "💪"
      message = "💪 Great progress! Keep going! 💪"
    } else if (percentage > 0) {
      emoji = "🚀"
      message = "🚀 Good start! You got this! 🚀"
    } else {
      emoji = "💪"
      message = "🌟 Ready to start your productive day? 🌟"
    }

    this.progressEmoji.textContent = emoji
    this.progressMessage.textContent = message
  }

  updateFilterButtons() {
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === this.currentFilter)
    })
  }

  showConfirmModal(message, onConfirm) {
    this.confirmMessage.textContent = message
    this.confirmModal.style.display = "block"

    // Remove old event listeners
    this.confirmYes.replaceWith(this.confirmYes.cloneNode(true))
    this.confirmYes = document.getElementById("confirmYes")

    this.confirmYes.addEventListener("click", () => {
      onConfirm()
      this.hideConfirmModal()
    })
  }

  hideConfirmModal() {
    this.confirmModal.style.display = "none"
  }

  celebrateCompletion() {
    // Add celebration animation
    const celebration = document.createElement("div")
    celebration.innerHTML = "🎉"
    celebration.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 2000;
      animation: celebrate 1s ease-out forwards;
      pointer-events: none;
    `

    const style = document.createElement("style")
    style.textContent = `
      @keyframes celebrate {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
        50% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.5);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1) translateY(-100px);
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(celebration)

    setTimeout(() => {
      document.body.removeChild(celebration)
      document.head.removeChild(style)
    }, 1000)
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div")
    
    const colors = {
      success: "linear-gradient(135deg, #48bb78, #38a169)",
      warning: "linear-gradient(135deg, #ed8936, #f56565)",
      info: "linear-gradient(135deg, #4299e1, #3182ce)",
      error: "linear-gradient(135deg, #f56565, #e53e3e)"
    }

    notification.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: ${colors[type]};
      color: white;
      padding: 20px 25px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      font-weight: 600;
      font-size: 1rem;
      max-width: 350px;
      animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `
    notification.textContent = message

    const style = document.createElement("style")
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOutRight {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }, 500)
    }, 4000)
  }

  getPriorityIcon(priority) {
    const icons = {
      high: '<i class="fas fa-fire"></i>',
      medium: '<i class="fas fa-bolt"></i>',
      low: '<i class="fas fa-target"></i>'
    }
    return icons[priority] || '<i class="fas fa-star"></i>'
  }

  getPriorityText(priority) {
    const texts = {
      high: "🔥 High",
      medium: "⚡ Medium",
      low: "🎯 Low"
    }
    return texts[priority] || priority
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  saveToStorage() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks))
  }
}

// Initialize the application
let todoApp
document.addEventListener("DOMContentLoaded", () => {
  todoApp = new TodoApp()
})

// Handle page visibility to save data
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && todoApp) {
    todoApp.saveToStorage()
  }
})

// Add some fun keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to add task quickly
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (todoApp && todoApp.taskInput.value.trim()) {
      todoApp.addTask()
    }
  }
  
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault()
    if (todoApp && todoApp.searchInput) {
      todoApp.searchInput.focus()
    }
  }
})

// Add some visual effects when the page loads
window.addEventListener("load", () => {
  // Add a subtle entrance animation to all elements
  const elements = document.querySelectorAll(".todo-container > *")
  elements.forEach((el, index) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    setTimeout(() => {
      el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    }, index * 100)
  })
})