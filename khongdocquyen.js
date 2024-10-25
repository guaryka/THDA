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
    displayGanttChart(stime, ctime);
}

function displayRunTimeTable(maxTime, processes) {
    const runTimeTableBody = document.getElementById("runTimeTableBody");
    runTimeTableBody.innerHTML = ""; // Xóa dữ liệu cũ

    // Tạo hàng đầu tiên cho thời gian và cột tiến trình
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

    // Duyệt qua từng thời điểm từ 0 đến maxTime
    while (currentTime <= maxTime) {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = currentTime;
        row.appendChild(timeCell);

        let selectedProcess = null;

        // Tìm tiến trình có thể chạy tại currentTime
        processes.forEach(process => {
            if (process.at <= currentTime && process.bt > 0) { // Chỉ xét tiến trình còn Burst Time
                if (!selectedProcess || process.pr < selectedProcess.pr) {
                    selectedProcess = process; // Chọn tiến trình có Priority cao nhất
                }
            }
        });

        // Tạo các ô cho từng tiến trình
        processes.forEach(process => {
            const cell = document.createElement("td");
            if (selectedProcess && process.pno === selectedProcess.pno) {
                if (selectedProcess.startTime === null) {
                    selectedProcess.startTime = currentTime; // Ghi lại startTime
                }
                cell.textContent = selectedProcess.bt; // Thời gian còn lại
                cell.classList.add("highlight"); // Thêm màu cho tiến trình đang chạy
                selectedProcess.bt--; // Giảm Burst Time
                if (selectedProcess.bt === 0) {
                    selectedProcess.completeTime = currentTime + 1; // Ghi lại completeTime
                }
            } else {
                cell.textContent = ""; // Ô trống nếu không chạy
            }
            row.appendChild(cell);
        });

        runTimeTableBody.appendChild(row); // Thêm hàng vào bảng
        currentTime++;
    }

    // Hiển thị thông tin thời gian bắt đầu và hoàn thành
    processes.forEach(process => {
        console.log(`Process P${process.pno}: Start Time = ${process.startTime}, Complete Time = ${process.completeTime}`);
    });
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
    const ganttTableBody = document.getElementById("ganttChartBody");
    ganttTableBody.innerHTML = ""; // Xóa dữ liệu cũ

    // Tạo hàng cho Gantt Chart
    const row = document.createElement("tr");
    stime.forEach(time => {
        const cell = document.createElement("td");
        cell.textContent = time;
        row.appendChild(cell);
    });
    ganttTableBody.appendChild(row);

    const processRow = document.createElement("tr");
    processes.forEach(process => {
        const cell = document.createElement("td");
        cell.textContent = `P${process.pno}`;
        processRow.appendChild(cell);
    });
    ganttTableBody.appendChild(processRow);

    // Thêm hàng thời gian hoàn thành
    const ctimeRow = document.createElement("tr");
    ctime.forEach(time => {
        const cell = document.createElement("td");
        cell.textContent = time;
        ctimeRow.appendChild(cell);
    });
    ganttTableBody.appendChild(ctimeRow);
}

// Khởi tạo sự kiện cho nút thêm tiến trình
document.getElementById("addProcessButton").addEventListener("click", createProcessInputs);
