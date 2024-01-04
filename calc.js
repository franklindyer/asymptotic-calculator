console.log("hello world!")

// Lexicographic comparison of arrays by their elements.
Object.defineProperty(Array.prototype, 'lexLeq', {
    value: function(arr) {
        let arr1 = this.slice();
	let arr2 = arr.slice();
	while (true) {
	    if (arr1.length == 0 && arr2.length == 0) return true;
	    if (arr1.length == 0) arr1 = [0];
	    if (arr2.length == 0) arr2 = [0];
	    if (arr1[0] < arr2[0]) return true;
	    if (arr1[0] > arr2[0]) return false;
	    arr1.shift();
	    arr2.shift();
	}
    }
});

class GenericGrowthOrder {
    constructor() { };

    // For pretty printing.
    display() { console.log("Pretty printing not implemented for generic growth order") };
    displayToBox(id) {
	let texString = `\$\$${this.display()}\$\$`;
	document.getElementById(id).getElementsByTagName("p")[0].innerText = texString;
	MathJax.typeset();
	return texString;
    }

    // Inequality/comparison
    // Comparison should always be deferred to the growth order of higher rank.
    leq(grOrd) { console.log("Comparison not implemented for generic growth order") };
    geq(grOrd) { console.log("Comparison not implemented for generic growth order") };
    eq(grOrd) { return this.leq(grOrd) && this.geq(grOrd) };
    abs() {
        if (this.geq(new SimpleGrowthOrder([]))) return this;
        else return this.reciprocal();
    }

    // Reciprocals
    reciprocal() { console.log("Reciprocals not implemented for generic growth order") };

    // Multiplication
    times(grOrd) { console.log("Multiplication not implemented for generic growth order") };

    // Partial sums, and partial inverse of partial sums
    sums(grOrd) { console.log("Partial sums not implemented for generic growth order") };
    delta(grOrd) { console.log("Difference operator not implemented for generic growth order") };
}

// Represents products of powers of nested logarithm growth orders.
class SimpleGrowthOrder extends GenericGrowthOrder{
    constructor(logPowers) {
	super();
	this.rank = 0;
	this.logPowers = logPowers;
    }

    display() {
	if (this.logPowers.every((x) => x === 0)) return "1";
	if (!this.logPowers.every((x) => x >= 0)) {
	    let numerator = new SimpleGrowthOrder(this.logPowers.map((x) => (x > 0) ? x : 0));
	    let denominator = new SimpleGrowthOrder(this.logPowers.map((x) => (x < 0) ? -x : 0));
	    return `\\frac{${numerator.display()}}{${denominator.display()}}`;
	}
	let cumlog = "\\log n";
	let str = "";
	if (this.logPowers.at(0) == 1) str = `n`;
	else if (this.logPowers.at(0) != 0) str = `n^{${String(this.logPowers[0])}}`;
	for (let i = 1; i < this.logPowers.length; i++) {
	    let pow = this.logPowers.at(i);
	    if (pow != 0) {
		let nextTerm;
		if (pow == 1) nextTerm = `${cumlog}`;
		else nextTerm = `(${cumlog})^{${this.logPowers.at(i)}}`;
		if (str.length == 0) str = nextTerm;
		else str = str.concat(String.raw` \cdot ${nextTerm}`);
	    }
	    cumlog = "\\log ".concat(cumlog)
	}
	return str;
    }

    leq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.geq(this);
	return this.logPowers.lexLeq(grOrd.logPowers);	
    }

    geq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.leq(this);
	return grOrd.logPowers.lexLeq(this.logPowers);
    }

    reciprocal() {
	return new SimpleGrowthOrder(this.logPowers.map((x) => -x));
    }

    times(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.times(this);
	if (grOrd.logPowers.length > this.logPowers.length) return grOrd.times(this);
	return new SimpleGrowthOrder(this.logPowers.map(function(p1, i) {
	    if (i >= grOrd.logPowers.length) return p1;
	    let p2 = grOrd.logPowers[i];
	    return (p1 + p2);
	}));
    }

    sums() {
	let i = 0;
	while(this.logPowers.length > i && this.logPowers[i] == -1) { i++; }
	let newLogPowers = Array(i).fill(0).concat(this.logPowers.slice(i));
	if (i == this.logPowers.length) newLogPowers.push(0);
	if (newLogPowers[i] > -1) {
	    newLogPowers[i]++;
	} else if (newLogPowers[i] < -1) {
	    newLogPowers = [];
	}
	return new SimpleGrowthOrder(newLogPowers);
    }

    delta() {
	// Cannot apply difference operator to a constant or sub-constant growth order
	if (this.leq(new SimpleGrowthOrder([]))) return undefined;

	let i = 0;
	while(this.logPowers[i] == 0) { i++; }
	let newLogPowers = Array(i).fill(-1).concat(this.logPowers.slice(i));
	newLogPowers[i]--;
	return new SimpleGrowthOrder(newLogPowers);
    }

    log() {
	let i = 0;
	while(this.logPowers.length > i && this.logPowers[i] == 0) { i++; }
	if (i == this.logPowers.length) return new SimpleGrowthOrder([]);
	else return new SimpleGrowthOrder(Array(i+1).fill(0).concat([Math.sign(this.logPowers[i])]));
    }
}

class ExpGrowthOrder extends GenericGrowthOrder {
    static height = 0;
    static extStack = [];

    // An ExpGrowthOrder can be instantiated in one of two ways:
    // 1. Pass a single argument to instantiate exp(g) for a given growth order g
    // 2. Pass a pair of lists to instantiate from a list of nested-log powers and exponential factor powers
    constructor(arg1, arg2) {
	super();
	if (arg2 == undefined) {
	    // Instantiating exponential growth order from another growth order
	    ExpGrowthOrder.height++;
	    ExpGrowthOrder.extStack.push(arg1);

	    this.rank = ExpGrowthOrder.height;
	    this.expPowers = Array(this.rank).fill(0);
	    this.expPowers[this.rank-1] = 1;
	    this.simpleTerm = new SimpleGrowthOrder([]);
	} else {
	    // Instantiating exponential growth order from a list of powers
	    this.rank = arg2.length;
	    this.expPowers = arg2;
	    this.simpleTerm = new SimpleGrowthOrder(arg1);
	}
    }

    display() {
	let factors = [];
	if (!this.simpleTerm.eq(new SimpleGrowthOrder([]))) 
	    factors.push(this.simpleTerm.display());
	let i = 0;
	for (i = 0; i < this.rank; i++) {
	    let pow = this.expPowers.at(i);
	    if (pow == 1)
		factors.push(`\\exp\\Big(${ExpGrowthOrder.extStack.at(i).display()}\\Big)`);
	    else if (pow != 0)
		factors.push(`\\exp\\Big(${ExpGrowthOrder.extStack.at(i).display()}\\Big)^{${pow}}`);
	}
	return factors.join(" \\cdot ");
    }

    leq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.geq(this);
	let grOrdCast = this.upcast(grOrd);
	let quotient = this.times(grOrdCast.reciprocal());
	return quotient.log().leq(new SimpleGrowthOrder([]));	
    }

    geq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.leq(this);
	let grOrdCast = this.upcast(grOrd);
	let quotient = this.times(grOrdCast.reciprocal());
	return quotient.log().geq(new SimpleGrowthOrder([]));
    }

    reciprocal() {
	return new ExpGrowthOrder(this.simpleTerm.reciprocal().logPowers, this.expPowers.map((x) => -x));
    }

    times(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.times(this);
	let grOrdCast = this.upcast(grOrd);
	let simpleTerm = grOrdCast.simpleTerm.times(this.simpleTerm);
	let expPowers = grOrdCast.expPowers.map((e, i) => e + this.expPowers[i]);
	return new ExpGrowthOrder(simpleTerm.logPowers, expPowers);
    }

    sums() {
	let finalPower = this.expPowers.at(-1);
	let sumFactor = ExpGrowthOrder.extStack.at(this.rank-1).delta();
	let lowerFactor;
	if (this.rank == 1) lowerFactor = this.simpleTerm;
	else lowerFactor = new ExpGrowthOrder(this.simpleTerm.logPowers, this.expPowers.slice(0,-1));
	let otherFactor = lowerFactor.times(sumFactor.reciprocal());
	let absOtherFactor = otherFactor.abs();

	if (finalPower == 0)
	    return lowerFactor.sums();
	if (absOtherFactor.eq(new SimpleGrowthOrder([])))
	    return new ExpGrowthOrder([], Array(this.rank-1).fill(0).concat([finalPower]));
	
	let sumRatio = absOtherFactor.delta().times(otherFactor.reciprocal());

	if (sumRatio.leq(sumFactor)) {
	    if (finalPower > 0) return this.times(sumFactor.reciprocal());
	    else return new SimpleGrowthOrder([]);
	} else if (otherFactor.geq(new SimpleGrowthOrder([]))) {
	    return lowerFactor.sums().times(new ExpGrowthOrder([], Array(this.rank-1).fill(0).concat([finalPower])));
	} else {
	    return new SimpleGrowthOrder([]); 
	}
    }

    delta() {
	// Cannot apply difference operator to a constant or sub-constant growth order
        if (this.leq(new SimpleGrowthOrder([]))) return undefined;

	return this.times(this.log().delta());
    }

    log() {
	let prefixLog;
	if (this.rank == 1) prefixLog = this.simpleTerm.log();
	else prefixLog = new ExpGrowthOrder(this.simpleTerm.logPowers, this.expPowers.slice(0,-1)).log();
	
	let suffixLog;
	if (this.expPowers.at(-1) == 0) suffixLog = new SimpleGrowthOrder([]);
	else if (this.expPowers.at(-1) > 0) suffixLog = ExpGrowthOrder.extStack.at(this.rank-1);
	else suffixLog = ExpGrowthOrder.extStack.at(this.rank-1).reciprocal();
	
	if (prefixLog.abs().leq(suffixLog.abs())) return suffixLog;
	else return prefixLog;
    }

    upcast(grOrd) {
	if (grOrd instanceof SimpleGrowthOrder) return new ExpGrowthOrder(grOrd.logPowers, Array(this.rank).fill(0));
	else return new ExpGrowthOrder(grOrd.simpleTerm.logPowers, grOrd.expPowers.concat(Array(this.rank-grOrd.rank).fill(0)));
    }
}
