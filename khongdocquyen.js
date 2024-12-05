let processes = [];

function populateProcessTable(processes, stime, ctime, tat, wt) {
    const tableBody = document.getElementById("processTableBody");
    tableBody.innerHTML = "";
    let wavg = 0, tavg = 0;

    for (let i = 0; i < processes.length; i++) {
        wavg += wt[i];
        tavg += tat[i];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
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
}

function displayResults() {
    processes.sort(compare);
    let stime = [], ctime = [];

    for (let i = 0; i < processes.length; i++) {
        if (i === 0) {
            stime[i] = processes[i].at;
        } else {
            stime[i] = Math.max(ctime[i - 1], processes[i].at);
        }
        ctime[i] = stime[i] + processes[i].bt;
        processes[i].completeTime = ctime[i];
    }

    displayRunTimeTable(ctime[processes.length - 1], processes);
}

function displayRunTimeTable(maxTime, processes) {
    const runTimeTableBody = document.getElementById("runTimeTableBody");
    runTimeTableBody.innerHTML = "";

    const headerRow = document.createElement("tr");
    const timeHeader = document.createElement("th");
    timeHeader.textContent = "Time";
    headerRow.appendChild(timeHeader);

    processes.forEach((process, index) => {
        const th = document.createElement("th");
        th.textContent = `P${index + 1}`;
        headerRow.appendChild(th);
    });
    runTimeTableBody.appendChild(headerRow);

    let currentTime = 0;
    let startTimes = new Array(processes.length).fill(null);
    let endTimes = new Array(processes.length).fill(null);
    let firstAppearances = new Array(processes.length).fill(false);
    let processTimeline = [];
    let processOrder = [];

    processes.forEach((process) => {
        process.originalBt = process.bt;
    });

    while (currentTime <= maxTime) {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = currentTime;
        row.appendChild(timeCell);

        let selectedProcess = null;

        processes.forEach((process) => {
            if (process.at <= currentTime && process.bt > 0) {
                if (!selectedProcess || process.pr < selectedProcess.pr) {
                    selectedProcess = process;
                }
            }
        });

        if (selectedProcess) {
            processTimeline.push({
                time: currentTime,
                process: `P${selectedProcess.pno}`
            });

            if (startTimes[selectedProcess.pno - 1] === null) {
                startTimes[selectedProcess.pno - 1] = currentTime;
            }

            processOrder.push(selectedProcess.pno);
        }

        processes.forEach((process) => {
            const cell = document.createElement("td");
            if (selectedProcess && process.pno === selectedProcess.pno) {
                if (firstAppearances[process.pno - 1] === false) {
                    firstAppearances[process.pno - 1] = true;
                    cell.innerHTML = `${selectedProcess.bt}, <strong>${process.pr}</strong>`;
                } else {
                    cell.textContent = selectedProcess.bt;
                }

                cell.classList.add("highlight");
                selectedProcess.bt--;
                if (selectedProcess.bt === 0) {
                    endTimes[process.pno - 1] = currentTime + 1;
                    selectedProcess.ct = endTimes[process.pno - 1];
                }
            } else {
                cell.textContent = "";
            }
            row.appendChild(cell);
        });

        runTimeTableBody.appendChild(row);
        currentTime++;
    }

    const turnaroundTimes = endTimes.map((ctime, i) => ctime - processes[i].at);
    const waitingTimes = turnaroundTimes.map((tat, i) => tat - processes[i].originalBt);

    populateProcessTable(processes, startTimes, endTimes, turnaroundTimes, waitingTimes, processOrder);

    displayGanttChart(processTimeline);

}


function displayGanttChart(processTimeline) {
    const ganttTableBody = document.getElementById("ganttTableBody");
    ganttTableBody.innerHTML = "";
    const ganttRow = document.createElement("tr");

    let lastProcess = null;
    let startTime = null;

    processTimeline.forEach((entry) => {
        if (entry.process !== lastProcess) {
            if (lastProcess !== null) {
                const timeCell = document.createElement("td");
                timeCell.textContent = startTime;
                ganttRow.appendChild(timeCell);

                const processCell = document.createElement("td");
                processCell.textContent = lastProcess;
                ganttRow.appendChild(processCell);
            }

            startTime = entry.time;
            lastProcess = entry.process;
        }
    });

    if (lastProcess !== null) {
        const timeCell = document.createElement("td");
        timeCell.textContent = startTime;
        ganttRow.appendChild(timeCell);

        const processCell = document.createElement("td");
        processCell.textContent = lastProcess;
        ganttRow.appendChild(processCell);
    }

    const timeCell = document.createElement("td");
    timeCell.textContent = processTimeline[processTimeline.length - 1].time + 1;
    ganttRow.appendChild(timeCell);

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
