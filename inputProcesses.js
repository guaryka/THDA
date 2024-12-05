function createProcessInputs() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const processInputsDiv = document.getElementById("processInputs");
    processInputsDiv.innerHTML = "";

    for (let i = 0; i < numProcesses; i++) {
        processInputsDiv.innerHTML += `
                    <div class="form-group">
                        <h6>Process ${i + 1}</h6>
                        <label for="arrivalTime${i}">Arrival Time:</label>
                        <input type="number" class="form-control" id="arrivalTime${i}" required>
                        <label for="burstTime${i}">Burst Time:</label>
                        <input type="number" class="form-control" id="burstTime${i}" required>
                        <label for="priority${i}">Priority:</label>
                        <input type="number" class="form-control" id="priority${i}" required>
                    </div>
                `;
    }
}

function inputProcesses() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    processes = [];

    for (let i = 0; i < numProcesses; i++) {
        const at = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const bt = parseInt(document.getElementById(`burstTime${i}`).value);
        const pr = parseInt(document.getElementById(`priority${i}`).value);
        processes.push({
            at: at,
            bt: bt,
            pr: pr,
            pno: i + 1,
        });
    }

    const processListBody = document.getElementById("processListBody");
    processListBody.innerHTML = "";

    processes.forEach((process, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${process.at}</td>
            <td>${process.bt}</td>
            <td>${process.pr}</td>
        `;
        processListBody.appendChild(row);
    });

    $('#processModal').modal('hide');

    displayResults();
}

function compare(a, b) {
    if (a.at === b.at) return a.pr - b.pr;
    return a.at - b.at;
}