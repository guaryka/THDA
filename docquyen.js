class Process {
    constructor(at, bt, pr, pno) {
        this.at = at; // Arrival Time
        this.bt = bt; // Burst Time
        this.pr = pr; // Priority
        this.pno = pno; // Process Number
    }
}

let processes = [];

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
        return a.pr - b.pr;
    }
    return a.at - b.at;
}

function getWaitingTime(processes) {
    const wt = [];
    const service = [];
    service[0] = processes[0].at;
    wt[0] = 0;

    for (let i = 1; i < processes.length; i++) {
        service[i] = processes[i - 1].bt + service[i - 1];
        wt[i] = service[i] - processes[i].at;
        if (wt[i] < 0) {
            wt[i] = 0;
        }
    }
    return wt;
}

function getTurnaroundTime(processes, wt) {
    return processes.map((process, i) => process.bt + wt[i]);
}

function displayResults() {
    processes.sort(compare);
    const wt = getWaitingTime(processes);
    const tat = getTurnaroundTime(processes, wt);

    let wavg = 0, tavg = 0;
    const stime = [];
    const ctime = [];

    stime[0] = processes[0].at;
    ctime[0] = stime[0] + tat[0];

    for (let i = 1; i < processes.length; i++) {
        stime[i] = ctime[i - 1];
        ctime[i] = stime[i] + tat[i] - wt[i];
    }

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

    displayRunTimeTable(ctime[processes.length - 1], stime, ctime);
    displayGanttChart(stime, ctime);
}


function displayRunTimeTable(maxTime, stime, ctime) {
    const runTimeTableBody = document.getElementById("runTimeTableBody");
    runTimeTableBody.innerHTML = ""; // Xóa dữ liệu cũ

    // Tạo hàng đầu tiên cho thời gian
    const headerRow = document.createElement("tr");
    const timeHeader = document.createElement("th");
    timeHeader.textContent = "Time"; // Ghi "Time" cho ô trống
    headerRow.appendChild(timeHeader);

    for (let i = 0; i < processes.length; i++) {
        const th = document.createElement("th");
        th.textContent = `P${processes[i].pno}`; // Tiến trình
        headerRow.appendChild(th);
    }
    runTimeTableBody.appendChild(headerRow);

    // Tạo các hàng cho thời gian
    for (let t = 0; t <= maxTime; t++) {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = t; // Hiển thị thời gian
        row.appendChild(timeCell);

        for (let i = 0; i < processes.length; i++) {
            const cell = document.createElement("td");
            if (t >= stime[i] && t < ctime[i]) {
                cell.textContent = ctime[i] - t; // Thời gian còn lại
                cell.classList.add("highlight"); // Thêm màu nền vàng
            } else {
                cell.textContent = ""; // Ô trống nếu không có tiến trình nào chạy
            }
            row.appendChild(cell);
        }
        runTimeTableBody.appendChild(row);
    }
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
function displayGanttChart(stime, ctime) {
    const ganttTableBody = document.getElementById("ganttTableBody");
    ganttTableBody.innerHTML = ""; // Xóa dữ liệu cũ

    // Tạo một hàng cho biểu đồ Gantt
    const ganttRow = document.createElement("tr");

    for (let i = 0; i < processes.length; i++) {
        // Thêm ô cho thời gian bắt đầu
        const startCell = document.createElement("td");
        startCell.textContent = stime[i];
        ganttRow.appendChild(startCell);

        // Thêm ô cho tên tiến trình
        const processCell = document.createElement("td");
        processCell.textContent = `P${processes[i].pno}`;
        ganttRow.appendChild(processCell);

        // Nếu complete time của cái trước bằng start time của cái tiếp theo
        if (i < processes.length - 1 && ctime[i] === stime[i + 1]) {
            // Không thêm ô cho complete time, chỉ cần tiếp tục
            continue;
        }

        // Thêm ô cho thời gian hoàn thành
        const completeCell = document.createElement("td");
        completeCell.textContent = ctime[i];
        ganttRow.appendChild(completeCell);
    }

    ganttTableBody.appendChild(ganttRow); // Thêm hàng vào bảng
}