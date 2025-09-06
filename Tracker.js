// Get completed tasks from localStorage (no import needed)

// Chart.js configuration and data management
let taskChart = null;
let statsPieChart = null;
let chartData = {
  labels: [],
  datasets: [{
    label: 'Task Duration (minutes)',
    data: [],
    backgroundColor: [
      'rgba(255, 107, 107, 0.8)',  // Red
      'rgba(255, 165, 0, 0.8)',    // Orange
      'rgba(255, 255, 0, 0.8)',    // Yellow
      'rgba(0, 255, 0, 0.8)',      // Green
      'rgba(0, 191, 255, 0.8)',    // Deep Sky Blue
      'rgba(138, 43, 226, 0.8)',   // Blue Violet
      'rgba(255, 20, 147, 0.8)',   // Deep Pink
      'rgba(50, 205, 50, 0.8)',    // Lime Green
      'rgba(255, 69, 0, 0.8)',     // Red Orange
      'rgba(30, 144, 255, 0.8)',   // Dodger Blue
      'rgba(255, 105, 180, 0.8)',  // Hot Pink
      'rgba(0, 255, 127, 0.8)',    // Spring Green
      'rgba(255, 215, 0, 0.8)',    // Gold
      'rgba(72, 209, 204, 0.8)',   // Medium Turquoise
      'rgba(255, 99, 71, 0.8)'     // Tomato
    ],
    borderColor: [
      'rgba(255, 107, 107, 1)',
      'rgba(255, 165, 0, 1)',
      'rgba(255, 255, 0, 1)',
      'rgba(0, 255, 0, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(138, 43, 226, 1)',
      'rgba(255, 20, 147, 1)',
      'rgba(50, 205, 50, 1)',
      'rgba(255, 69, 0, 1)',
      'rgba(30, 144, 255, 1)',
      'rgba(255, 105, 180, 1)',
      'rgba(0, 255, 127, 1)',
      'rgba(255, 215, 0, 1)',
      'rgba(72, 209, 204, 1)',
      'rgba(255, 99, 71, 1)'
    ],
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false,
  }]
};

let pieChartData = {
  labels: ['Focused Time', 'Sleep', 'Other Activities'],
  datasets: [{
    data: [0, 360, 1080], // 0 min focused, 360 min sleep (6 hours), 1080 min other (18 hours)
    backgroundColor: [
      'rgba(255, 107, 107, 0.8)',  // Red for focused time
      'rgba(75, 0, 130, 0.8)',     // Purple for sleep
      'rgba(135, 206, 235, 0.6)'   // Light blue for other activities
    ],
    borderColor: [
      'rgba(255, 107, 107, 1)',
      'rgba(75, 0, 130, 1)',
      'rgba(135, 206, 235, 1)'
    ],
    borderWidth: 2
  }]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing chart...');
  
  // Add a small delay to ensure all elements are ready
  setTimeout(() => {
    initializeChart();
    initializePieChart();
    updateStats();
    updateChart();
    updatePieChart();
    
    // Listen for changes in completed tasks
    setupTaskChangeListener();
  }, 100);
});

// Initialize the Chart.js bar chart
function initializeChart() {
  const ctx = document.getElementById('taskChart');
  if (!ctx) {
    console.error('Chart canvas element not found!');
    return;
  }

  console.log('Initializing chart with canvas:', ctx);
  
  // Destroy existing chart if it exists
  if (taskChart) {
    taskChart.destroy();
  }

  try {
    taskChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Completed Tasks Duration',
          color: 'white',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          labels: {
            color: 'white',
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 31, 77, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(0, 170, 255, 0.8)',
          borderWidth: 1,
          callbacks: {
            title: function(context) {
              return `Task: ${context[0].label}`;
            },
            label: function(context) {
              return `Duration: ${context.parsed.y} minutes`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
            font: {
              size: 12
            },
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'white',
            font: {
              size: 12
            },
            callback: function(value) {
              return value + ' min';
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
  
  console.log('Chart initialized successfully:', taskChart);
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

// Initialize the pie chart
function initializePieChart() {
  const ctx = document.getElementById('statsPieChart');
  if (!ctx) {
    console.error('Pie chart canvas element not found!');
    return;
  }

  console.log('Initializing pie chart with canvas:', ctx);
  
  // Destroy existing chart if it exists
  if (statsPieChart) {
    statsPieChart.destroy();
  }

  try {
    statsPieChart = new Chart(ctx, {
      type: 'pie',
      data: pieChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '24-Hour Daily Breakdown',
            color: 'white',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: 'white',
              font: {
                size: 12
              },
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 31, 77, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 107, 107, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                
                // Convert minutes to hours and minutes for display
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                
                return `${label}: ${timeDisplay} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
    
    console.log('Pie chart initialized successfully:', statsPieChart);
  } catch (error) {
    console.error('Error initializing pie chart:', error);
  }
}

// Update chart with current completed tasks data
function updateChart() {
  if (!taskChart) {
    console.log('Chart not initialized yet, skipping update');
    return;
  }

  // Get completed tasks from localStorage
  const completedTasks = getCompletedTasks();
  console.log('Updating chart with completed tasks:', completedTasks);
  
  // Prepare data for chart
  const labels = [];
  const durations = [];
  
  completedTasks.forEach(task => {
    // Truncate long task names for better display
    const displayName = task.text.length > 20 ? 
      task.text.substring(0, 17) + '...' : 
      task.text;
    
    labels.push(displayName);
    durations.push(task.duration || 0);
  });

  console.log('Chart data - Labels:', labels, 'Durations:', durations);

  // Update chart data
  chartData.labels = labels;
  chartData.datasets[0].data = durations;

  // Update the chart
  try {
    taskChart.update('active');
    console.log('Chart updated successfully');
  } catch (error) {
    console.error('Error updating chart:', error);
  }
}

// Update pie chart with current statistics
function updatePieChart() {
  if (!statsPieChart) {
    console.log('Pie chart not initialized yet, skipping update');
    return;
  }

  const completedTasks = getCompletedTasks();
  
  // Calculate today's focused minutes
  const today = new Date().toDateString();
  const todayTasks = completedTasks.filter(task => {
    const taskDate = new Date(task.created || Date.now()).toDateString();
    return taskDate === today;
  });
  
  const focusedMinutes = todayTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
  const sleepMinutes = 360; // 6 hours of sleep
  const otherMinutes = Math.max(1440 - focusedMinutes - sleepMinutes, 0); // 24 hours = 1440 minutes
  
  console.log('24-hour pie chart data - Focused:', focusedMinutes, 'Sleep:', sleepMinutes, 'Other:', otherMinutes);

  // Update pie chart data (all values in minutes for 24-hour breakdown)
  pieChartData.datasets[0].data = [focusedMinutes, sleepMinutes, otherMinutes];

  // Update the chart
  try {
    statsPieChart.update('active');
    console.log('Pie chart updated successfully');
  } catch (error) {
    console.error('Error updating pie chart:', error);
  }
}

// Get completed tasks from localStorage
function getCompletedTasks() {
  try {
    const raw = localStorage.getItem('task.checklist.v1');
    const allTasks = raw ? JSON.parse(raw) : [];
    
    // Also get from completedTasks storage
    const completedRaw = localStorage.getItem('completedTasks');
    const storedCompleted = completedRaw ? JSON.parse(completedRaw) : [];
    
    // Combine completed tasks from both sources
    const currentCompleted = allTasks.filter(task => task.done);
    const allCompleted = [...currentCompleted, ...storedCompleted];
    
    // Remove duplicates based on task text and duration
    const uniqueCompleted = allCompleted.filter((task, index, self) => 
      index === self.findIndex(t => t.text === task.text && t.duration === task.duration)
    );
    
    return uniqueCompleted;
  } catch (e) {
    console.error('Error loading completed tasks:', e);
    return [];
  }
}

// Setup listener for task changes
function setupTaskChangeListener() {
  // Listen for storage changes (when tasks are updated in other tabs)
  window.addEventListener('storage', function(e) {
    if (e.key === 'task.checklist.v1' || e.key === 'completedTasks') {
      updateChart();
      updatePieChart();
      updateStats();
    }
  });

  // Poll for changes every 2 seconds (for same-tab updates)
  setInterval(() => {
    updateChart();
    updatePieChart();
    updateStats();
  }, 2000);
}

// Update statistics display
function updateStats() {
  const completedTasks = getCompletedTasks();
  const totalTasks = completedTasks.length;
  const totalMinutes = completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
  
  // Update DOM elements
  const totalTasksEl = document.getElementById('totalTasks');
  const totalMinutesEl = document.getElementById('totalMinutes');
  const bestStreakEl = document.getElementById('bestStreak');
  
  if (totalTasksEl) totalTasksEl.textContent = totalTasks;
  if (totalMinutesEl) totalMinutesEl.textContent = totalMinutes;
  
  // Calculate best streak (simplified - could be enhanced)
  const bestStreak = Math.max(...completedTasks.map(task => task.duration || 0), 0);
  if (bestStreakEl) bestStreakEl.textContent = Math.round(bestStreak / 60 * 10) / 10; // Convert to hours
  
  // Update progress bar based on today's focused minutes
  updateProgressBar();
}

// Goal setting functionality
function setGoal() {
  const goalInput = document.getElementById('dailyGoal');
  const goal = parseInt(goalInput.value);
  
  if (goal && goal > 0) {
    localStorage.setItem('dailyGoal', goal);
    updateProgressBar();
    goalInput.value = '';
    
    // Show success message
    showMessage('Goal set successfully!', 'success');
  } else {
    showMessage('Please enter a valid goal (positive number)', 'error');
  }
}

// Update progress bar based on total focused minutes vs total minutes in day
function updateProgressBar() {
  const completedTasks = getCompletedTasks();
  
  // Calculate today's completed minutes (total focused minutes)
  const today = new Date().toDateString();
  const todayTasks = completedTasks.filter(task => {
    const taskDate = new Date(task.created || Date.now()).toDateString();
    return taskDate === today;
  });
  
  const totalFocusedMinutes = todayTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
  
  // Total minutes in a day = 16 * 60 = 960 minutes
  const totalMinutesInDay = 960;
  
  // Calculate progress percentage: (Total Focused Minutes / Total Minutes in Day) * 100
  const progress = Math.min((totalFocusedMinutes / totalMinutesInDay) * 100, 100);
  
  console.log(`Progress calculation: ${totalFocusedMinutes} focused minutes / ${totalMinutesInDay} total minutes = ${progress.toFixed(2)}%`);
  
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.value = progress;
    console.log(`Progress bar updated to: ${progress.toFixed(2)}%`);
  }
}

// Notes functionality
function saveNotes() {
  const notesInput = document.getElementById('quickNotes');
  const notes = notesInput.value.trim();
  
  if (notes) {
    localStorage.setItem('quickNotes', notes);
    showMessage('Notes saved successfully!', 'success');
  } else {
    showMessage('Please enter some notes', 'error');
  }
}

// Load saved notes
function loadNotes() {
  const notes = localStorage.getItem('quickNotes') || '';
  const notesInput = document.getElementById('quickNotes');
  if (notesInput) {
    notesInput.value = notes;
  }
}

// Show message to user
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                 type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                 'rgba(59, 130, 246, 0.9)'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(messageEl);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Load notes on page load
document.addEventListener('DOMContentLoaded', loadNotes);

// Export functions for global access
window.setGoal = setGoal;
window.saveNotes = saveNotes;
window.initializeTracker = function() {
  console.log('Manual initialization called');
  initializeChart();
  initializePieChart();
  updateStats();
  updateChart();
  updatePieChart();
  setupTaskChangeListener();
};

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded');
} else {
  console.log('DOM already loaded, initializing immediately');
  setTimeout(() => {
    initializeChart();
    initializePieChart();
    updateStats();
    updateChart();
    updatePieChart();
    setupTaskChangeListener();
  }, 100);
}
