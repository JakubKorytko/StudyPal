const form = document.getElementById("plan-form");
const list = document.getElementById("plans-list");

async function fetchPlans() {
  const res = await fetch("/api/plans");
  const plans = await res.json();
  list.innerHTML = "";
  for (const plan of plans) {
    const li = document.createElement("li");
    const div = document.createElement("div");

    div.innerHTML = `<strong>${plan.date}</strong> — ${plan.title} [${plan.status}]`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "delete-button";
    deleteBtn.onclick = async () => {
      await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
      fetchPlans();
    };

    const div2 = document.createElement("div");

    div2.classList.add("header");

    div2.appendChild(div);
    div2.appendChild(deleteBtn);
    li.appendChild(div2);

    const stepList = document.createElement("ul");
    stepList.className = "step-list";

    const steps = await (await fetch(`/api/plans/${plan.id}/steps`)).json();
    steps.forEach((step) => {
      const stepItem = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = step.is_completed === 1;
      checkbox.onchange = async () => {
        await fetch(`/api/steps/${step.id}/toggle`, { method: "POST" });
        fetchPlans();
      };
      const label = document.createElement("span");
      label.textContent = step.title;
      stepItem.append(checkbox, label);
      stepList.appendChild(stepItem);
    });
    li.appendChild(stepList);

    const stepForm = document.createElement("form");
    stepForm.className = "step-form";
    stepForm.onsubmit = async (e) => {
      e.preventDefault();
      const input = stepForm.querySelector("input");
      await fetch(`/api/plans/${plan.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.value }),
      });
      fetchPlans();
    };
    const stepInput = document.createElement("input");
    stepInput.placeholder = "Dodaj krok...";
    stepForm.appendChild(stepInput);
    stepForm.appendChild(document.createElement("button")).textContent = "+";
    li.appendChild(stepForm);

    list.appendChild(li);
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  await fetch("/api/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, date }),
  });
  form.reset();
  fetchPlans();
};

fetchPlans();
