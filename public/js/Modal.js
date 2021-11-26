export default class Modal {
  markup = `
        <div class="overlay"></div>
        <div class="modal-container">
        <div class="modal-main">
            <div class="modal-top">
            <h2 class="modal-brand">New Project</h2>
            <button type="button" class="btn-close" id="modal-close" aria-label="Close"></button>
            </div>
            <div class="modal-main__content">
            <form class="form-main" id="new-proj__form">
                <div class="mb-3">
                <label class="form-label">Project Title*</label>
                <input class="form-control" placeholder="Enter Project Title here..." id="projectTitle" required>
                </div>
                <div class="mb-3">
                <label class="form-label">Date*</label>
                <input class="form-control" type="date" placeholder="Project Date" id="projectDate" required>
                </div>
                <div class="row mb-3">
                <label class="form-label">Milestone</label>
                <div class="col">
                    <input class="form-control" id="projectMilestoneInputTitle" placeholder="Enter description.">
                </div>
                <div class="col">
                    <input class="form-control" id="projectMilestoneInputDate" type="date" placeholder="Enter date.">
                </div>
                <div class="col">
                    <input class="form-control" id="projectMilestoneInputUsers" type="text" placeholder="Enter Users.">
                </div>
                </div>
                <label class="form-label">Status*</label>
                <div class="form-check">
                    <input type="radio" class="form-check-input" id="completedCheckbox" name="flexRadioDefault">
                    <label class="form-check-label" for="completedCheckbox">Completed</label>
                </div>
                <small class="form-text">Or</small>
                <div class="form-check mb-3">
                    <input type="radio" class="form-check-input" name="flexRadioDefault" id="pendingCheckbox" checked>
                    <label class="form-check-label" for="pendingCheckbox">Pending</label>
                </div>
                <div class="mb-3">
                <label class="form-label" class="project-github-repo-label">Github Repository</label>
                <input class="form-control" placeholder="Your github repository over here.." id="projectGithubRepo">
                </div>
                <button type="submit" class="btn btn-primary form-submit">Submit</button>
            </form>
            </div>
        </div>
        </div>
    `;

  previewBtns = `
        <div class="proj__btn-actions">
            <button type="submit" class="btn btn-success form-edit btn-action" data-type="edit">Edit</button>
            <button type="button" class="btn btn-outline-danger form-delete btn-action">Delete</button>
        </div>
    `;

  constructor(calendar, values = null, preview = false) {
    this.calendar = calendar;
    document.body.insertAdjacentHTML("afterbegin", this.markup);
    this.overlay = document.querySelector(".overlay");
    this.modalContainer = document.querySelector(".modal-container");

    this.attachCloseHandler();
    this.selectFormAndInputs();

    if (values) {
      this.fillForm(values);
    }

    if (preview) {
      this.form.removeChild(document.querySelector(".form-submit"));
      this.form.insertAdjacentHTML("beforeend", this.previewBtns);
      document.querySelector(".form-delete").addEventListener("click", () => {
        this.deleteHandler(values.id);
      });
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.editHandler(values.id);
      });
      return;
    }

    this.form.addEventListener("submit", this.submitHandler.bind(this));
  }

  attachCloseHandler() {
    document
      .getElementById("modal-close")
      .addEventListener("click", this.closeHandler.bind(this));
    this.overlay.addEventListener("click", this.closeHandler.bind(this));
    document.addEventListener("keydown", this.escapePressHandler.bind(this));
  }

  closeHandler() {
    if (!this.overlay || !this.modalContainer) {
      return;
    }
    document.body.removeChild(this.overlay);
    document.body.removeChild(this.modalContainer);
    this.overlay = null;
    this.modalContainer = null;
  }

  escapePressHandler(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.closeHandler();
    }
  }

  selectFormAndInputs() {
    this.form = document.getElementById("new-proj__form");
    this.projectTitle = document.getElementById("projectTitle");
    this.projectDate = document.getElementById("projectDate");
    this.projectMilestoneInputTitle = document.getElementById(
      "projectMilestoneInputTitle"
    );
    this.projectMilestoneInputDate = document.getElementById(
      "projectMilestoneInputDate"
    );
    this.projectMilestoneInputUsers = document.getElementById(
      "projectMilestoneInputUsers"
    );

    this.addMilestoneBtn = document.getElementById("add-milestone");
    this.completedCheckbox = document.getElementById("completedCheckbox");
    this.pendingCheckbox = document.getElementById("pendingCheckbox");
    this.projectGithubRepo = document.getElementById("projectGithubRepo");
  }

  async submitHandler(e) {
    e.preventDefault();
    const projectId = Math.trunc(Math.random() * 1000000);
    this.calendar.createSchedules([
      {
        id: projectId,
        calendarId: "1",
        title: this.projectTitle.value,
        start: new Date(this.projectDate.value).toString(),
        category: "time",
        dueDateClass: "",
        raw: {
          date: this.projectDate.value,
          milestoneTitle: this.projectMilestoneInputTitle.value,
          milestoneDate: this.projectMilestoneInputDate.value,
          milestoneUsers: this.projectMilestoneInputUsers.value,
          completed: this.completedCheckbox.checked,
          pending: this.pendingCheckbox.checked,
          githubRepo: this.projectGithubRepo.value,
        },
      },
    ]);
    this.closeHandler();

    const data = {
      proj_id: projectId,
      title: this.projectTitle.value,
      date: this.projectDate.value,
      status: this.completedCheckbox.checked ? "completed" : "pending",
      milestoneTitle: this.projectMilestoneInputTitle.value,
      milestoneDate: this.projectMilestoneInputDate.value,
      milestoneUsers: this.projectMilestoneInputUsers.value,
      githubRepo: this.projectGithubRepo.value,
    };

    await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  fillForm(values) {
    this.projectTitle.value = values.title;
    this.projectDate.value = values.raw.date;
    this.projectMilestoneInputTitle.value = values.raw.milestoneTitle ?? "";
    this.projectMilestoneInputDate.value = values.raw.milestoneDate ?? "";
    this.projectMilestoneInputUsers.value = values.raw.milestoneUsers ?? "";
    this.completedCheckbox.checked = values.raw.completed;
    this.pendingCheckbox.checked = values.raw.pending;
    this.projectGithubRepo.value = values.raw.githubRepo ?? "";
  }

  async deleteHandler(pid) {
    this.calendar.deleteSchedule(pid, "1");
    this.closeHandler();
    await fetch(`/api/projects/${pid}`, {
      method: "DELETE",
    });
  }

  async editHandler(pid) {
    this.calendar.updateSchedule(pid, "1", {
      title: this.projectTitle.value,
      start: new Date(this.projectDate.value).toString(),
      end: new Date(this.projectDate.value).toString(),
      raw: {
        date: this.projectDate.value,
        milestoneTitle: this.projectMilestoneInputTitle.value,
        milestoneDate: this.projectMilestoneInputDate.value,
        milestoneUsers: this.projectMilestoneInputUsers.value,
        completed: this.completedCheckbox.checked,
        pending: this.pendingCheckbox.checked,
        githubRepo: this.projectGithubRepo.value,
      },
    });

    this.closeHandler();

    const data = {
      title: this.projectTitle.value,
      date: this.projectDate.value,
      status: this.completedCheckbox.checked ? "completed" : "pending",
      milestoneTitle: this.projectMilestoneInputTitle.value,
      milestoneDate: this.projectMilestoneInputDate.value,
      milestoneUsers: this.projectMilestoneInputUsers.value,
      githubRepo: this.projectGithubRepo.value,
    };

    await fetch(`/api/projects/${pid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}
