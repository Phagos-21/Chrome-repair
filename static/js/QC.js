document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("repairForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      model: form.model.value.trim(),
      asset_tag: form.asset_tag.value.trim(),
      qc_name: form.qc_name.value.trim(),
      notes: form.notes.value.trim(),
      date: form.date.value
    };

    try {
      const response = await fetch("/submit_repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      const messageDiv = document.getElementById("resultMessage");

      if (result.success) {
        messageDiv.innerText = "Saved from QC!";
        form.reset();
      } else {
        messageDiv.innerText = "Error saving.";
      }
    } catch (err) {
      console.error(err);
      document.getElementById("resultMessage").innerText = "Server error.";
    }
  });
});