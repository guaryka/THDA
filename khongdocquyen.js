class Process {
    constructor(at, bt, pr, pno) {
        this.at = at; // Arrival Time
        this.bt = bt; // Burst Time
        this.pr = pr; // Priority
        this.pno = pno; // Process Number
        this.startTime = null; // Thời gian bắt đầu
        this.completeTime = null; // Thời gian hoàn thành
    }
}

let processes = [];

let processTimeline = [];

function createProcessInputs() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const processInputsDiv = document.getElementById("processInputs");
    processInputsDiv.innerHTML = ""; // Xóa dữ liệu cũ

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

function compare(a, b) {
    if (a.at === b.at) {
        return a.pr - b.pr; // So sánh theo Priority nếu Arrival Time bằng nhau
    }
    return a.at - b.at; // So sánh theo Arrival Time
}

function getWaitingTime(processes) {
    const wt = [];
    const tat = getTurnaroundTime(processes); // Lấy Turnaround Time

    for (let i = 0; i < processes.length; i++) {
        wt[i] = tat[i] - processes[i].bt; // Tính Waiting Time
    }
    return wt;
}

function getTurnaroundTime(processes) {
    return processes.map(process => process.completeTime - process.at); // Tính Turnaround Time
}

function displayResults() {
    processes.sort(compare); // Sắp xếp theo Arrival Time và Priority
    let stime = [], ctime = []; // Thời gian bắt đầu và hoàn thành

    for (let i = 0; i < processes.length; i++) {
        if (i === 0) {
            stime[i] = processes[i].at; // Thời gian bắt đầu của tiến trình đầu tiên
        } else {
            stime[i] = Math.max(ctime[i - 1], processes[i].at); // Thời gian bắt đầu bằng thời gian hoàn thành của tiến trình trước hoặc Arrival Time của tiến trình hiện tại
        }
        ctime[i] = stime[i] + processes[i].bt; // Thời gian hoàn thành
        processes[i].completeTime = ctime[i]; // Lưu lại thời gian hoàn thành
    }

    const wt = getWaitingTime(processes);
    const tat = getTurnaroundTime(processes);

    let wavg = 0, tavg = 0;
    const tableBody = document.getElementById("processTableBody");
    tableBody.innerHTML = ""; // Xóa dữ liệu cũ

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

    // Gọi displayRunTimeTable với đúng dữ liệu
    displayRunTimeTable(ctime[processes.length - 1], processes);
}

function displayRunTimeTable(maxTime, processes) {
    const runTimeTableBody = document.getElementById("runTimeTableBody");
    runTimeTableBody.innerHTML = ""; // Clear previous data

    // Create header row for time and processes
    const headerRow = document.createElement("tr");
    const timeHeader = document.createElement("th");
    timeHeader.textContent = "Time";
    headerRow.appendChild(timeHeader);

    processes.forEach(process => {
        const th = document.createElement("th");
        th.textContent = `P${process.pno}`;
        headerRow.appendChild(th);
    });
    runTimeTableBody.appendChild(headerRow);

    let currentTime = 0;

    // To store the start and end times
    let startTimes = new Array(processes.length).fill(null);
    let endTimes = new Array(processes.length).fill(null);

    // Loop through each time unit
    while (currentTime <= maxTime) {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = currentTime;
        row.appendChild(timeCell);

        let selectedProcess = null;

        // Find the process that can run at currentTime
        processes.forEach(process => {
            if (process.at <= currentTime && process.bt > 0) { // Only consider processes with remaining burst time
                if (!selectedProcess || process.pr < selectedProcess.pr) {
                    selectedProcess = process; // Choose the process with highest priority
                }
            }
        });

        // Store the current time and selected process in the processTimeline array
        if (selectedProcess) {
            processTimeline.push({
                time: currentTime,
                process: `P${selectedProcess.pno}`
            });
        }

        // Create cells for each process
        processes.forEach(process => {
            const cell = document.createElement("td");
            if (selectedProcess && process.pno === selectedProcess.pno) {
                if (startTimes[process.pno - 1] === null) {
                    startTimes[process.pno - 1] = currentTime; // Record start time
                }
                cell.textContent = selectedProcess.bt; // Remaining burst time
                cell.classList.add("highlight"); // Add highlight class for the running process
                selectedProcess.bt--; // Decrease burst time
                if (selectedProcess.bt === 0) {
                    endTimes[process.pno - 1] = currentTime + 1; // Record complete time
                }
            } else {
                cell.textContent = ""; // Empty cell if process is not running
            }
            row.appendChild(cell);
        });

        runTimeTableBody.appendChild(row); // Append the row to the table
        currentTime++;
    }

    // Log the start and end times for each process
    processes.forEach(process => {
        console.log(`Process P${process.pno}: Start Time = ${startTimes[process.pno - 1]}, Complete Time = ${endTimes[process.pno - 1]}`);
    });

    // Log the process timeline
    console.log("Process Timeline:", processTimeline);

    // Call function to update the Gantt Chart
    displayGanttChart(processTimeline);
    console.log("Process Timeline:", processTimeline);
}


function inputProcesses() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    processes = []; // Reset danh sách tiến trình

    for (let i = 0; i < numProcesses; i++) {
        const at = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const bt = parseInt(document.getElementById(`burstTime${i}`).value);
        const pr = parseInt(document.getElementById(`priority${i}`).value);
        processes.push(new Process(at, bt, pr, i + 1)); // Tạo tiến trình mới
    }

    // Hiển thị danh sách tiến trình
    const processListBody = document.getElementById("processListBody");
    processListBody.innerHTML = ""; // Xóa dữ liệu cũ

    processes.forEach(process => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${process.pno}</td>
            <td>${process.at}</td>
            <td>${process.bt}</td>
            <td>${process.pr}</td>
        `;
        processListBody.appendChild(row);
    });

    // Đóng modal
    $('#processModal').modal('hide');

    // Hiển thị kết quả
    displayResults();
}

function displayGanttChart(processTimeline) {
    console.log(processTimeline);
    const ganttTableBody = document.getElementById("ganttTableBody");
    ganttTableBody.innerHTML = ""; // Clear old data

    // Create a row for the Gantt chart
    const ganttRow = document.createElement("tr");

    // Add "Time" as the first column
    const timeHeaderCell = document.createElement("td");
    timeHeaderCell.textContent = "Time";
    ganttRow.appendChild(timeHeaderCell);

    // Variables to track the last process and its start time
    let lastProcess = null;
    let startTime = null;

    processTimeline.forEach((entry, index) => {
        // If the current process is different from the last one, create new columns
        if (entry.process !== lastProcess) {
            // If there's a previous process, create a cell for the previous time
            if (lastProcess !== null) {
                const timeCell = document.createElement("td");
                timeCell.textContent = startTime;
                ganttRow.appendChild(timeCell);

                const processCell = document.createElement("td");
                processCell.textContent = lastProcess;
                ganttRow.appendChild(processCell);
            }

            // Set the start time for the new process
            startTime = entry.time;
            lastProcess = entry.process;
        }
    });

    // Add the final process at the end
    if (lastProcess !== null) {
        const timeCell = document.createElement("td");
        timeCell.textContent = startTime;
        ganttRow.appendChild(timeCell);

        const processCell = document.createElement("td");
        processCell.textContent = lastProcess;
        ganttRow.appendChild(processCell);
    }

    // Add the final time (currentTime + 1) at the end of the row
    const timeCell = document.createElement("td");
    timeCell.textContent = processTimeline[processTimeline.length - 1].time + 1; // Time of last process + 1
    ganttRow.appendChild(timeCell);

    // Add the row to the table
    ganttTableBody.appendChild(ganttRow);
}

