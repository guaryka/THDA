
let currentObjectIndex = 0;
let objectData = [];

function generateProcess() {
    const quantity = document.getElementById('quantity').value;
    const processesContainer = document.getElementById('processesContainer');
    processesContainer.innerHTML = '';
    objectData = [];
    currentObjectIndex = 0;

    for (let i = 0; i < quantity; i++) {
        const objectContainer = document.createElement('div');
        objectContainer.className = 'object-container border p-3 mb-3 bg-light';

        const row = document.createElement('div');
        row.className = 'row';

        const titleCol = document.createElement('div');
        titleCol.className = 'col-md-2 d-flex align-items-center';
        const title = document.createElement('h4');
        title.innerHTML = `Tiến trình ${i + 1}`;
        title.className = 'highlight';
        titleCol.appendChild(title);

        const buttonCol = document.createElement('div');
        buttonCol.className = 'col-md-2 d-flex align-items-center';
        const openModalBtn = document.createElement('button');
        openModalBtn.className = 'btn btn-primary';
        openModalBtn.innerHTML = 'Nhập giá trị';
        openModalBtn.setAttribute('type', 'button');
        openModalBtn.setAttribute('data-bs-toggle', 'modal');
        openModalBtn.setAttribute('data-bs-target', '#processCreateModal');
        openModalBtn.onclick = function () {
            currentObjectIndex = i;
            document.getElementById('modalTitle').innerText = `NHẬP DỮ LIỆU TIẾN TRÌNH ${i + 1}`;
            // loadModalData(i);
        };
        buttonCol.appendChild(openModalBtn);

        const resultCol = document.createElement('div');
        resultCol.className = 'col-md-8 d-flex align-items-center';
        resultCol.id = `result-${i}`;

        row.appendChild(titleCol);
        row.appendChild(buttonCol);
        row.appendChild(resultCol);

        objectContainer.appendChild(row);
        processesContainer.appendChild(objectContainer);

        objectData.push({
            processName: '',
            arrivalTime: '',
            burstTime: '',
            priority: ''
        });
    }
}

//Hàm hiển thị dữ liệu
// function loadModalData(index) {
//     const object = objectData[index];
//     document.getElementById('name').value = object.name;
//     document.getElementById('age').value = object.age;
//     document.getElementById('address').value = object.address;
//     document.getElementById('email').value = object.email;
// }

// Hàm lưu dữ liệu và hiển thị
function saveModalData() {
    const object = {
        processName: document.getElementById('processName').value,
        arrivalTime: document.getElementById('arrivalTime').value,
        burstTime: document.getElementById('burstTime').value,
        priority: document.getElementById('priority').value
    };
    objectData[currentObjectIndex] = object;

    const resultContainer = document.getElementById(`result-${currentObjectIndex}`);
    resultContainer.innerHTML = `
                <span><strong>Tên:</strong> ${object.processName} </span> ,  
                <span><strong>Thời điểm đến:</strong> ${object.arrivalTime} </span> , 
                <span><strong>Thời gian bùng nổ:</strong> ${object.burstTime} </span> , 
                <span><strong>Độ ưu tiên:</strong> ${object.priority} </span>
            `;

    // Đóng modal
    const modalElement = document.getElementById('processCreateModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
}

// objectData.sort((a, b) => {
//     if (a.priority === b.priority) {
//         return a.arrivalTime - b.arrivalTime;
//     }
//     return a.priority - b.priority;
// });

function generateScheduleTable(objectData) {
    objectData.sort((a, b) => {
        if (a.priority === b.priority) {
            return a.arrivalTime - b.arrivalTime;
        }
        return a.priority - b.priority;
    });

    let table = "<table class='table'><thead><tr><th>Thời gian</th>";
    objectData.forEach(p => {
        table += `<th>${p.processName}</th>`;
    });
    table += "</tr></thead><tbody>";

    let currentTime = 0;
    let remainingProcesses = [...objectData];

    while (remainingProcesses.length > 0) {
        let availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);

        if (availableProcesses.length === 0) {
            table += `<tr><td>${currentTime}</td>`;
            objectData.forEach(p => {
                table += "<td></td>";
            });
            table += "</tr>";
            currentTime++;
            continue;
        }

        availableProcesses.sort((a, b) => a.priority - b.priority);
        let currentProcess = availableProcesses[0];

        table += `<tr><td>${currentTime}</td>`;
        objectData.forEach(p => {
            if (p === currentProcess) {
                table += `<td>Bắt đầu</td>`;
            } else {
                table += "<td></td>";
            }
        });
        table += "</tr>";
        currentTime++;

        for (let i = 1; i <= currentProcess.burstTime; i++) {
            table += `<tr><td>${currentTime}</td>`;
            objectData.forEach(p => {
                if (p === currentProcess) {
                    if (i < currentProcess.burstTime) {
                        table += `<td>${i}</td>`;
                    } else {
                        table += "<td>Kết thúc</td>";
                    }
                } else {
                    table += "<td></td>";
                }
            });
            table += "</tr>";
            currentTime++;
        }
        remainingProcesses = remainingProcesses.filter(p => p !== currentProcess);
    }

    table += "</tbody></table>";
    document.getElementById("scheduleContainer").innerHTML = table;
}
