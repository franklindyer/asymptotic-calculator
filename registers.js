let NUM_REGISTERS = 0;

class Register {
    static numRegisters = 0;
    static nextFxn = undefined;
    static ans = undefined;
    static regList = [];

    static addRegisterNode(id, isConstant) {
	let registers = document.getElementById("grord-registers");
	if (isConstant) registers = document.getElementById("extension-registers");

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

    static displayMessage(msg) {
	document.getElementById("calc-info").value = msg;
    }

    static computeWith(regID) {
	if (Register.nextFxn == undefined) return;
	Register.nextFxn(Register.regList.at(regID));
    }

    static initButtons() {
	let regBtn = document.getElementById("register-button")
	regBtn.onclick = () => { new Register() };
	regBtn.onmouseover = () => { Register.displayMessage("Add another register.") }

	let moveBtn = document.getElementById("move-button")
	moveBtn.onclick = () => { 
	    Register.displayMessage("Click on a source register whose value you want to copy."); 
	    Register.nextFxn = (reg1) => {
		Register.displayMessage("Click on a target register to copy that value to.")
		Register.nextFxn = (reg2) => {
		    Register.displayMessage("") 
		    reg2.setValue(reg1.value);
		    Register.nextFxn = undefined;
		};
		return undefined;
	    };
	};
	moveBtn.onmouseover = () => { Register.displayMessage("Move one register's value to another register.") };

	let sumsBtn = document.getElementById("sums-button")
	sumsBtn.onclick = () => {
	    Register.displayMessage("Click on the register that you would like to sum."); 
	    Register.nextFxn = (reg) => { 
		Register.displayMessage("")
		Register.ans.setValue(reg.value.sums());
		Register.nextFxn = undefined;
	    }
	};
	sumsBtn.onmouseover = () => { Register.displayMessage("Take partial sums of a growth order.") };

	let deltaBtn = document.getElementById("delta-button")
	deltaBtn.onclick = () => {
	    Register.displayMessage("Click on the register that you would like to difference."); 
	    Register.nextFxn = (reg) => {
		Register.displayMessage("");
		let res = reg.value.delta();
		if (res == undefined) Register.displayMessage("Difference operator can only be used with growth orders greater than 1.");
		else Register.ans.setValue(res);
		Register.nextFxn = undefined;
	    }
	}
	deltaBtn.onmouseover = () => { Register.displayMessage("Find a growth order which sums to a given growth order (if possible).") }

	let recipBtn = document.getElementById("reciprocal-button")
	recipBtn.onclick = () => { 
	    Register.displayMessage("Click on the register that you would like to invert."); 
	    Register.nextFxn = (reg) => {
		Register.displayMessage("");
		Register.ans.setValue(reg.value.reciprocal())
		Register.nextFxn = undefined;
	    }
	};
	recipBtn.onmouseover = () => { Register.displayMessage("Take the reciprocal of a growth order.") }

	let timesBtn = document.getElementById("times-button")
	timesBtn.onclick = () => { 
	    Register.displayMessage("Click on the first growth order you would like to multiply."); 
	    Register.nextFxn = (reg1) => { 
		Register.displayMessage("Click on the second growth order you would like to multiply."); 
		Register.nextFxn = (reg2) => {
		    Register.displayMessage("");
		    Register.ans.setValue(reg1.value.times(reg2.value));
		    Register.nextFxn = undefined;
		};
	    };
	};
	timesBtn.onmouseover = () => { Register.displayMessage("Multiply two growth orders.") }

	let powBtn = document.getElementById("pow-button")
	powBtn.onclick = () => {
	    Register.displayMessage("Enter a number, and click on a growth order that you would like to raise to that power.");
	    Register.nextFxn = (reg) => {
		Register.displayMessage("");
		let pow = RationalExpNumber.fromString(document.getElementById("calc-input").value);
		Register.ans.setValue(reg.value.power(pow));
		Register.nextFxn = undefined;
	    }
	}
	powBtn.onmouseover = () => { Register.displayMessage("Raise a growth order to a constant power.") }

	let expBtn = document.getElementById("exp-button")
	expBtn.onclick = () => {
	    Register.displayMessage("Click on the growth order that you would like to exponentiate.");
	    Register.nextFxn = (reg) => {
		if (ExpGrowthOrder.canExponentiate(reg.value)) {
		    Register.displayMessage("");
		    let expreg = new Register(new ExpGrowthOrder(reg.value), true);
		} else {
		    Register.displayMessage("You can only exponentiate super-constant, sub-linear growth orders that aren't the log of a preexisting order.");
		}
		Register.nextFxn = undefined;
	    };
	};
	expBtn.onmouseover = () => { Register.displayMessage("Extend your repertoire of growth orders by taking an exponential.") }
    }

    constructor(grOrd, isConstant) {
	if (grOrd == undefined) grOrd = new SimpleGrowthOrder([ONE]);
	if (isConstant == undefined) isConstant = false;

	this.id = Register.numRegisters++;
	this.divID = `grord-register-${this.id}`;
	this.view = Register.addRegisterNode(this.id, isConstant);
	this.setValue(grOrd);
	this.isConstant = isConstant;

	Register.regList.push(this);
    }

    getValue() {
	return this.value;
    }

    setValue(grOrd) {
	if (this.isConstant) {
	    Register.displayMessage("Cannot write to a read-only register.");
	    return;
	}
	this.value = grOrd;
	let displayText = grOrd.displayToBox(this.divID);
	document.getElementById(`grord-register-${this.id}`).copyText = displayText;
    }
}

window.onload = () => {
    Register.ans = new Register();
    Register.initButtons();
};
