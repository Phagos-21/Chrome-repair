document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("techForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      model: form.cbModel.value.trim(),
      asset_tag: form.assetTag.value.trim(),
      partDetails: form.partDetails.value.trim(),
      workCompleted: form.workCompleted.value.trim(),
      notes: form.notes.value.trim(),
      technician: form.technician.value.trim(),
      dateCompleted: form.dateCompleted.value,
      comments: form.comments?.value.trim() || ""
    };

    try {
      const response = await fetch("/submit_repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert("Saved from Tech!");
        form.reset();
      } else {
        alert("Error saving data.");
      }
    } catch (err) {
      console.error("Error submitting repair:", err);
      alert("Server error occurred.");
    }
  });
});