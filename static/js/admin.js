let repairsData = [];

async function fetchData() {
  const res = await fetch('/api/repairs.QC');
  repairsData = await res.json();
  buildTable();
}

function buildTable() {
  const headerRow = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  headerRow.innerHTML = "";
  tableBody.innerHTML = "";

  if (repairsData.length === 0) {
    headerRow.innerHTML = "<th>No data</th>";
    return;
  }

  const columns = [
    { label: "CB Model", key: "model" },
    { label: "CB Asset Tag#", key: "asset_tag" },
    { label: "QC Name", key: "qc_name" },
    { label: "Technician", key: "technician" },
    { label: "Work Completed", key: "workCompleted" },
    { label: "Part Details", key: "partDetails" },
    { label: "Date", key: "date" },
    { label: "Date Completed", key: "dateCompleted" },
    { label: "Notes", key: "notes" },
    { label: "Comments", key: "comments" },
    { label: "Actions", key: "__actions" } // специальная колонка для кнопки
  ];

  // build headers
  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;
    headerRow.appendChild(th);
  });

  // build rows
  repairsData.forEach((entry, index) => {
    const row = document.createElement("tr");

    columns.forEach(col => {
      const td = document.createElement("td");

      if (col.key === "__actions") {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️"; // ☢ 🗑️
        delBtn.style.background = "#cc0000";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.padding = "6px 10px";
        delBtn.style.borderRadius = "5px";
        delBtn.style.cursor = "pointer";

        delBtn.onclick = async () => {
          const confirmDelete = confirm("Delete this row?");
          if (!confirmDelete) return;

          await fetch(`/api/repairs.QC/${index}`, {
            method: "DELETE"
          });

          await fetchData(); // перерисовать таблицу
        };

        td.appendChild(delBtn);
      } else {
        const input = document.createElement("input");
        input.value = entry[col.key] || "";
        input.onchange = () => {
          repairsData[index][col.key] = input.value;
        };
        td.appendChild(input);
      }

      row.appendChild(td);
    });

    tableBody.appendChild(row);
  });
}

async function saveChanges() {
  for (let i = 0; i < repairsData.length; i++) {
    await fetch(`/api/repairs.QC/${i}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repairsData[i])
    });
  }
  alert("Changes saved!");
}

window.onload = fetchData;