let NUM_REGISTERS = 0;

class Register {
    static numRegisters = 0;
    static nextFxn = undefined;
    static ans = undefined;
    static regList = [];

    static addRegisterNode(id) {
	let registers = document.getElementById("grord-registers");

	let newReg = document.createElement("div");
	newReg.id = `grord-register-${id}`;
	newReg.classList.add("grord-register");
	newReg.onclick = () => Register.computeWith(id);
	newReg.appendChild(document.createElement("p"));

	let clipboardButton = document.createElement("button");
	clipboardButton.id = `copy-register-${id}`;
	clipboardButton.classList.add("copy-register");
	clipboardButton.copyText = undefined;
	clipboardButton.innerText = "📋";
	clipboardButton.onclick = () => { 
	    navigator.clipboard.writeText(newReg.copyText) 
	};
	newReg.appendChild(clipboardButton);

	registers.appendChild(newReg);
	return newReg;
    }

    static computeWith(regID) {
	if (Register.nextFxn == undefined) return;
	Register.nextFxn(Register.regList.at(regID));
    }

    static initButtons() {
	document.getElementById("register-button").onclick = () => { new Register() };
	document.getElementById("move-button").onclick = () => { 
	    Register.nextFxn = (reg1) => {
		Register.nextFxn = (reg2) => { 
		    reg2.setValue(reg1.value);
		    Register.nextFxn = undefined;
		};
		return undefined;
	    } 
	};
	document.getElementById("sums-button").onclick = () => { 
	    Register.nextFxn = (reg) => { 
		Register.ans.setValue(reg.value.sums());
		Register.nextFxn = undefined;
	    }
	};
	document.getElementById("reciprocal-button").onclick = () => { 
	    Register.nextFxn = (reg) => {
		Register.ans.setValue(reg.value.reciprocal())
		Register.nextFxn = undefined;
	    }
	};
	document.getElementById("times-button").onclick = () => { 
	    Register.nextFxn = (reg1) => { 
		Register.nextFxn = (reg2) => {
		    Register.ans.setValue(reg1.value.times(reg2.value));
		    Register.nextFxn = undefined;
		};
	    };
	};
    }

    constructor(grOrd) {
	if (grOrd == undefined) grOrd = new SimpleGrowthOrder([1]);

	this.id = Register.numRegisters++;
	this.divID = `grord-register-${this.id}`;
	this.view = Register.addRegisterNode(this.id);
	this.setValue(grOrd);

	Register.regList.push(this);
    }

    getValue() {
	return this.value;
    }

    setValue(grOrd) {
	this.value = grOrd;
	let displayText = grOrd.displayToBox(this.divID);
	document.getElementById(`grord-register-${this.id}`).copyText = displayText;
    }
}

window.onload = () => {
    Register.ans = new Register();
    Register.initButtons();
};
