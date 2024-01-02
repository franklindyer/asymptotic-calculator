let NUM_REGISTERS = 0;

class Register {
    static numRegisters = 0;

    static addRegister(divID) {
	let registers = document.getElementById("grord-registers");
	let newReg = document.createElement("div");
	newReg.id = divID;
	registers.appendChild(newReg);
	return newReg;
    }

    constructor(grOrd) {
	if (grOrd == undefined) grOrd = new SimpleGrowthOrder([1]);

	this.id = Register.numRegisters++;
	this.divID = `grord-register-${this.id}`;
	this.view = Register.addRegister(this.divID);

	this.setValue(grOrd);
    }

    getValue() {
	return this.value;
    }

    setValue(grOrd) {
	this.value = grOrd;
	grOrd.displayToBox(this.divID);
    }
}
