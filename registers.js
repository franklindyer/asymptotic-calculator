let NUM_REGISTERS = 0;

class Register {
    static numRegisters = 0;
    static nextFxn = undefined;
    static ans = undefined;
    static regList = [];

    static addRegister(divID) {
	let registers = document.getElementById("grord-registers");

	let newReg = document.createElement("div");
	newReg.id = divID;
	newReg.classList.add("grord-register");
	newReg.onclick = () => { Register.computeWith(divID); }

	registers.appendChild(newReg);
	return newReg;
    }

    static computeWith(regID) {
	if (Register.nextFxn == undefined) return;
	Register.ans.setValue(Register.nextFxn(Register.regList.at(regID).getValue()));
	Register.nextFxn = undefined;
    }

    static initButtons() {
	document.getElementById("sums-button").onclick = () => { Register.nextFxn = (gr) => gr.sums() };
	document.getElementById("reciprocal-button").onclick = () => { Register.nextFxn = (gr) => gr.reciprocal() };
    }

    constructor(grOrd) {
	if (grOrd == undefined) grOrd = new SimpleGrowthOrder([1]);

	this.id = Register.numRegisters++;
	this.divID = `grord-register-${this.id}`;
	this.view = Register.addRegister(this.divID);
	this.setValue(grOrd);

	Register.regList.push(this);
    }

    getValue() {
	return this.value;
    }

    setValue(grOrd) {
	this.value = grOrd;
	grOrd.displayToBox(this.divID);
    }
}

window.onload = () => {
    Register.ans = new Register();
    Register.initButtons();
};
