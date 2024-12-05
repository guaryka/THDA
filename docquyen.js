let processes = [];

function getWaitingTime(processes) {
    const wt = [];
    wt[0] = 0;
    for (let i = 1; i < processes.length; i++) {
        wt[i] = Math.max(0, processes[i - 1].bt + wt[i - 1] - processes[i].at);
    }
    return wt;
}

function displayResults() {
    processes.sort(compare);
    const wt = getWaitingTime(processes);
    const tat = processes.map((p, i) => p.bt + wt[i]);

    let wavg = 0, tavg = 0;
    const stime = [], ctime = [];

    stime[0] = processes[0].at;
    ctime[0] = stime[0] + tat[0];

    for (let i = 1; i < processes.length; i++) {
        stime[i] = ctime[i - 1];
        ctime[i] = stime[i] + tat[i] - wt[i];
    }

    const tableBody = document.getElementById("processTableBody");
    tableBody.innerHTML = "";

    for (let i = 0; i < processes.length; i++) {
        wavg += wt[i];
        tavg += tat[i];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${processes[i].pno}</td>
            <td>${stime[i]}</td>
            <td>${ctime[i]}</td>
            <td>${tat[i]}</td>
            <td>${wt[i]}</td>
        `;
        tableBody.appendChild(row);
    }

    const averageWaitingTime = (wavg / processes.length).toFixed(2);
    const averageTurnaroundTime = (tavg / processes.length).toFixed(2);
    const averagesRow = document.createElement("tr");
    averagesRow.innerHTML = `
        <td colspan="4">Average Waiting Time</td>
        <td>${averageWaitingTime}</td>
    `;
    tableBody.appendChild(averagesRow);

    const averagesRow2 = document.createElement("tr");
    averagesRow2.innerHTML = `
        <td colspan="4">Average Turnaround Time</td>
        <td>${averageTurnaroundTime}</td>
    `;
    tableBody.appendChild(averagesRow2);

    displayRunTimeTable(ctime[processes.length - 1], stime, ctime);
    displayGanttChart(stime, ctime);
}

function displayRunTimeTable(maxTime, stime, ctime) {
    const runTimeTableBody = document.getElementById("runTimeTableBody");
    runTimeTableBody.innerHTML = "";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Time</th>" + processes.map(p => `<th>P${p.pno}</th>`).join('');
    runTimeTableBody.appendChild(headerRow);

    for (let t = 0; t <= maxTime; t++) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${t}</td>` + processes.map((p, i) => {
            const remainingTime = ctime[i] - t;
            if (t === stime[i]) {
                return `<td class="highlight">${remainingTime}, <strong>${p.pr}</strong></td>`;
            }
            if (t > stime[i] && t < ctime[i]) {
                return `<td class="highlight">${remainingTime}</td>`;
            }
            return `<td></td>`;
        }).join('');
        runTimeTableBody.appendChild(row);
    }
}

function displayGanttChart(stime, ctime) {
    const ganttTableBody = document.getElementById("ganttTableBody");
    ganttTableBody.innerHTML = "";

    const ganttRow = document.createElement("tr");
    ganttRow.innerHTML = processes.map((p, i) => `
        <td>${stime[i]}</td>
        <td>P${p.pno}</td>
        <td>${ctime[i]}</td>
    `).join('');
    ganttTableBody.appendChild(ganttRow);
}

window.onload = function () {
    fetch('processModal.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('modal-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading the modal:', error));
};
