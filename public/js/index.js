import Modal from "./Modal.js";

const newProjBtn = document.getElementById("new-proj");
const todayBtn = document.getElementById("today");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

// TUICalendar
const calendar = new tui.Calendar("#calendar", {
  defaultView: "month",
  taskView: true,
  disableClick: true,
  disableDblClick: true,
  useCreationPopup: false,
  useDetailPopup: false,
  usageStatistics: false,
});

newProjBtn.addEventListener("click", (e) => {
  new Modal(calendar);
});

(async function init() {
  displayCurrentMonth();
  renderFooter();
  await loadProjects();
})();

function displayCurrentMonth() {
  const monthDisplayer = document.getElementById("date-display");
  const date = calendar.getDate();
  const months = new Array(12);
  months[0] = "Jan";
  months[1] = "Feb";
  months[2] = "Mar";
  months[3] = "Apr";
  months[4] = "May";
  months[5] = "Jun";
  months[6] = "Jul";
  months[7] = "Aug";
  months[8] = "Sept";
  months[9] = "Oct";
  months[10] = "Nov";
  months[11] = "Dec";

  monthDisplayer.textContent = `${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
}

function renderFooter() {
  const markup = `
    <footer class="footer">
      <p>
        &copy; Copyright ${new Date().getFullYear()}. Designed and developed by
        <a
          href="https://www.upwork.com/o/profiles/users/~01e895ba8aca7b3ad0/"
          target="_blank"
          >Nidhal Messaoudi.</a
        >
      </p>
    </footer>
  `;

  document.body.insertAdjacentHTML("beforeend", markup);
}

async function loadProjects() {
  const res = await fetch("/api/projects");
  const data = await res.json();

  console.log();
  data.data.forEach((project) => {
    calendar.createSchedules([
      {
        id: project.pid,
        calendarId: "1",
        title: project.title,
        start: getDate(project.startDate),
        category: "time",
        dueDateClass: "",
        raw: {
          date: getDate(project.startDate),
          milestoneTitle: project.milestoneTitle,
          milestoneDate: getDate(project.milestoneDate),
          milestoneUsers: project.milestoneUsers,
          completed: project.status === "completed",
          pending: project.status === "pending",
          githubRepo: project.githubRepo,
        },
      },
    ]);
  });
}

document.addEventListener("load", () => {
  displayCurrentMonth();
});

todayBtn.addEventListener("click", () => {
  calendar.today();
  displayCurrentMonth();
});

prevMonthBtn.addEventListener("click", () => {
  calendar.prev();
  displayCurrentMonth();
});

nextMonthBtn.addEventListener("click", () => {
  calendar.next();
  displayCurrentMonth();
});

calendar.on("clickSchedule", (e) => {
  const schedule = e.schedule;
  new Modal(calendar, schedule, true);
});

function getDate(dateStr) {
  if (!dateStr) {
    return null;
  }
  const offset = new Date().getTimezoneOffset();
  return new Date(new Date(dateStr).getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}
