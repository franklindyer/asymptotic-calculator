let NUM_REGISTERS = 0;

class Register {
    static numRegisters = 0;
    static nextFxn = undefined;
    static ans = undefined;
    static regList = [];

    static addRegister(id) {
	let registers = document.getElementById("grord-registers");
	let divID = `grord-register-${id}`;

	let newReg = document.createElement("div");
	newReg.id = divID;
	newReg.classList.add("grord-register");
	newReg.onclick = () => Register.computeWith(id);

	registers.appendChild(newReg);
	return newReg;
    }

    static computeWith(regID) {
	if (Register.nextFxn == undefined) return;
	let nextAns = Register.nextFxn(Register.regList.at(regID).getValue());
	
	// When an actual growth order is returned, we add it to the "ans" register and clear the next function
	if (nextAns != undefined) {
	    Register.ans.setValue(nextAns);
	    Register.nextFxn = undefined;
	}
    }

    static initButtons() {
	document.getElementById("register-button").onclick = () => { new Register() };
	document.getElementById("sums-button").onclick = () => { Register.nextFxn = (gr) => gr.sums() };
	document.getElementById("reciprocal-button").onclick = () => { Register.nextFxn = (gr) => gr.reciprocal() };
	document.getElementById("times-button").onclick = () => { 
	    Register.nextFxn = (gr1) => { 
		Register.nextFxn = (gr2) => gr1.times(gr2);
		return undefined;
	    };
	};
    }

    constructor(grOrd) {
	if (grOrd == undefined) grOrd = new SimpleGrowthOrder([1]);

	this.id = Register.numRegisters++;
	this.divID = `grord-register-${this.id}`;
	this.view = Register.addRegister(this.id);
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
