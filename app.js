  // Application State and Data
const appData = {
  currentUser: { id: 1, name: "Alex Chen", role: "Senior Developer", email: "alex@company.com" },
  users: [
    {"id": 1, "name": "Alex Chen", "role": "Senior Developer", "email": "alex@company.com", "status": "active"},
    {"id": 2, "name": "Sarah Johnson", "role": "Tech Lead", "email": "sarah@company.com", "status": "active"},
    {"id": 3, "name": "Mike Rodriguez", "role": "Junior Developer", "email": "mike@company.com", "status": "active"},
    {"id": 4, "name": "Emily Davis", "role": "Full Stack Developer", "email": "emily@company.com", "status": "active"},
    {"id": 5, "name": "David Kim", "role": "DevOps Engineer", "email": "david@company.com", "status": "active"}
  ],
  availability_data: [
    {"user_id": 1, "week": "2025-01-20", "days": ["Mon", "Tue", "Wed", "Thu"], "hours": "9:00-17:00", "submitted": true, "submitted_date": "2025-01-19"},
    {"user_id": 1, "week": "2025-01-13", "days": ["Mon", "Tue", "Wed", "Thu"], "hours": "10:00-18:00", "submitted": true, "submitted_date": "2025-01-12"},
    {"user_id": 2, "week": "2025-01-20", "days": ["Mon", "Tue", "Wed", "Thu"], "hours": "8:30-16:30", "submitted": true, "submitted_date": "2025-01-18"},
    {"user_id": 3, "week": "2025-01-20", "days": ["Tue", "Wed", "Thu", "Fri"], "hours": "9:30-17:30", "submitted": false}
  ],
  attendance_data: [
    // No default attendance records
  ],
  performance_metrics: [
    {"user_id": 1, "month": "January 2025", "attendance_rate": 92, "availability_compliance": 100, "performance_score": 88, "feedback": "Excellent consistency in availability submissions. Consider adjusting morning start times to match your actual login patterns for better work-life balance."},
    {"user_id": 2, "month": "January 2025", "attendance_rate": 98, "availability_compliance": 100, "performance_score": 95, "feedback": "Outstanding performance across all metrics. Your early start time aligns perfectly with your availability windows."},
    {"user_id": 3, "month": "January 2025", "attendance_rate": 85, "availability_compliance": 60, "performance_score": 72, "feedback": "Improvement needed in availability submission consistency. Late submissions detected in 40% of weeks. Consider setting up calendar reminders."}
  ],
  currentlyWorking: false,
  todayCheckIn: ""
};

// Chart colors
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Helper: API base URL
const API_BASE = 'http://localhost:3000/api';

function getCurrentWeekAttendanceRate() {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
  const weekAttendance = appData.attendance_data.filter(a => {
    const date = new Date(a.date);
    return a.user_id === appData.currentUser.id && a.logout_time && date >= weekStart && date < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  });
  const uniqueDays = new Set(weekAttendance.map(a => a.date));
  const daysPresent = uniqueDays.size;
  const attendanceRate = Math.round((daysPresent / 5) * 100);
  return attendanceRate;
}

function updateDashboardCards() {
  // This Week's Availability
  const availabilityCardValue = document.querySelector('.overview-cards .overview-card:nth-child(1) .overview-card__value .value');
  const availabilityCardSubtitle = document.querySelector('.overview-cards .overview-card:nth-child(1) .overview-card__value .subtitle');
  if (availabilityCardValue && availabilityCardSubtitle) {
    // Check if current week availability is submitted
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
    const weekString = weekStart.toISOString().split('T')[0];
    const availability = appData.availability_data.find(a => a.user_id === appData.currentUser.id && a.week === weekString);
    if (availability && availability.submitted) {
      availabilityCardValue.textContent = 'Submitted';
      availabilityCardSubtitle.textContent = 'Due: Friday 6PM';
    } else {
      availabilityCardValue.textContent = 'Not Submitted';
      availabilityCardSubtitle.textContent = 'Due: Friday 6PM';
    }
  }

  // Attendance Rate
  const attendanceCardValue = document.querySelector('.overview-cards .overview-card:nth-child(2) .overview-card__value .value');
  if (attendanceCardValue) {
    const attendanceRate = getCurrentWeekAttendanceRate();
    attendanceCardValue.textContent = `${attendanceRate}%`;
  }

  // Performance Score
  const performanceCardValue = document.querySelector('.overview-cards .overview-card:nth-child(3) .overview-card__value .value');
  if (performanceCardValue) {
    const userMetric = appData.performance_metrics.find(m => m.user_id === appData.currentUser.id);
    performanceCardValue.textContent = userMetric ? `${userMetric.performance_score}` : '0';
  }

  // Pending Tasks
  const pendingTasksCardValue = document.querySelector('.overview-cards .overview-card:nth-child(4) .overview-card__value .value');
  if (pendingTasksCardValue) {
    // For demo, count availability submissions not done as pending tasks
    const pendingCount = appData.availability_data.filter(a => a.user_id === appData.currentUser.id && !a.submitted).length;
    pendingTasksCardValue.textContent = pendingCount > 0 ? pendingCount : '0';
  }
}

function updateRecentActivity() {
  const activityFeed = document.querySelector('.activity-feed');
  if (!activityFeed) return;

  activityFeed.innerHTML = '';

  // Find latest availability submission
  const latestAvailability = appData.availability_data
    .filter(a => a.user_id === appData.currentUser.id && a.submitted)
    .sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date))[0];
  const availabilityActivity = latestAvailability ? {
    time: latestAvailability.submitted_date,
    type: 'availability',
    text: `Submitted availability for week of ${new Date(latestAvailability.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } : null;

  // Find latest check-in
  const latestCheckIn = appData.attendance_data
    .filter(a => a.user_id === appData.currentUser.id && a.login_time)
    .sort((a, b) => new Date(b.date + 'T' + b.login_time) - new Date(a.date + 'T' + a.login_time))[0];
  const checkInActivity = latestCheckIn ? {
    time: latestCheckIn.date + 'T' + latestCheckIn.login_time,
    type: 'checkin',
    text: `Checked in at ${latestCheckIn.login_time} (${new Date(latestCheckIn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
  } : null;

  // Find latest check-out
  const latestCheckOut = appData.attendance_data
    .filter(a => a.user_id === appData.currentUser.id && a.logout_time)
    .sort((a, b) => new Date(b.date + 'T' + b.logout_time) - new Date(a.date + 'T' + a.logout_time))[0];
  const checkOutActivity = latestCheckOut ? {
    time: latestCheckOut.date + 'T' + latestCheckOut.logout_time,
    type: 'checkout',
    text: `Checked out at ${latestCheckOut.logout_time} (${new Date(latestCheckOut.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
  } : null;

  // Collect up to 3 activities, prioritizing one of each type
  const activities = [checkInActivity, checkOutActivity, availabilityActivity].filter(Boolean);
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const activityTime = document.createElement('span');
    activityTime.className = 'activity-time';
    const dateObj = new Date(activity.time);
    activityTime.textContent = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const activityText = document.createElement('span');
    activityText.className = 'activity-text';
    activityText.textContent = activity.text;

    activityItem.appendChild(activityTime);
    activityItem.appendChild(activityText);

    activityFeed.appendChild(activityItem);
  });

  // Add view all button if more than 3 activities exist in total
  const allActivities = [];
  // Add all availability submissions
  allActivities.push(...appData.availability_data
    .filter(a => a.user_id === appData.currentUser.id && a.submitted)
    .map(a => ({
      time: a.submitted_date,
      type: 'availability',
      text: `Submitted availability for week of ${new Date(a.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    })));
  // Add all check-ins
  allActivities.push(...appData.attendance_data
    .filter(a => a.user_id === appData.currentUser.id && a.login_time)
    .map(a => ({
      time: a.date + 'T' + a.login_time,
      type: 'checkin',
      text: `Checked in at ${a.login_time} (${new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    })));
  // Add all check-outs
  allActivities.push(...appData.attendance_data
    .filter(a => a.user_id === appData.currentUser.id && a.logout_time)
    .map(a => ({
      time: a.date + 'T' + a.logout_time,
      type: 'checkout',
      text: `Checked out at ${a.logout_time} (${new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    })));
  allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

  if (allActivities.length > 3) {
    const viewAllBtn = document.createElement('button');
    viewAllBtn.textContent = 'View All';
    viewAllBtn.className = 'btn btn--primary';
    viewAllBtn.style.marginTop = '10px';
    viewAllBtn.onclick = function() {
      showAllRecentActivities(allActivities);
    };
    activityFeed.appendChild(viewAllBtn);
  }
}

function showAllRecentActivities(allActivities) {
  const activityFeed = document.querySelector('.activity-feed');
  if (!activityFeed) return;

  activityFeed.innerHTML = '';

  allActivities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const activityTime = document.createElement('span');
    activityTime.className = 'activity-time';
    const dateObj = new Date(activity.time);
    activityTime.textContent = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const activityText = document.createElement('span');
    activityText.className = 'activity-text';
    activityText.textContent = activity.text;

    activityItem.appendChild(activityTime);
    activityItem.appendChild(activityText);

    activityFeed.appendChild(activityItem);
  });

  // Add back button
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Back';
  backBtn.className = 'btn btn--outline';
  backBtn.style.marginTop = '10px';
  backBtn.onclick = function() {
    updateRecentActivity();
  };
  activityFeed.appendChild(backBtn);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeNavigation();
  initializeInteractiveElements();
  loadStoredData();
  updateAttendanceDisplay();
  updateDashboardCards();
  updateRecentActivity();
  
  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    initializeCharts(); // This loads all charts including attendanceChart
  }, 100);
});

// Add event listener to show performance page content when performance menu is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetPage = link.getAttribute('data-page');
    if (targetPage === 'performance') {
      // Call functions to update performance page content
      showVariance();
      generatePerformanceFeedback();
    }
  });
});

// Navigation System
function initializeNavigation() {
  console.log('Initializing navigation...');
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');

  console.log(`Found ${navLinks.length} nav links and ${pages.length} pages`);

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-page');
      console.log(`Navigating to: ${targetPage}`);
      
      // Update active nav link
      navLinks.forEach(nav => nav.classList.remove('nav-link--active'));
      link.classList.add('nav-link--active');
      
      // Show target page
      pages.forEach(page => page.classList.remove('page--active'));
      const targetPageElement = document.getElementById(`${targetPage}-page`);
      if (targetPageElement) {
        targetPageElement.classList.add('page--active');
        
        // Update page title
        const pageTitles = {
          'dashboard': 'Dashboard',
          'availability': 'Availability Management',
          'attendance': 'Attendance Tracking', 
          'performance': 'Performance Analysis',
          'team': 'Team Overview',
          'settings': 'Settings'
        };
        pageTitle.textContent = pageTitles[targetPage] || 'Dashboard';
        
        showToast('info', 'Navigation', `Switched to ${pageTitles[targetPage]}`);
      }
    });
  });
}

// Chart Initialization
// Chart Initialization
function initializeCharts() {
  console.log('Initializing charts...');
  createAttendanceChart();
  createComplianceChart();
  createVarianceChart();
}

let attendanceChartInstance = null;

function computeWeeklyAttendanceRates() {
  // Compute attendance rate for last 4 weeks based on attendance_data
  const rates = [];
  const labels = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - i * 7 + 1);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(weekLabel);
    const weekAttendance = appData.attendance_data.filter(a => {
      const date = new Date(a.date);
      return date >= weekStart && date <= weekEnd && a.logout_time;
    });
    // Calculate attendance rate as days present / 5 (assuming 5 workdays)
    const uniqueDays = new Set(weekAttendance.map(a => a.date));
    const daysPresent = uniqueDays.size;
    const rate = Math.round((daysPresent / 5) * 100);
    rates.push(rate);
  }
  return { labels, rates };
}

function createAttendanceChart() {
  const ctx = document.getElementById('attendanceChart');
  if (!ctx) {
    console.log('Attendance chart canvas not found');
    return;
  }

  const { labels, rates } = computeWeeklyAttendanceRates();

  if (attendanceChartInstance) {
    attendanceChartInstance.data.labels = labels;
    attendanceChartInstance.data.datasets[0].data = rates;
    attendanceChartInstance.update();
  } else {
    attendanceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Attendance Rate',
          data: rates,
          borderColor: chartColors[0],
          backgroundColor: chartColors[0] + '20',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }
}

let complianceChartInstance = null;
function createComplianceChart() {
  const ctx = document.getElementById('complianceChart');
  if (!ctx) {
    console.log('Compliance chart canvas not found');
    return;
  }

  // Destroy existing chart instance if exists
  if (complianceChartInstance) {
    complianceChartInstance.destroy();
  }

  // Calculate availability compliance from availability_data
  const userAvailability = appData.availability_data.filter(a => a.user_id === appData.currentUser.id);
  const total = userAvailability.length;
  const onTime = userAvailability.filter(a => a.submitted).length;
  const late = total > onTime ? Math.min(10, total - onTime) : 0;
  const missing = total > onTime + late ? total - onTime - late : 0;

  const compliancePercent = total > 0 ? Math.round((onTime / total) * 100) : 0;

  complianceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['On Time', 'Late', 'Missing'],
      datasets: [{
        data: [compliancePercent, late, missing],
        backgroundColor: [chartColors[0], chartColors[1], chartColors[2]],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function createVarianceChart() {
  const ctx = document.getElementById('varianceChart');
  if (!ctx) {
    console.log('Variance chart canvas not found');
    return;
  }

  // Days of week labels
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Get current week start date (Monday)
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000); // Friday

  // Set expected hours to 8 per day
  const expectedHours = [8, 8, 8, 8, 8];

  // Calculate actual hours per day from attendance_data
  const actualHours = [0, 0, 0, 0, 0]; // Mon-Fri
  appData.attendance_data.forEach(record => {
    if (record.user_id === appData.currentUser.id && record.login_time && record.logout_time) {
      const recordDate = new Date(record.date);
      if (recordDate >= weekStart && recordDate < weekEnd) {
        const dayIndex = recordDate.getDay() - 1; // Monday=0
        if (dayIndex >= 0 && dayIndex < 5) {
          const [startH, startM] = record.login_time.split(':').map(Number);
          const [endH, endM] = record.logout_time.split(':').map(Number);
          let diff = (endH * 60 + endM) - (startH * 60 + startM);
          if (diff < 0) diff = 0;
          actualHours[dayIndex] += diff / 60;
        }
      }
    }
  });

  // Destroy previous chart instance if exists
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }

  ctx.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Expected Hours',
          data: expectedHours,
          backgroundColor: chartColors[0] + '80',
          borderColor: chartColors[0],
          borderWidth: 1
        },
        {
          label: 'Actual Hours',
          data: actualHours,
          backgroundColor: chartColors[1] + '80',
          borderColor: chartColors[1],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 12,
          ticks: {
            callback: function(value) {
              return value + 'h';
            }
          }
        }
      }
    }
  });
}

// Interactive Elements
function initializeSettings() {
  const saveSettingsBtn = document.querySelector('#settings-page .btn.btn--primary');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveSettings();
    });
  }
}

function saveSettings() {
  // Read values from settings form inputs
  const fullNameInput = document.querySelector('#settings-page input[title="Full Name"]');
  const emailInput = document.querySelector('#settings-page input[title="Email"]');
  const roleSelect = document.querySelector('#settings-page select[title="Role"]');
  const defaultWorkingDaysCheckboxes = document.querySelectorAll('#settings-page .day-selector input[type="checkbox"]');
  const defaultStartTimeInput = document.querySelector('#settings-page .time-inputs input[title="Start Time"]');
  const defaultEndTimeInput = document.querySelector('#settings-page .time-inputs input[title="End Time"]');
  const emailNotificationsCheckbox = document.querySelector('#settings-page input[type="checkbox"]:nth-of-type(1)');
  const performanceNotificationsCheckbox = document.querySelector('#settings-page input[type="checkbox"]:nth-of-type(2)');
  const attendanceRemindersCheckbox = document.querySelector('#settings-page input[type="checkbox"]:nth-of-type(3)');

  // Update appData currentUser info
  if (fullNameInput) appData.currentUser.name = fullNameInput.value;
  if (emailInput) appData.currentUser.email = emailInput.value;
  if (roleSelect) appData.currentUser.role = roleSelect.value;

  // Update appData settings (add a settings object if not exists)
  if (!appData.settings) appData.settings = {};
  appData.settings.defaultWorkingDays = [];
  defaultWorkingDaysCheckboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const dayLabel = checkbox.parentElement.textContent.trim();
      appData.settings.defaultWorkingDays.push(dayLabel);
    }
  });
  if (defaultStartTimeInput) appData.settings.defaultStartTime = defaultStartTimeInput.value;
  if (defaultEndTimeInput) appData.settings.defaultEndTime = defaultEndTimeInput.value;
  if (emailNotificationsCheckbox) appData.settings.emailNotifications = emailNotificationsCheckbox.checked;
  if (performanceNotificationsCheckbox) appData.settings.performanceNotifications = performanceNotificationsCheckbox.checked;
  if (attendanceRemindersCheckbox) appData.settings.attendanceReminders = attendanceRemindersCheckbox.checked;

  // Persist settings - for now, log to console (replace with API or localStorage as needed)
  console.log('Settings saved:', appData.settings);

  // Show success toast
  showToast('success', 'Settings Saved', 'Your settings have been saved successfully.');

  // Update UI or other components as needed to reflect new settings
  // For example, update user profile display
  const userNameDisplay = document.querySelector('.user-profile__name');
  const userRoleDisplay = document.querySelector('.user-profile__role');
  if (userNameDisplay) userNameDisplay.textContent = appData.currentUser.name;
  if (userRoleDisplay) userRoleDisplay.textContent = appData.currentUser.role;
}

// Initialize Interactive Elements
function initializeInteractiveElements() {
  console.log('Initializing interactive elements...');
  initializeCheckInOut();
  initializeAvailabilitySubmission();
  // initializeAlerts(); // Removed because function is not defined
  initializeSettings();
  initializeNotifications();
}

function initializeCheckInOut() {
  const checkInBtn = document.getElementById('check-in-btn');
  const checkOutBtn = document.getElementById('check-out-btn');

  console.log('Check-in button:', checkInBtn);
  console.log('Check-out button:', checkOutBtn);

  if (checkInBtn) {
    checkInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Check-in clicked');
      if (!appData.currentlyWorking) {
        const now = new Date();
        appData.todayCheckIn = now.toTimeString().substring(0, 5);
        appData.currentlyWorking = true;
        
        showToast('success', 'Checked In', `Successfully checked in at ${appData.todayCheckIn}`);
        updateAttendanceDisplay();
        updateRecentActivity();
        
        // Save check-in to backend
        const today = now.toISOString().split('T')[0];
        saveAttendanceToBackend({
          date: today,
          login_time: appData.todayCheckIn,
          logout_time: '',
          status: 'present'
        });
        setTimeout(() => loadStoredData(), 500); // reload from backend after save
      } else {
        showToast('warning', 'Already Checked In', 'You are already checked in for today');
      }
    });
  }

  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Check-out clicked');
      if (appData.currentlyWorking) {
        const now = new Date();
        const checkOutTime = now.toTimeString().substring(0, 5);
        appData.currentlyWorking = false;
        
        showToast('success', 'Checked Out', `Successfully checked out at ${checkOutTime}`);
        updateAttendanceDisplay();
        updateRecentActivity();
        
        // Save check-out to backend
        const today = now.toISOString().split('T')[0];
        saveAttendanceToBackend({
          date: today,
          login_time: appData.todayCheckIn,
          logout_time: checkOutTime,
          status: 'present'
        });
        setTimeout(() => loadStoredData(), 500); // reload from backend after save
        
        // Calculate hours worked
        const hoursWorked = calculateHoursWorked(appData.todayCheckIn, checkOutTime);
        setTimeout(() => {
          showToast('info', 'Hours Summary', `Total hours worked today: ${hoursWorked}`);
        }, 1000);
      } else {
        showToast('warning', 'Not Checked In', 'You need to check in first');
      }
    });
  }
}

function calculateHoursWorked(checkIn, checkOut) {
  const [checkInHours, checkInMinutes] = checkIn.split(':').map(Number);
  const [checkOutHours, checkOutMinutes] = checkOut.split(':').map(Number);
  const checkInTime = checkInHours * 60 + checkInMinutes;
  const checkOutTime = checkOutHours * 60 + checkOutMinutes;
  let totalMinutes = checkOutTime - checkInTime;
  if (totalMinutes < 0) totalMinutes = Math.abs(totalMinutes); // Always positive
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function updateAttendanceDisplay() {
  console.log('Updating attendance display');
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');
  
  if (statusIndicator && statusText) {
    if (appData.currentlyWorking) {
      statusIndicator.classList.add('status-indicator--active');
      statusText.textContent = 'Currently Working';
    } else {
      statusIndicator.classList.remove('status-indicator--active');
      statusText.textContent = 'Off Duty';
    }
  }
  // Update today's attendance check-in time
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = appData.attendance_data.find(a => a.user_id === appData.currentUser.id && a.date === today);
  const checkInTimeEl = document.querySelector('.attendance-times .time-entry .time');
  if (checkInTimeEl) {
    if (todayAttendance && todayAttendance.login_time) {
      checkInTimeEl.textContent = todayAttendance.login_time;
    } else {
      checkInTimeEl.textContent = '-';
    }
  }
  // Update today's attendance hours worked (sum all records for today)
  const todayRecords = appData.attendance_data.filter(a => a.user_id === appData.currentUser.id && a.date === today && a.login_time && a.logout_time);
  let totalMinutes = 0;
  todayRecords.forEach(a => {
    const [inH, inM] = a.login_time.split(':').map(Number);
    const [outH, outM] = a.logout_time.split(':').map(Number);
    let minutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (minutes < 0) minutes = Math.abs(minutes);
    totalMinutes += minutes;
  });
  const hoursTodayEl = document.querySelectorAll('.attendance-times .time-entry .time')[1];
  if (hoursTodayEl) {
    if (totalMinutes > 0) {
      hoursTodayEl.textContent = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    } else {
      hoursTodayEl.textContent = '-';
    }
  }
}

function initializeAvailabilitySubmission() {
  const submitBtn = document.getElementById('submit-availability');
  const bulkBtn = document.getElementById('bulk-availability');

  console.log('Availability submit button:', submitBtn);

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Availability submission clicked');
      
      const selectedDays = getSelectedDays();
      const timeRange = getSelectedTimeRange();
      
      console.log('Selected days:', selectedDays);
      console.log('Time range:', timeRange);
      
      if (selectedDays.length === 0) {
        showToast('error', 'No Days Selected', 'Please select at least one working day');
        return;
      }
      
      // Simulate availability submission
      const currentWeek = getCurrentWeekString();

      // Check if availability already submitted for this week
      const alreadySubmitted = appData.availability_data.some(item => item.user_id === appData.currentUser.id && item.week === currentWeek && item.submitted);
      if (alreadySubmitted) {
        showToast('warning', 'Already Submitted', 'You have already submitted availability for this week.');
        return;
      }

      const submission = {
        user_id: appData.currentUser.id,
        week: currentWeek,
        days: selectedDays,
        hours: timeRange,
        submitted: true,
        submitted_date: new Date().toISOString().split('T')[0]
      };
      
      // Add to data
      appData.availability_data.push(submission);
      saveAvailabilityToBackend(submission);
      showToast('success', 'Availability Submitted', 'Your weekly availability has been recorded');
      
      // Update availability history immediately
      updateAvailabilityHistory();
      updateRecentActivity();
      
      // Update next deadline and dates
      const deadlineEl = document.querySelector('.submission-deadline .status');
      const deadlineInfoEl = document.querySelector('.submission-deadline .deadline-info');
      if (deadlineEl) {
        const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        deadlineEl.textContent = `Submitted on ${todayDate}`;
        deadlineEl.setAttribute('data-submitted-date', todayDate);
        deadlineEl.classList.remove('status--error');
        deadlineEl.classList.add('status--success');
      }
      if (deadlineInfoEl) {
        const nextMonday = new Date();
        const day = nextMonday.getDay();
        const diff = (day === 0 ? 1 : 8) - day; // days until next Monday
        nextMonday.setDate(nextMonday.getDate() + diff);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        deadlineInfoEl.textContent = `Next deadline: ${nextMonday.toLocaleDateString('en-US', options)}`;
      }
      
      // Update the Weekly Schedule header date to current week start date
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const formattedWeekStart = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const scheduleHeader = document.querySelector('.schedule-form h3');
      if (scheduleHeader) {
        scheduleHeader.textContent = `Weekly Schedule - Week of ${formattedWeekStart}`;
      }
    });
  }

  if (bulkBtn) {
    bulkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Show bulk availability page and hide main availability page
      const bulkPage = document.getElementById('bulk-availability-page');
      const availabilityPage = document.getElementById('availability-page');
      if (bulkPage && availabilityPage) {
        bulkPage.style.display = 'block';
        availabilityPage.style.display = 'none';
      }
    });
  }

  const backToAvailabilityBtn = document.getElementById('back-to-availability-main');
  if (backToAvailabilityBtn) {
    backToAvailabilityBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Hide bulk availability page and show main availability page
      const bulkPage = document.getElementById('bulk-availability-page');
      const availabilityPage = document.getElementById('availability-page');
      if (bulkPage && availabilityPage) {
        bulkPage.style.display = 'none';
        availabilityPage.style.display = 'block';
      }
    });
  }

  const submitBulkBtn = document.getElementById('submit-bulk-availability');
  if (submitBulkBtn) {
    submitBulkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const bulkPage = document.getElementById('bulk-availability-page');
      if (!bulkPage) {
        showToast('error', 'Error', 'Bulk availability page not found');
        return;
      }
      // Collect inputs
      const monthSelect = document.getElementById('month-select');
      const weekSelect = document.getElementById('week-select');
      const dayCheckboxes = bulkPage.querySelectorAll('.day-option input[type="checkbox"]:checked');
      const startTimeInput = document.getElementById('bulk-start-time');
      const endTimeInput = document.getElementById('bulk-end-time');

      if (!monthSelect || !weekSelect || !startTimeInput || !endTimeInput) {
        showToast('error', 'Error', 'Bulk availability inputs missing');
        return;
      }

      if (dayCheckboxes.length === 0) {
        showToast('error', 'No Days Selected', 'Please select at least one working day');
        return;
      }

      const selectedMonth = parseInt(monthSelect.value);
      const selectedWeek = parseInt(weekSelect.value);
      const selectedDays = Array.from(dayCheckboxes).map(cb => cb.parentElement.textContent.trim());
      const timeRange = `${startTimeInput.value}-${endTimeInput.value}`;

      // Calculate the start date of the selected week in the selected month
      const year = new Date().getFullYear();
      const firstDayOfMonth = new Date(year, selectedMonth, 1);
      const firstMonday = new Date(firstDayOfMonth);
      const dayOfWeek = firstMonday.getDay();
      const offset = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
      firstMonday.setDate(firstMonday.getDate() + offset - 1);
      const weekStartDate = new Date(firstMonday);
      weekStartDate.setDate(firstMonday.getDate() + (selectedWeek - 1) * 7);

      // Prepare submissions for the selected week
      const submission = {
        user_id: appData.currentUser.id,
        week: weekStartDate.toISOString().split('T')[0],
        days: selectedDays,
        hours: timeRange,
        submitted: true,
        submitted_date: new Date().toISOString().split('T')[0]
      };

      // Check if already submitted for this week
      const alreadySubmitted = appData.availability_data.some(item => item.user_id === appData.currentUser.id && item.week === submission.week && item.submitted);
      if (alreadySubmitted) {
        showToast('warning', 'Already Submitted', `Availability already submitted for week starting ${submission.week}`);
        return;
      }

      // Add to data
      appData.availability_data.push(submission);
      saveAvailabilityToBackend(submission);
      showToast('success', 'Availability Submitted', `Availability submitted for week starting ${submission.week}`);

      // Update availability history and UI
      updateAvailabilityHistory();

      // Optionally, reset inputs or navigate back
      if (bulkPage && availabilityPage) {
        bulkPage.style.display = 'none';
        availabilityPage.style.display = 'block';
      }
    });
  }
}

function getSelectedDays() {
  const checkboxes = document.querySelectorAll('.day-option input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(checkbox => {
    return checkbox.parentElement.textContent.trim();
  });
}

function getSelectedTimeRange() {
  const timeInputs = document.querySelectorAll('.time-inputs input[type="time"]');
  if (timeInputs.length >= 2) {
    return `${timeInputs[0].value}-${timeInputs[1].value}`;
  }
  return '09:00-17:00';
}

function getCurrentWeekString() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  return startOfWeek.toISOString().split('T')[0];
}

let showAllAvailabilityHistory = false;

function updateAvailabilityHistory() {
  const historyTable = document.getElementById('availability-history');
  if (!historyTable) return;

  // Clear existing rows
  historyTable.innerHTML = '';
  
  // Get user's availability data
  const userAvailability = appData.availability_data
    .filter(item => item.user_id === appData.currentUser.id)
    .sort((a, b) => new Date(b.week) - new Date(a.week));

  let displayAvailability = userAvailability;
  if (!showAllAvailabilityHistory) {
    displayAvailability = userAvailability.slice(0, 5);
  }

  displayAvailability.forEach(item => {
    const row = document.createElement('tr');
    const weekDate = new Date(item.week);
    const formattedWeek = weekDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const submittedDate = item.submitted_date ? 
      new Date(item.submitted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      'Not submitted';

    // Remove duplicate days if any
    const uniqueDays = [...new Set(item.days)];

    row.innerHTML = `
      <td>${formattedWeek}</td>
      <td>${uniqueDays.join('-')}</td>
      <td>${item.hours}</td>
      <td>${submittedDate}</td>
    `;
    historyTable.appendChild(row);
  });

  if (!showAllAvailabilityHistory && userAvailability.length > 5) {
    const viewBtnRow = document.createElement('tr');
    const viewBtnCell = document.createElement('td');
    viewBtnCell.colSpan = 4;
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View History';
    viewBtn.className = 'btn btn--primary';
    viewBtn.onclick = function() {
      showAllAvailabilityHistory = true;
      showAvailabilityHistoryPage();
    };
    viewBtnCell.appendChild(viewBtn);
    viewBtnRow.appendChild(viewBtnCell);
    historyTable.appendChild(viewBtnRow);
  }
}

function showAvailabilityHistoryPage() {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('page--active'));
  let historyPage = document.getElementById('availability-history-page');
  if (!historyPage) {
    historyPage = document.createElement('div');
    historyPage.id = 'availability-history-page';
    historyPage.className = 'page page--active';
    historyPage.innerHTML = `
      <div class="card">
        <div class="card__body">
          <button class="btn btn--outline" id="back-to-availability" style="float:right; margin-bottom:10px;">Back</button>
          <h3>All Availability History</h3>
          <div class="history-table">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Days</th>
                  <th>Hours</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody id="all-availability-history"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    document.querySelector('.main-content').appendChild(historyPage);
    document.getElementById('back-to-availability').onclick = function() {
      historyPage.classList.remove('page--active');
      document.getElementById('availability-page').classList.add('page--active');
      showAllAvailabilityHistory = false;
      updateAvailabilityHistory();
    };
  } else {
    historyPage.classList.add('page--active');
  }
  // Fill all history
  const allTable = document.getElementById('all-availability-history');
  allTable.innerHTML = '';
  let userAvailability = appData.availability_data
    .filter(item => item.user_id === appData.currentUser.id)
    .sort((a, b) => new Date(b.week) - new Date(a.week));
  userAvailability.forEach((item, idx) => {
    const row = document.createElement('tr');
    const weekDate = new Date(item.week);
    const formattedWeek = weekDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const submittedDate = item.submitted_date ? 
      new Date(item.submitted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      'Not submitted';
    // Remove duplicate days if any
    const uniqueDays = [...new Set(item.days)];
    row.innerHTML = `
      <td>${formattedWeek}</td>
      <td>${uniqueDays.join('-')}</td>
      <td>${item.hours}</td>
      <td>${submittedDate}</td>
    `;
    allTable.appendChild(row);
  });
}

let showAllAttendance = false;

document.addEventListener('DOMContentLoaded', function() {
  showAllAttendance = false;
  loadStoredData();
});

function updateAttendanceHistory() {
  const historyTable = document.getElementById('attendance-history');
  if (!historyTable) return;
  historyTable.innerHTML = '';
  let userAttendance = appData.attendance_data
    .filter(item => item.user_id === appData.currentUser.id && item.logout_time)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  let displayAttendance = userAttendance.slice(0, 5);
  displayAttendance.forEach((item, idx) => {
    const row = document.createElement('tr');
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    let statusText = 'Checked Out';
    let statusClass = 'status--success';
    let hoursWorked = calculateHoursWorked(item.login_time, item.logout_time);
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${item.login_time || '-'}</td>
      <td>${item.logout_time || '-'}</td>
      <td>${hoursWorked || '-'}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
    `;
    historyTable.appendChild(row);
  });
  // Add view history button if not showing all and more than 5 exist
  if (userAttendance.length > 5) {
    const viewBtnRow = document.createElement('tr');
    const viewBtnCell = document.createElement('td');
    viewBtnCell.colSpan = 5;
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View History';
    viewBtn.className = 'btn btn--primary';
    viewBtn.onclick = function() {
      showAllAttendance = true;
      showAttendanceHistoryPage();
    };
    viewBtnCell.appendChild(viewBtn);
    viewBtnRow.appendChild(viewBtnCell);
    historyTable.appendChild(viewBtnRow);
  }
}

// Toast Notification System
function showToast(type, title, message) {
  console.log(`Showing toast: ${type} - ${title}: ${message}`);
  
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast__title">${title}</div>
    <div class="toast__message">${message}</div>
    <button class="toast__close" aria-label="Close">&times;</button>
  `;

  // Add close button event
  toast.querySelector('.toast__close').onclick = function() {
    toast.remove();
  };

  toastContainer.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Data Persistence
function saveDataToStorage() {
  try {
    const dataToSave = {
      availability_data: appData.availability_data,
      attendance_data: appData.attendance_data,
      performance_metrics: appData.performance_metrics,
      currentlyWorking: appData.currentlyWorking,
      todayCheckIn: appData.todayCheckIn
    };
    // Note: localStorage is not available in sandbox, but we'll keep the code for reference
    console.log('Data would be saved to storage:', dataToSave);
  } catch (error) {
    console.warn('Could not save data to storage:', error);
  }
}

// Replace loadStoredData to load from backend
function loadStoredData() {
  // Load settings
  fetch(`${API_BASE}/settings`)
    .then(res => res.json())
    .then(data => {
      if (data) {
        // Update UI fields if needed
        // Example: document.querySelector('input[name="fullName"]').value = data.name;
        appData.currentUser.name = data.name || appData.currentUser.name;
        appData.currentUser.email = data.email || appData.currentUser.email;
        appData.currentUser.role = data.role || appData.currentUser.role;
      }
    });
  // Load availability
  fetch(`${API_BASE}/availability`)
    .then(res => res.json())
    .then(rows => {
      appData.availability_data = rows.map(row => ({
        user_id: 1, // single user for demo
        week: row.week,
        days: row.days.split(','),
        hours: row.hours,
        submitted: row.status === 'On Time',
        submitted_date: row.submitted
      }));
      updateAvailabilityHistory();
      createComplianceChart(); // Ensure chart is created after availability data is loaded
      createVarianceChart(); // Also create variance chart here
    });
  // Load attendance
  fetch(`${API_BASE}/attendance`)
    .then(res => res.json())
    .then(rows => {
      appData.attendance_data = rows.map(row => ({
        id: row.id, // <-- ensure id is included for delete
        user_id: 1,
        date: row.date,
        login_time: row.check_in,
        logout_time: row.check_out,
        status: row.status
      }));
      updateAttendanceDisplay();
      updateAttendanceHistory();
      createVarianceChart(); // Also create variance chart here to update after attendance load
    });
}

// Replace saveDataToStorage with API calls for availability
function saveAvailabilityToBackend(submission) {
  fetch(`${API_BASE}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      week: submission.week,
      days: submission.days.join(','),
      hours: submission.hours,
      status: submission.submitted ? 'On Time' : 'Missing',
      submitted: submission.submitted_date
    })
  });
}

// Save attendance to backend
function saveAttendanceToBackend(entry) {
  fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: entry.date,
      check_in: entry.login_time,
      check_out: entry.logout_time,
      hours: entry.hours || '',
      status: entry.status
    })
  });
}

// Patch check-in/out logic to use backend and update everywhere
function initializeCheckInOut() {
  const checkInBtn = document.getElementById('check-in-btn');
  const checkOutBtn = document.getElementById('check-out-btn');
  if (checkInBtn) {
    checkInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!appData.currentlyWorking) {
        const now = new Date();
        appData.todayCheckIn = now.toTimeString().substring(0, 5);
        appData.currentlyWorking = true;
        showToast('success', 'Checked In', `Successfully checked in at ${appData.todayCheckIn}`);
        updateAttendanceDisplay();
        // Save check-in to backend
        const today = now.toISOString().split('T')[0];
        saveAttendanceToBackend({
          date: today,
          login_time: appData.todayCheckIn,
          logout_time: '',
          status: 'present'
        });
        setTimeout(() => loadStoredData(), 500); // reload from backend after save
      } else {
        showToast('warning', 'Already Checked In', 'You are already checked in for today');
      }
    });
  }
  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (appData.currentlyWorking) {
        const now = new Date();
        const checkOutTime = now.toTimeString().substring(0, 5);
        appData.currentlyWorking = false;
        showToast('success', 'Checked Out', `Successfully checked out at ${checkOutTime}`);
        updateAttendanceDisplay();
        // Save check-out to backend
        const today = now.toISOString().split('T')[0];
        saveAttendanceToBackend({
          date: today,
          login_time: appData.todayCheckIn,
          logout_time: checkOutTime,
          status: 'present'
        });
        setTimeout(() => loadStoredData(), 500); // reload from backend after save
        // Calculate hours worked
        const hoursWorked = calculateHoursWorked(appData.todayCheckIn, checkOutTime);
        setTimeout(() => {
          showToast('info', 'Hours Summary', `Total hours worked today: ${hoursWorked}`);
        }, 1000);
      } else {
        showToast('warning', 'Not Checked In', 'You need to check in first');
      }
    });
  }
}

function updateNotificationCount() {
  const notificationBadge = document.getElementById('notification-count');
  if (!notificationBadge) return;

  // Gather notifications based on user preferences
  const notifications = getFilteredNotifications();

  // Update badge count
  notificationBadge.textContent = notifications.length;

  // Update notification list in dropdown
  const notificationList = document.getElementById('notification-list');
  if (!notificationList) return;

  notificationList.innerHTML = '';

  if (notifications.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No notifications';
    emptyItem.style.padding = '10px';
    notificationList.appendChild(emptyItem);
    return;
  }

  notifications.forEach(notif => {
    const li = document.createElement('li');
    li.className = `notification-item notification-item--${notif.type}`;
    li.style.padding = '10px';
    li.style.borderBottom = '1px solid #eee';
    li.innerHTML = `
      <span class="alert-icon">${notif.icon}</span>
      <div class="alert-content">
        <div class="alert-title">${notif.title}</div>
        <div class="alert-text">${notif.text}</div>
      </div>
    `;
    notificationList.appendChild(li);
  });
}

function getFilteredNotifications() {
  const settings = appData.settings || {};
  const notifications = [];

  // Example: availability deadline notification
  if (settings.emailNotifications) {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
    const weekString = weekStart.toISOString().split('T')[0];
    const availability = appData.availability_data.find(a => a.user_id === appData.currentUser.id && a.week === weekString);
    const deadline = new Date(weekStart);
    deadline.setDate(deadline.getDate() + 4); // Friday
    deadline.setHours(18, 0, 0, 0);
    if (!availability || !availability.submitted) {
      if (now > deadline) {
        notifications.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Availability Overdue',
          text: 'You have not submitted your availability for this week. Deadline was Friday 6PM.'
        });
      } else {
        notifications.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Availability Deadline',
          text: 'Submit this week\'s availability by Friday 6PM.'
        });
      }
    } else {
      notifications.push({
        type: 'success',
        icon: '✅',
        title: 'Availability Submitted',
        text: 'Your availability for this week is submitted.'
      });
    }
  }

  // Performance feedback notification
  if (settings.performanceNotifications) {
    const userMetric = appData.performance_metrics.find(m => m.user_id === appData.currentUser.id);
    if (userMetric && userMetric.feedback) {
      notifications.push({
        type: 'info',
        icon: 'ℹ️',
        title: 'Performance Review',
        text: userMetric.feedback
      });
    }
  }

  // Attendance reminders notification
  if (settings.attendanceReminders) {
    const attendanceRate = getCurrentWeekAttendanceRate();
    if (attendanceRate < 80) {
      notifications.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Attendance Rate',
        text: `Your attendance rate this week is ${attendanceRate}%. Please improve your attendance.`
      });
    }
  }

  // Working hours reminder notification
  if (settings.attendanceReminders) {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = appData.attendance_data.filter(a => a.user_id === appData.currentUser.id && a.date === today && a.login_time && a.logout_time);
    let totalMinutes = 0;
    todayRecords.forEach(a => {
      const [inH, inM] = a.login_time.split(':').map(Number);
      const [outH, outM] = a.logout_time.split(':').map(Number);
      let minutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (minutes < 0) minutes = Math.abs(minutes);
      totalMinutes += minutes;
    });
    const hoursWorked = totalMinutes / 60;
    if (hoursWorked < 8) {
      notifications.push({
        type: 'warning',
        icon: '⏰',
        title: 'Work Hours Reminder',
        text: 'Your working hours today are less than 8 hours. Please check in to complete your work hours and tasks.'
      });
    }
  }

  return notifications;
}

// Toggle notification dropdown on bell click
document.addEventListener('DOMContentLoaded', () => {
  const bell = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  if (!bell || !dropdown) return;

  bell.addEventListener('click', () => {
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
      updateNotificationCount(); // Refresh notifications before showing
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
});

// Real-time clock for attendance
function updateCurrentTime() {
  const timeElements = document.querySelectorAll('.current-time');
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: 'numeric', 
    minute: '2-digit' 
  });
  
  timeElements.forEach(el => {
    el.textContent = timeString;
  });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateNotificationCount();
  updateCurrentTime();
  
  // Update time every minute
  setInterval(updateCurrentTime, 60000);
  
  // Show welcome message
  setTimeout(() => {
    showToast('info', 'Welcome!', 'Welcome to DevTeam HRM. Use the sidebar to navigate between features.');
  }, 1000);

  // Show work hours reminder toast if applicable
  const settings = appData.settings || {};
  if (settings.attendanceReminders) {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = appData.attendance_data.filter(a => a.user_id === appData.currentUser.id && a.date === today && a.login_time && a.logout_time);
    let totalMinutes = 0;
    todayRecords.forEach(a => {
      const [inH, inM] = a.login_time.split(':').map(Number);
      const [outH, outM] = a.logout_time.split(':').map(Number);
      let minutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (minutes < 0) minutes = Math.abs(minutes);
      totalMinutes += minutes;
    });
    const hoursWorked = totalMinutes / 60;
    if (hoursWorked < 8) {
      showToast('warning', 'Work Hours Reminder', 'Your working hours today are less than 8 hours. Please check in to complete your work hours and tasks.');
    }
  }
  
  loadStoredData();
});

// Check availability submission deadline
function checkAvailabilityDeadline() {
  // Check if this week's availability is submitted
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
  const weekString = weekStart.toISOString().split('T')[0];
  const found = appData.availability_data.some(a => a.week === weekString && a.submitted);
  // Deadline: Friday 6PM
  const deadline = new Date(weekStart);
  deadline.setDate(deadline.getDate() + 4); // Friday
  deadline.setHours(18, 0, 0, 0);
  if (!found && today > deadline) {
    showToast('error', 'Availability Overdue', 'You have not submitted your weekly availability!');
  }
}

document.addEventListener('DOMContentLoaded', checkAvailabilityDeadline);

// Variance calculation and display
function calculateVariance() {
  // Compare planned availability vs. actual attendance
  const planned = appData.availability_data.filter(a => a.user_id === appData.currentUser.id && a.submitted);
  const actual = appData.attendance_data.filter(a => a.user_id === appData.currentUser.id);
  let variance = [];
  planned.forEach(p => {
    actual.forEach(a => {
      if (a.date >= p.week) {
        variance.push({
          date: a.date,
          planned: p.hours,
          actual: (a.login_time && a.logout_time) ? `${a.login_time}-${a.logout_time}` : 'N/A'
        });
      }
    });
  });
  // Filter out entries with actual 'N/A' if you want to exclude them
  variance = variance.filter(v => v.actual !== 'N/A');
  return variance;
}

function showVariance() {
  const variance = calculateVariance();
  const varianceTable = document.getElementById('variance-table');
  if (!varianceTable) return;
  varianceTable.innerHTML = '';
  variance.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${v.date}</td><td>${v.planned}</td><td>${v.actual}</td>`;
    varianceTable.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', showVariance);

// Performance feedback generation
function generatePerformanceFeedback() {
  // Use real feedback from performance_metrics for current user
  const userMetric = appData.performance_metrics.find(m => m.user_id === appData.currentUser.id);
  const feedback = userMetric && userMetric.feedback ? userMetric.feedback : 'No performance feedback available.';
  document.getElementById('performance-feedback').textContent = feedback;
}

document.addEventListener('DOMContentLoaded', generatePerformanceFeedback);

// Add CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
  // Clear attendance history on reload
  fetch(`${API_BASE}/attendance/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      loadStoredData();
    });
});

// Update the weekly summary (total hours, days present, attendance rate) based on current week's attendance history.
function updateWeeklySummary() {
  // Get current week
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
  const weekString = weekStart.toISOString().split('T')[0];
  // Filter attendance for current week and checked out
  const weekAttendance = appData.attendance_data.filter(a => {
    const date = new Date(a.date);
    return a.logout_time && date >= weekStart && date < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  });
  // Calculate total hours
  let totalMinutes = 0;
  weekAttendance.forEach(a => {
    const [inH, inM] = a.login_time.split(':').map(Number);
    const [outH, outM] = a.logout_time.split(':').map(Number);
    let minutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (minutes < 0) minutes = Math.abs(minutes); // Always positive
    totalMinutes += minutes;
  });
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  // Days present: count unique dates in weekAttendance
  const uniqueDays = new Set(weekAttendance.map(a => a.date));
  const daysPresent = uniqueDays.size;
  // Attendance rate (out of 4 days)
  const attendanceRate = Math.round((daysPresent / 4) * 100);
  // Update UI
  const totalHoursEl = document.querySelector('.weekly-summary .summary-value');
  if (totalHoursEl) totalHoursEl.textContent = totalHours;
  const daysPresentEl = document.querySelectorAll('.weekly-summary .summary-value')[1];
  if (daysPresentEl) daysPresentEl.textContent = `${daysPresent}/4`;
  const attendanceRateEl = document.querySelectorAll('.weekly-summary .summary-value')[2];
  if (attendanceRateEl) attendanceRateEl.textContent = `${attendanceRate}%`;

  // Update attendance chart to reflect latest data
  createAttendanceChart();
}

document.addEventListener('DOMContentLoaded', updateWeeklySummary);

function updateAttendanceHistory() {
  const historyTable = document.getElementById('attendance-history');
  if (!historyTable) return;
  historyTable.innerHTML = '';
  let userAttendance = appData.attendance_data
    .filter(item => item.user_id === appData.currentUser.id && item.logout_time)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  let displayAttendance = userAttendance.slice(0, 5);
  displayAttendance.forEach((item, idx) => {
    const row = document.createElement('tr');
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    let statusText = 'Checked Out';
    let statusClass = 'status--success';
    let hoursWorked = calculateHoursWorked(item.login_time, item.logout_time);
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${item.login_time || '-'}</td>
      <td>${item.logout_time || '-'}</td>
      <td>${hoursWorked || '-'}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
    `;
    historyTable.appendChild(row);
  });
  // Add view history button if not showing all and more than 5 exist
  if (userAttendance.length > 5) {
    const viewBtnRow = document.createElement('tr');
    const viewBtnCell = document.createElement('td');
    viewBtnCell.colSpan = 5;
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View History';
    viewBtn.className = 'btn btn--primary';
    viewBtn.onclick = function() {
      showAllAttendance = true;
      showAttendanceHistoryPage();
    };
    viewBtnCell.appendChild(viewBtn);
    viewBtnRow.appendChild(viewBtnCell);
    historyTable.appendChild(viewBtnRow);
  }
  // After updating attendance history, update weekly summary
  updateWeeklySummary();
}

// Restore check-in state after reload
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = appData.attendance_data.find(a => a.user_id === appData.currentUser.id && a.date === today && a.login_time && !a.logout_time);
      appData.currentlyWorking = !!todayAttendance;
      appData.todayCheckIn = todayAttendance ? todayAttendance.login_time : '';