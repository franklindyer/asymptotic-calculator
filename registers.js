let NUM_REGISTERS = 0;

function newRegister() {
    let registers = document.getElementById("grord-registers");
    let regID = NUM_REGISTERS++;
    let newReg = document.createElement("div");
    newReg.id = `grord-register-${regID}`;
    registers.appendChild(newReg);
}
