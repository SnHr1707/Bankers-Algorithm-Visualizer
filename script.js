
let numProcess = 0;
let numResource = 0;
const R_NAMES = Array.from({ length: 26 }, (_, i) => String.fromCharCode("A".charCodeAt(0) + i));
let initialStateSafe = false;
let visualizationSpeed = 500;


function getIntValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with ID '${id}' not found.`);
        return NaN;
    }
    const value = parseInt(element.value, 10);
    return isNaN(value) || value < 0 ? 0 : value;
}

function disableButtons(ids, disabled) {
    ids.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = disabled;
        } else {
            console.warn(`Button with ID '${id}' not found for disabling/enabling.`);
        }
    });
}

function cleanChilds(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        while (element.lastElementChild) {
            element.removeChild(element.lastElementChild);
        }
    } else {
        console.warn(`Element with ID '${elementId}' not found for cleaning.`);
    }
}

function getDelayFromSpeed(sliderValue) {
    const minDelay = 50;
    const maxDelay = 2000;
    const normalizedSpeed = (sliderValue - 1) / 99;
    return Math.round(maxDelay * Math.pow(minDelay / maxDelay, normalizedSpeed));

}

function updateSpeed() {
    const slider = document.getElementById('speedSlider');
    const display = document.getElementById('speedValue');
    if (slider && display) {
        const sliderValue = parseInt(slider.value, 10);
        visualizationSpeed = getDelayFromSpeed(sliderValue);

        if (sliderValue < 20) display.textContent = 'Very Slow';
        else if (sliderValue < 40) display.textContent = 'Slow';
        else if (sliderValue < 60) display.textContent = 'Medium';
        else if (sliderValue < 80) display.textContent = 'Fast';
        else display.textContent = 'Very Fast';

        console.log(`Speed slider changed: ${sliderValue}, Delay set to: ${visualizationSpeed}ms`);
    }
}


document.addEventListener('DOMContentLoaded', updateSpeed);
async function delay() {
    return new Promise(resolve => setTimeout(resolve, visualizationSpeed));
}


function setVisibility(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        if (visible) {
            element.style.visibility = 'visible';
            element.classList.add('visible');
        } else {

            element.classList.remove('visible');
        }
    } else {
        console.warn(`Element with ID '${elementId}' not found for visibility toggle.`);
    }
}

function createMainTableHeader(resourceCount) {
    const thead = document.createElement('THEAD');
    const tr1 = document.createElement('TR');
    const tr2 = document.createElement('TR');


    const thProcess = document.createElement('TH');
    thProcess.textContent = "Process";
    thProcess.rowSpan = 2;
    tr1.appendChild(thProcess);


    const thAlloc = document.createElement('TH');
    thAlloc.textContent = "Allocation";
    thAlloc.colSpan = resourceCount;
    thAlloc.setAttribute('data-section', 'allocation');
    tr1.appendChild(thAlloc);
    for (let j = 0; j < resourceCount; j++) {
        const th = document.createElement('TH');
        th.textContent = R_NAMES[j] || `R${j}`;
        tr2.appendChild(th);
    }


    const thMax = document.createElement('TH');
    thMax.textContent = "Maximum";
    thMax.colSpan = resourceCount;
    thMax.setAttribute('data-section', 'maximum');
    tr1.appendChild(thMax);
    for (let j = 0; j < resourceCount; j++) {
        const th = document.createElement('TH');
        th.textContent = R_NAMES[j] || `R${j}`;
        tr2.appendChild(th);
    }


    const thNeed = document.createElement('TH');
    thNeed.textContent = "Need";
    thNeed.colSpan = resourceCount;
    thNeed.setAttribute('data-section', 'need');
    tr1.appendChild(thNeed);
    for (let j = 0; j < resourceCount; j++) {
        const th = document.createElement('TH');
        th.textContent = R_NAMES[j] || `R${j}`;
        tr2.appendChild(th);
    }


    thead.appendChild(tr1);
    thead.appendChild(tr2);
    return thead;
}


function createMainTableBody(processCount, resourceCount) {
    const tbody = document.createElement('TBODY');
    for (let i = 1; i <= processCount; i++) {
        const tr = document.createElement('TR');
        tr.setAttribute('data-process-id', `p${i - 1}`);


        const tdProcess = document.createElement('TD');
        tdProcess.textContent = `P${i - 1}`;
        tr.appendChild(tdProcess);


        for (let j = 1; j <= resourceCount; j++) {
            const td = document.createElement('TD');
            td.setAttribute('data-section', 'allocation');
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.id = `a${i}${j}`;
            td.appendChild(input);
            tr.appendChild(td);
        }


        for (let j = 1; j <= resourceCount; j++) {
            const td = document.createElement('TD');
            td.setAttribute('data-section', 'maximum');
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.id = `m${i}${j}`;
            td.appendChild(input);
            tr.appendChild(td);
        }


        for (let j = 1; j <= resourceCount; j++) {
            const td = document.createElement('TD');
            td.setAttribute('data-section', 'need');
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.id = `n${i}${j}`;
            input.disabled = true;
            input.classList.add('need-input');
            td.appendChild(input);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
    return tbody;
}



function createSingleRowTableBody(resourceCount, prefix, isInput = true) {
    const tbody = document.createElement('TBODY');
    const tr = document.createElement('TR');
    for (let j = 1; j <= resourceCount; j++) {
        const td = document.createElement('TD');
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.id = `${prefix}${j}`;
        input.disabled = !isInput;
        td.appendChild(input);
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
    return tbody;
}


function columnTable(ch, tableName, tableId, divId, isInput = true) {
    console.log(`Creating column table: ${tableName} (ID: ${tableId}) in #${divId}`);
    const parentDiv = document.getElementById(divId);
    if (!parentDiv) {
        console.error(`Failed to add side table: Parent container with ID '${divId}' not found.`);
        return false;
    }


    const existingContainer = document.getElementById(tableId + "Container");
    if (existingContainer) {
        console.log(`Removing existing side table: ${tableName}`);
        existingContainer.remove();
    }

    const table = document.createElement('TABLE');
    table.id = tableId;

    const thead = document.createElement('THEAD');
    const trHead = document.createElement('TR');
    for (let j = 0; j < numResource; j++) {
        const th = document.createElement('TH');
        th.textContent = R_NAMES[j] || `R${j}`;
        trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);

    table.appendChild(createSingleRowTableBody(numResource, ch, isInput));


    const container = document.createElement('div');
    container.className = 'table-container';
    container.id = tableId + "Container";

    const titleElement = document.createElement('p');
    titleElement.textContent = tableName;
    container.appendChild(titleElement);
    container.appendChild(table);
    parentDiv.appendChild(container);
    console.log(`Side table '${tableName}' added to DOM inside #${divId}`);
    return true;
}




function createTables() {
    console.log("createTables function started.");

    numProcess = parseInt(document.getElementById("numProcess").value, 10);
    numResource = parseInt(document.getElementById("numResource").value, 10);
    if (isNaN(numProcess) || numProcess <= 0 || isNaN(numResource) || numResource <= 0) {

        alert('Please enter valid numbers for processes and resources (>= 1).');
        return;
    }

    console.log("Clearing previous tables and results.");
    cleanChilds('mainTableContainer');
    cleanChilds('sideTablesContainer');

    setVisibility('resultsArea', false);
    cleanChilds('safetyCheckSteps'); cleanChilds('finalResult');
    if (document.getElementById('finalResult')) document.getElementById('finalResult').className = 'final-result-style';
    setVisibility('resourceRequestSection', false);
    cleanChilds('requestLogSteps'); cleanChilds('requestFinalResult');
    if (document.getElementById('requestFinalResult')) document.getElementById('requestFinalResult').className = 'final-result-style';
    setVisibility('speedControl', false);



    const mainTable = document.createElement('TABLE');
    mainTable.id = 'mainCombinedTable';
    mainTable.appendChild(createMainTableHeader(numResource));
    mainTable.appendChild(createMainTableBody(numProcess, numResource));

    const mainTableDiv = document.getElementById('mainTableContainer');
    if (mainTableDiv) {
        mainTableDiv.appendChild(mainTable);
        console.log("Main combined table created.");
    } else {
        alert("Error: Could not find main table container div.");
        console.error("mainTableContainer div not found.");
        return;
    }


    if (!columnTable('r', 'Total Resources', 'resourceTable', 'sideTablesContainer', true)) {
        alert("Error creating Total Resources table.");
        return;
    }


    disableButtons(["createTables", "reset"], true);
    disableButtons(["findNeed"], false);
    disableButtons(["findAvailable", "safeSequence", "resourceRequest", "checkSafety"], true);
    initialStateSafe = false;


    const reqProcessInput = document.getElementById('requestProcess');
    if (reqProcessInput) {
        reqProcessInput.min = 0;
        reqProcessInput.max = numProcess - 1;
    }
    disableButtons(["reset"], false);
    console.log("createTables function finished.");
}


function isValidInput() {
    console.log("Validating inputs...");
    let totalAllocated = Array(numResource).fill(0);
    let totalResources = Array(numResource).fill(0);


    for (let j = 1; j <= numResource; j++) {
        const resInput = document.getElementById(`r${j}`);
        if (!resInput) { return false; }
        if (resInput.value === '') { return false; }
        totalResources[j - 1] = parseInt(resInput.value, 10);
        if (isNaN(totalResources[j - 1]) || totalResources[j - 1] < 0) { return false; }
    }
    console.log("Total Resources:", totalResources);


    for (let i = 1; i <= numProcess; i++) {
        for (let j = 1; j <= numResource; j++) {
            const allocInput = document.getElementById(`a${i}${j}`);
            const maxInput = document.getElementById(`m${i}${j}`);
            if (!allocInput || !maxInput) { return false; }
            if (allocInput.value === '') { return false; }
            if (maxInput.value === '') { return false; }
            const allocated = parseInt(allocInput.value, 10);
            const max = parseInt(maxInput.value, 10);
            if (isNaN(allocated) || allocated < 0) { return false; }
            if (isNaN(max) || max < 0) { return false; }
            if (allocated > max) {
                alert(`P${i - 1} Allocation (${allocated}) > Maximum (${max}) for Resource ${R_NAMES[j - 1]}.`);
                allocInput.focus();
                return false;
            }
            totalAllocated[j - 1] += allocated;
        }
    }
    console.log("Total Allocated:", totalAllocated);


    for (let j = 0; j < numResource; j++) {
        if (totalAllocated[j] > totalResources[j]) {
            alert(`Total allocated (${totalAllocated[j]}) for ${R_NAMES[j]} exceeds total resources (${totalResources[j]}).`);
            return false;
        }
    }
    console.log("Input validation successful.");
    return true;
}


function findNeed() {
    console.log("findNeed function started.");
    if (!isValidInput()) {
        console.warn("Input validation failed in findNeed.");
        return;
    }

    console.log("Calculating Need matrix and populating main table...");
    for (let i = 1; i <= numProcess; i++) {
        for (let j = 1; j <= numResource; j++) {
            const max = getIntValue(`m${i}${j}`);
            const allocate = getIntValue(`a${i}${j}`);
            const needInput = document.getElementById(`n${i}${j}`);
            if (needInput) {
                needInput.value = max - allocate;

            } else {
                console.error(`Need input n${i}${j} not found in main table.`);
            }

            const allocInput = document.getElementById(`a${i}${j}`);
            const maxInput = document.getElementById(`m${i}${j}`);
            if (allocInput) allocInput.disabled = true;
            if (maxInput) maxInput.disabled = true;
        }
    }


    for (let j = 1; j <= numResource; j++) {
        const resInput = document.getElementById(`r${j}`);
        if (resInput) resInput.disabled = true;
    }
    console.log("Need calculated and inputs disabled.");

    disableButtons(["findNeed"], true);
    disableButtons(["findAvailable"], false);
    console.log("findNeed function finished.");
}


function findAvailable() {
    console.log("findAvailable function started.");


    let availableValues = [];
    console.log("Calculating Available resources...");
    for (let j = 1; j <= numResource; j++) {
        const res = getIntValue(`r${j}`);
        let totalAllocate = 0;
        for (let i = 1; i <= numProcess; i++) {
            totalAllocate += getIntValue(`a${i}${j}`);
        }
        availableValues.push(res - totalAllocate);
    }
    console.log("Available calculated:", availableValues);


    if (!columnTable('av', 'Available', 'availableTable', 'sideTablesContainer', false)) {
        console.error("Failed to create Available table.");
        alert("Error creating the Available table. Check console.");
        return;
    }

    for (let j = 1; j <= numResource; j++) {
        const availInput = document.getElementById(`av${j}`);
        if (availInput) {
            availInput.value = availableValues[j - 1];
            availInput.disabled = true;
        } else {
            console.error(`Available input av${j} not found after creation.`);
        }
    }
    console.log("Available table populated.");

    disableButtons(["findAvailable"], true);
    disableButtons(["safeSequence"], false);
    console.log("findAvailable function finished.");
}



async function safetyAlgorithm(logDivId = 'safetyCheckSteps', resultDivId = 'finalResult') {
    console.log(`Safety algorithm started. Logging to #${logDivId}, Result to #${resultDivId}`);
    setVisibility('speedControl', true);

    const logDiv = document.getElementById(logDivId);
    const finalResultDiv = document.getElementById(resultDivId);
    if (!logDiv || !finalResultDiv) { return { isSafe: false, sequence: [] }; }

    logDiv.innerHTML = '';
    finalResultDiv.innerHTML = 'Checking safety...';
    finalResultDiv.className = 'final-result-style';

    document.querySelectorAll('#mainCombinedTable tbody tr').forEach(row => {
        row.classList.remove('checking', 'allocated', 'skipped');
    });


    let work = [];
    let finish = Array(numProcess).fill(false);
    let sequence = [];


    for (let j = 1; j <= numResource; j++) {
        work.push(getIntValue(`av${j}`));
    }


    let need = Array(numProcess).fill(null).map(() => Array(numResource));
    let allocation = Array(numProcess).fill(null).map(() => Array(numResource));
    for (let i = 0; i < numProcess; i++) {
        for (let j = 0; j < numResource; j++) {
            need[i][j] = getIntValue(`n${i + 1}${j + 1}`);
            allocation[i][j] = getIntValue(`a${i + 1}${j + 1}`);
        }
    }
    console.log("Initial Work for safety check:", work);
    console.log("Initial Need:", need);
    console.log("Initial Allocation:", allocation);



    const pInit = document.createElement('div');
    pInit.className = 'log-step';
    pInit.innerHTML = `<span class="step-label">Initial State:</span>
                       <span class="math-calc">Work = Available = <code>[${work.join(', ')}]</code></span>
                       <span class="math-calc">Finish = <code>[${finish.join(', ')}]</code></span>`;
    logDiv.appendChild(pInit);
    logDiv.scrollTop = logDiv.scrollHeight;
    await delay();

    let count = 0;
    let iteration = 0;
    const MAX_ITERATIONS = numProcess * numProcess + 5;


    while (count < numProcess && iteration < MAX_ITERATIONS) {
        let foundProcessInPass = false;
        iteration++;
        console.log(`--- Safety Check Pass ${iteration} ---`);


        if (numProcess > 1 || iteration > 1) {
            const pPassHeader = document.createElement('h4');
            pPassHeader.className = 'log-iteration-header';
            pPassHeader.textContent = `--- Pass ${iteration} ---`;
            logDiv.appendChild(pPassHeader);
        }


        for (let i = 0; i < numProcess; i++) {
            const processRow = document.querySelector(`#mainCombinedTable tbody tr[data-process-id='p${i}']`);
            if (!processRow) continue;


            if (finish[i]) {





                continue;
            }


            const logEntry = document.createElement('div');
            logEntry.className = 'log-step';

            let logHTML = `<span class="log-iteration-header">For i = ${i} (Process P${i}):</span>`;
            logHTML += `<span class="math-calc">Need${i} = <code>[${need[i].join(', ')}]</code></span>`;
            logHTML += `<span class="math-calc">Work = <code>[${work.join(', ')}]</code></span>`;
            logHTML += `<span class="math-calc">Finish[${i}] is <strong>${finish[i]}</strong></span>`;


            processRow.classList.add('checking');
            logEntry.innerHTML = logHTML + `<span class="math-calc">Checking if Need${i} ≤ Work...</span>`;
            logDiv.appendChild(logEntry);
            logDiv.scrollTop = logDiv.scrollHeight;
            await delay();

            let canAllocate = true;
            let comparisonDetails = '';
            for (let j = 0; j < numResource; j++) {
                comparisonDetails += ` ${need[i][j]} ≤ ${work[j]}${j < numResource - 1 ? ',' : ''}`;
                if (need[i][j] > work[j]) {
                    canAllocate = false;
                    comparisonDetails += ` <strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color') || 'red'};">(✘ False here!)</strong>`;
                    break;
                } else {
                    comparisonDetails += ` (✔)`;
                }
            }


            logHTML += `<span class="math-calc">Compare: Need ≤ Work? (${comparisonDetails} )</span>`;


            if (canAllocate) {

                logEntry.classList.add('success-step');
                logHTML += `<span class="log-result success"><span class="log-symbol success">✔</span> Yes. P${i} can execute.</span>`;


                let newWork = [...work];
                let workCalcStr = [];
                for (let j = 0; j < numResource; j++) {
                    newWork[j] += allocation[i][j];
                    workCalcStr.push(`${work[j]} + ${allocation[i][j]} = ${newWork[j]}`);
                }
                work = newWork;


                finish[i] = true;
                sequence.push(`P${i}`);
                count++;
                foundProcessInPass = true;

                logHTML += `<span class="math-calc">Update: Work = Work + Allocation${i}</span>`;
                logHTML += `<span class="math-calc">  New Work = [${workCalcStr.join('; ')}] = <code>[${work.join(', ')}]</code></span>`;
                logHTML += `<span class="math-calc">  Finish = <code>[${finish.map((f, idx) => idx === i ? `<strong>${f}</strong>` : f).join(', ')}]</code></span>`;

                processRow.classList.remove('checking');
                processRow.classList.add('allocated');
                logEntry.innerHTML = logHTML;
                logDiv.scrollTop = logDiv.scrollHeight;
                await delay();

            } else {

                logEntry.classList.add('fail-step');
                logHTML += `<span class="log-result fail"><span class="log-symbol fail">✘</span> No. Need > Work. P${i} must wait.</span>`;

                processRow.classList.add('skipped');
                logEntry.innerHTML = logHTML;
                logDiv.scrollTop = logDiv.scrollHeight;
                await delay();
                processRow.classList.remove('skipped');
                processRow.classList.remove('checking');
            }
        }


        if (!foundProcessInPass && count < numProcess) {
            console.warn("Unsafe state detected: No process could be allocated in a full pass.");
            const pDeadlock = document.createElement('div');
            pDeadlock.className = 'log-step fail-step';
            pDeadlock.innerHTML = `<strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color') || 'red'};">DEADLOCK DETECTED!</strong> No process could be allocated in Pass ${iteration}. Remaining processes cannot finish.`;
            logDiv.appendChild(pDeadlock);
            logDiv.scrollTop = logDiv.scrollHeight;
            break;
        }









        if (iteration >= MAX_ITERATIONS) {
            console.error("Safety algorithm exceeded MAX_ITERATIONS.");

            return { isSafe: false, sequence: [] };
        }
    }

    console.log(`Safety algorithm finished. Count=${count}, Total Processes=${numProcess}`);
    const isCurrentlyRequestCheck = (logDivId === 'requestLogSteps');
    if (!isCurrentlyRequestCheck) setVisibility('speedControl', false);


    const pFinal = document.createElement('div');
    pFinal.style.marginTop = '20px';
    pFinal.style.borderTop = '2px solid white';
    pFinal.style.paddingTop = '15px';

    if (count === numProcess) {
        console.log("System is SAFE. Sequence:", sequence);
        finalResultDiv.className = 'final-result-style safe';
        finalResultDiv.innerHTML = `System is in a <strong>SAFE STATE</strong>.`;
        pFinal.innerHTML = `<strong class="log-result success"><span class="log-symbol success">✔</span> Final Result: System is SAFE.</strong><br>
                            <span class="math-calc">Safe Sequence: <code>< ${sequence.join(' , ')} ></code></span>
                            <span class="math-calc">Final Finish array: <code>[${finish.join(', ')}]</code></span>`;
        logDiv.appendChild(pFinal);
        return { isSafe: true, sequence: sequence };
    } else {
        console.warn("System is UNSAFE.");
        finalResultDiv.className = 'final-result-style unsafe';
        finalResultDiv.innerHTML = `System is in an <strong>UNSAFE STATE</strong>.`;
        pFinal.innerHTML = `<strong class="log-result fail"><span class="log-symbol fail">✘</span> Final Result: System is UNSAFE.</strong><br>
                            <span class="math-calc">${count} out of ${numProcess} processes could finish.</span>
                            <span class="math-calc">Partial Sequence: <code>< ${sequence.join(' , ')} ></code></span>
                            <span class="math-calc">Final Finish array: <code>[${finish.join(', ')}]</code></span>`;
        logDiv.appendChild(pFinal);
        return { isSafe: false, sequence: sequence };
    }
}




async function generateSafeSeq() {
    console.log("generateSafeSeq function started.");

    if (!document.getElementById('n11') || !document.getElementById('availableTable')) {
        alert("Please calculate Need and Available resources first.");
        return;
    }

    if (!document.getElementById('av1') || document.getElementById('av1').value === '') {
        alert("Available resources not calculated yet.");
        return;
    }

    disableButtons(["safeSequence", "reset"], true);
    setVisibility('resultsArea', true);
    cleanChilds('requestLogSteps'); cleanChilds('requestFinalResult');
    if (document.getElementById('requestFinalResult')) document.getElementById('requestFinalResult').className = 'final-result-style';


    let safetyResult = { isSafe: false, sequence: [] };

    try {

        safetyResult = await safetyAlgorithm('safetyCheckSteps', 'finalResult');
        initialStateSafe = safetyResult.isSafe;
    } catch (error) {
        console.error("Error during initial safety check:", error);
        const finalResultDiv = document.getElementById('finalResult');
        if (finalResultDiv) {
            finalResultDiv.className = 'final-result-style unsafe';
            finalResultDiv.innerHTML = "An error occurred during the safety check. Check console.";
        }
        initialStateSafe = false;
    } finally {
        disableButtons(["reset"], false);
        if (initialStateSafe) {
            disableButtons(['resourceRequest'], false);
            setVisibility('resourceRequestSection', true);
            console.log("Initial state safe. Enabling resource request setup.");
        } else {
            disableButtons(['resourceRequest'], true);
            setVisibility('resourceRequestSection', false);
            console.log("Initial state unsafe. Resource request disabled.");
        }
        setVisibility('speedControl', false);
        console.log("generateSafeSeq function finished.");
    }
}



function reset() {
    console.log("Resetting simulation.");
    cleanChilds('mainTableContainer');
    cleanChilds('sideTablesContainer');


    setVisibility('resultsArea', false);
    cleanChilds('safetyCheckSteps'); cleanChilds('finalResult');
    if (document.getElementById('finalResult')) document.getElementById('finalResult').className = 'final-result-style';
    setVisibility('resourceRequestSection', false);
    cleanChilds('makeResourceRequest'); cleanChilds('requestLogSteps'); cleanChilds('requestFinalResult');
    if (document.getElementById('requestFinalResult')) document.getElementById('requestFinalResult').className = 'final-result-style';
    const reqProcessInput = document.getElementById('requestProcess');
    if (reqProcessInput) reqProcessInput.value = "";
    setVisibility('speedControl', false);
    numProcess = 0; numResource = 0; initialStateSafe = false;
    const processInput = document.getElementById("numProcess");
    const resourceInput = document.getElementById("numResource");
    if (processInput) processInput.value = "";
    if (resourceInput) resourceInput.value = "";

    disableButtons(["createTables", "reset"], false);
    disableButtons(["findNeed", "findAvailable", "safeSequence", "resourceRequest", "checkSafety"], true);

    console.log("Reset complete.");
}





function resourceRequest() {


    if (!initialStateSafe) {
        alert("Cannot setup request: The current system state is not confirmed safe.");
        return;
    }

    console.log("Setting up for a new resource request.");

    setVisibility('resourceRequestSection', true);

    cleanChilds('makeResourceRequest');
    cleanChilds('requestLogSteps');
    cleanChilds('requestFinalResult');
    const reqFinalDiv = document.getElementById('requestFinalResult');
    if (reqFinalDiv) {
        reqFinalDiv.innerHTML = '';
        reqFinalDiv.className = 'final-result-style';
    }


    const reqProcessInput = document.getElementById('requestProcess');
    if (reqProcessInput) {
        reqProcessInput.value = "";
        reqProcessInput.disabled = false;
    }


    if (!columnTable('req', 'Enter Request Vector', 'resourceRequestTable', 'makeResourceRequest', true)) {
        alert("Error creating the request input table. Check console.");
        return;
    }

    for (let j = 1; j <= numResource; j++) {
        const reqInput = document.getElementById(`req${j}`);
        if (reqInput) reqInput.disabled = false;
    }



    disableButtons(['resourceRequest'], true);
    disableButtons(['checkSafety'], false);
    disableButtons(['reset'], true);
    console.log("Request setup complete. Ready for input and check.");
}



async function checkSafeState() {
    console.log("Checking safety of resource request...");

    const reqLogDiv = document.getElementById('requestLogSteps');
    const reqFinalResultDiv = document.getElementById('requestFinalResult');
    if (!reqLogDiv || !reqFinalResultDiv) {
        alert("Error: Log or result area for request check not found.");
        console.error("Required elements for request check missing.");
        disableButtons(["reset", "resourceRequest"], false);
        disableButtons(["checkSafety"], true);
        return;
    }


    const reqProcessInput = document.getElementById('requestProcess');
    const reqProcessIndex = parseInt(reqProcessInput?.value, 10);

    if (reqProcessInput === null || isNaN(reqProcessIndex) || reqProcessIndex < 0 || reqProcessIndex >= numProcess) {
        alert(`Please enter a valid Process number between 0 and ${numProcess - 1}.`);
        reqProcessInput?.focus();
        return;
    }

    let request = [];
    let requestInputValid = true;
    for (let j = 1; j <= numResource; j++) {
        const reqVal = getIntValue(`req${j}`);
        if (document.getElementById(`req${j}`).value === '' || reqVal < 0) {
            alert(`Please enter a valid non-negative request value for resource ${R_NAMES[j - 1] || `R${j - 1}`}.`);
            document.getElementById(`req${j}`).focus();
            requestInputValid = false;
            break;
        }
        request.push(reqVal);
    }

    if (!requestInputValid) {
        return;
    }

    console.log(`Request from P${reqProcessIndex}: [${request.join(', ')}]`);


    cleanChilds('requestLogSteps');
    reqLogDiv.innerHTML = `<h3>--- Resource Request Check for P${reqProcessIndex} ---</h3>`;
    reqFinalResultDiv.innerHTML = 'Evaluating request...';
    reqFinalResultDiv.className = 'final-result-style';
    disableButtons(["checkSafety", "resourceRequest", "reset"], true);
    setVisibility('speedControl', true);


    const reqProcessNumForIds = reqProcessIndex + 1;


    console.log("Step 1: Request <= Need?");
    const currentNeed = [];
    let needCheckPassed = true;
    let needComparisonLog = [];

    const step1Log = document.createElement('div');
    step1Log.className = 'log-step';
    step1Log.innerHTML = `<span class="step-label">Step 1: Check Request ≤ Need</span>`;
    reqLogDiv.appendChild(step1Log);

    await delay();

    for (let j = 0; j < numResource; j++) {
        const needVal = getIntValue(`n${reqProcessNumForIds}${j + 1}`);
        currentNeed.push(needVal);
        needComparisonLog.push(`${request[j]} ≤ ${needVal}`);
        if (request[j] > needVal) {
            needCheckPassed = false;
            needComparisonLog[j] += ` <strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color') || 'red'};">(✘ False!)</strong>`;
            break;
        } else {
            needComparisonLog[j] += ` (✔)`;
        }
    }

    step1Log.innerHTML += `<span class="math-calc">Request = <code>[${request.join(', ')}]</code></span>
                           <span class="math-calc">Need${reqProcessIndex} = <code>[${currentNeed.join(', ')}]</code></span>
                           <span class="math-calc">Compare: (${needComparisonLog.join(', ')})</span>`;

    if (!needCheckPassed) {
        console.warn(`Request rejected: Exceeds need for P${reqProcessIndex}.`);
        step1Log.classList.add('fail-step');
        step1Log.innerHTML += `<span class="log-result fail"><span class="log-symbol fail">✘</span> Condition Failed.</span>`;
        reqFinalResultDiv.innerHTML = `Request <strong>DENIED</strong>.<br>Reason: Request exceeds process P${reqProcessIndex}'s maximum need.`;
        reqFinalResultDiv.className = 'final-result-style unsafe';
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        disableButtons(["reset", "resourceRequest"], false);
        disableButtons(["checkSafety"], true);
        setVisibility('speedControl', false);
        return;
    } else {
        step1Log.classList.add('success-step');
        step1Log.innerHTML += `<span class="log-result success"><span class="log-symbol success">✔</span> Condition Satisfied.</span>`;
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        console.log("Step 1 passed.");
    }
    await delay();


    console.log("Step 2: Request <= Available?");
    const currentAvailable = [];
    let availableCheckPassed = true;
    let availComparisonLog = [];

    const step2Log = document.createElement('div');
    step2Log.className = 'log-step';
    step2Log.innerHTML = `<span class="step-label">Step 2: Check Request ≤ Available</span>`;
    reqLogDiv.appendChild(step2Log);

    await delay();

    for (let j = 0; j < numResource; j++) {
        const availVal = getIntValue(`av${j + 1}`);
        currentAvailable.push(availVal);
        availComparisonLog.push(`${request[j]} ≤ ${availVal}`);
        if (request[j] > availVal) {
            availableCheckPassed = false;
            availComparisonLog[j] += ` <strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--warning-color') || 'orange'};">(✘ False!)</strong>`;
            break;
        } else {
            availComparisonLog[j] += ` (✔)`;
        }
    }

    step2Log.innerHTML += `<span class="math-calc">Request = <code>[${request.join(', ')}]</code></span>
                           <span class="math-calc">Available = <code>[${currentAvailable.join(', ')}]</code></span>
                           <span class="math-calc">Compare: (${availComparisonLog.join(', ')})</span>`;

    if (!availableCheckPassed) {
        console.warn(`Request must wait: Resources not available for P${reqProcessIndex}.`);
        step2Log.classList.add('fail-step');
        step2Log.innerHTML += `<span class="log-result fail" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--warning-color') || 'orange'};"><span class="log-symbol fail">✘</span> Condition Failed.</span>`;
        reqFinalResultDiv.innerHTML = `Request for P${reqProcessIndex} must <strong>WAIT</strong>.<br>Reason: Resources currently unavailable.`;
        reqFinalResultDiv.className = 'final-result-style wait';
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        disableButtons(["reset", "resourceRequest"], false);
        disableButtons(["checkSafety"], true);
        setVisibility('speedControl', false);
        return;
    } else {
        step2Log.classList.add('success-step');
        step2Log.innerHTML += `<span class="log-result success"><span class="log-symbol success">✔</span> Condition Satisfied.</span>`;
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        console.log("Step 2 passed.");
    }
    await delay();


    console.log("Step 3: Simulating allocation for safety check...");
    const step3Log = document.createElement('div');
    step3Log.className = 'log-step info-step';
    step3Log.innerHTML = `<span class="step-label">Step 3: Simulate Allocation (Temporarily)</span>
                          <span class="math-calc">Pretend to grant request to P${reqProcessIndex}...</span>`;
    reqLogDiv.appendChild(step3Log);
    reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
    await delay();


    let originalDisplayAvailable = Array.from({ length: numResource }, (_, j) => document.getElementById(`av${j + 1}`).value);
    let originalDisplayAllocation = Array.from({ length: numResource }, (_, j) => document.getElementById(`a${reqProcessNumForIds}${j + 1}`).value);
    let originalDisplayNeed = Array.from({ length: numResource }, (_, j) => document.getElementById(`n${reqProcessNumForIds}${j + 1}`).value);

    let simLog = '';

    try {

        for (let j = 1; j <= numResource; j++) {
            const availElem = document.getElementById(`av${j}`);
            const allocElem = document.getElementById(`a${reqProcessNumForIds}${j}`);
            const needElem = document.getElementById(`n${reqProcessNumForIds}${j}`);

            let currentAv = parseInt(availElem.value, 10);
            let currentAl = parseInt(allocElem.value, 10);
            let currentNd = parseInt(needElem.value, 10);
            let reqVal = request[j - 1];

            let newAv = currentAv - reqVal;
            let newAl = currentAl + reqVal;
            let newNd = currentNd - reqVal;


            availElem.value = newAv;
            allocElem.value = newAl;
            needElem.value = newNd;


            simLog += `<span class="math-calc">R${j - 1}: Avail=${currentAv}-${reqVal}=${newAv}; Alloc=${currentAl}+${reqVal}=${newAl}; Need=${currentNd}-${reqVal}=${newNd}</span>`;





        }
        step3Log.innerHTML += simLog;
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        console.log("Hypothetical state updated in UI for safety check.");
        await delay();





        console.log("Step 4: Running safety algorithm on simulated state...");
        const step4Log = document.createElement('div');
        step4Log.className = 'log-step info-step';
        step4Log.innerHTML = `<span class="step-label">Step 4: Check Safety of Simulated State</span>
                              <span class="math-calc">Using the updated Available, Allocation${reqProcessIndex}, Need${reqProcessIndex} values...</span>`;
        reqLogDiv.appendChild(step4Log);
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        await delay();



        const safetyResult = await safetyAlgorithm('requestLogSteps', 'requestFinalResult');


        const step5Log = document.createElement('div');
        step5Log.className = 'log-step';
        step5Log.innerHTML = `<span class="step-label">Step 5: Decision</span>`;
        reqLogDiv.appendChild(step5Log);

        if (safetyResult.isSafe) {
            console.log("Simulated state is SAFE. Request can be granted.");
            step5Log.classList.add('success-step');
            step5Log.innerHTML += `<span class="log-result success"><span class="log-symbol success">✔</span> Simulated state is SAFE.</span>
                                   <span class="math-calc"><strong>Request GRANTED.</strong> Changes are now permanent.</span>`;


            reqFinalResultDiv.innerHTML = `Simulated state check: <strong>SAFE</strong>.<br>Safe sequence found: <code>< ${safetyResult.sequence.join(' , ')} ></code><br><strong>=> Request GRANTED.</strong>`;
            reqFinalResultDiv.className = 'final-result-style safe';



            for (let j = 1; j <= numResource; j++) {
                const reqInput = document.getElementById(`req${j}`);
                if (reqInput) reqInput.disabled = true;
            }
            if (reqProcessInput) reqProcessInput.disabled = true;


            disableButtons(["reset", "resourceRequest"], false);
            disableButtons(["checkSafety"], true);

        } else {
            console.warn("Simulated state is UNSAFE. Request cannot be granted. Reverting.");
            step5Log.classList.add('fail-step');
            step5Log.innerHTML += `<span class="log-result fail"><span class="log-symbol fail">✘</span> Simulated state is UNSAFE.</span>
                                    <span class="math-calc"><strong>Request DENIED.</strong> Reverting state...</span>`;


            reqFinalResultDiv.innerHTML = `Simulated state check: <strong>UNSAFE</strong>.<br>Granting the request would lead to a deadlock.<br><strong>=> Request DENIED.</strong>`;
            reqFinalResultDiv.className = 'final-result-style unsafe';



            let revertLog = '<span class="math-calc">Reverted State:</span>';
            for (let j = 1; j <= numResource; j++) {
                document.getElementById(`av${j}`).value = originalDisplayAvailable[j - 1];
                document.getElementById(`a${reqProcessNumForIds}${j}`).value = originalDisplayAllocation[j - 1];
                document.getElementById(`n${reqProcessNumForIds}${j}`).value = originalDisplayNeed[j - 1];
                revertLog += `<span class="math-calc">R${j - 1}: Avail=${originalDisplayAvailable[j - 1]}; Alloc=${originalDisplayAllocation[j - 1]}; Need=${originalDisplayNeed[j - 1]}</span>`;
            }
            step5Log.innerHTML += revertLog;
            console.log("Display reverted to state before request simulation.");



            disableButtons(["reset", "resourceRequest"], false);
            disableButtons(["checkSafety"], true);
        }

    } catch (error) {
        console.error("Error during request safety check/simulation:", error);
        reqFinalResultDiv.innerHTML = "An error occurred during the safety check simulation. Check console. State may be inconsistent.";
        reqFinalResultDiv.className = 'final-result-style unsafe';


        try {
            console.log("Attempting to revert UI due to error...");
            for (let j = 1; j <= numResource; j++) {
                document.getElementById(`av${j}`).value = originalDisplayAvailable[j - 1];
                document.getElementById(`a${reqProcessNumForIds}${j}`).value = originalDisplayAllocation[j - 1];
                document.getElementById(`n${reqProcessNumForIds}${j}`).value = originalDisplayNeed[j - 1];
            }
            console.log("UI reverted.");
            const errorRevertLog = document.createElement('div');
            errorRevertLog.className = 'log-step fail-step';
            errorRevertLog.innerHTML = `<strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color') || 'red'};">ERROR DURING CHECK!</strong> State reverted as a precaution.`;
            reqLogDiv.appendChild(errorRevertLog);

        } catch (revertError) {
            console.error("Error attempting to revert UI after main error:", revertError);
            const doubleErrorLog = document.createElement('div');
            doubleErrorLog.className = 'log-step fail-step';
            doubleErrorLog.innerHTML = `<strong style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--error-color') || 'red'};">CRITICAL ERROR!</strong> Failed to revert UI after simulation error. State is inconsistent. Recommend Reset.`;
            reqLogDiv.appendChild(doubleErrorLog);
        }

        disableButtons(["reset"], false);
        disableButtons(["resourceRequest", "checkSafety"], true);

    } finally {
        reqLogDiv.scrollTop = reqLogDiv.scrollHeight;
        setVisibility('speedControl', false);
        console.log("checkSafeState function finished.");
    }
}


