console.log("hello world!")

// Lexicographic comparison of arrays by their elements.
Object.defineProperty(Array.prototype, 'lexLeq', {
    value: function(arr) {
        let arr1 = this.slice();
	let arr2 = arr.slice();
	while (true) {
	    if (arr1.length == 0 && arr2.length == 0) return true;
	    if (arr1.length == 0) arr1 = [ZERO];
	    if (arr2.length == 0) arr2 = [ZERO];
	    if (arr1[0].lt(arr2[0])) return true;
	    if (arr1[0].gt(arr2[0])) return false;
	    arr1.shift();
	    arr2.shift();
	}
    }
});

// Interface for numbers that can appear in exponents
class AbstractExpNumber {
    add(num) {}
    neg() {}
    sgn() {}
    geq(num) {}
    leq(num) {}
    gt(num) {}
    lt(num) {}
    eq(x) {}
    toString() {}
    toTex() {}	// I need my numbers to be renderable using MathJax
}

// Merely a wrapper for built-in JS floating-point numbers
class FloatExpNumber {
    constructor(x) {
	this.value = x;
    }

    add(num)	{ return new FloatExpNumber(this.value + num.value) }
    neg()	{ return new FloatExpNumber(-this.value) }
    sgn()	{ return new FloatExpNumber(Math.sign(this.value)) }
    geq(num)	{ return this.value >= num.value }
    leq(num)	{ return this.value <= num.value }
    gt(num)	{ return this.value > num.value }
    lt(num)	{ return this.value < num.value }
    eq(num)	{ return this.value == num.value }
    toString()	{ return String(this.value) }
    toTex()	{ return String(this.value) }
}

const ZERO = new FloatExpNumber(0);
const ONE = new FloatExpNumber(1);
const NEGONE = ONE.neg();

class GenericGrowthOrder {
    constructor() { };

    // For pretty printing
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
	if (this.logPowers.every((x) => x.eq(ZERO))) return "1";
	if (!this.logPowers.every((x) => x.geq(ZERO))) {
	    let numerator = new SimpleGrowthOrder(this.logPowers.map((x) => x.geq(ZERO) ? x : ZERO));
	    let denominator = new SimpleGrowthOrder(this.logPowers.map((x) => x.leq(ZERO) ? x.neg() : ZERO));
	    return `\\frac{${numerator.display()}}{${denominator.display()}}`;
	}
	let cumlog = "\\log n";
	let str = "";
	if (this.logPowers.at(0).eq(ONE)) str = `n`;
	else if (!this.logPowers.at(0).eq(ZERO)) str = `n^{${this.logPowers.at(0).toTex()}}`;
	for (let i = 1; i < this.logPowers.length; i++) {
	    let pow = this.logPowers.at(i);
	    if (!pow.eq(ZERO)) {
		let nextTerm;
		if (pow.eq(ONE)) nextTerm = `${cumlog}`;
		else nextTerm = `(${cumlog})^{${this.logPowers.at(i).toTex()}}`;
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
	return new SimpleGrowthOrder(this.logPowers.map((x) => x.neg()));
    }

    times(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.times(this);
	if (grOrd.logPowers.length > this.logPowers.length) return grOrd.times(this);
	return new SimpleGrowthOrder(this.logPowers.map(function(p1, i) {
	    if (i >= grOrd.logPowers.length) return p1;
	    let p2 = grOrd.logPowers.at(i);
	    return p1.add(p2);
	}));
    }

    sums() {
	let i = 0;
	while(this.logPowers.length > i && this.logPowers.at(i).eq(NEGONE)) { i++; }
	let newLogPowers = Array(i).fill(ZERO).concat(this.logPowers.slice(i));
	if (i == this.logPowers.length) newLogPowers.push(ZERO);
	if (newLogPowers.at(i).gt(NEGONE)) {
	    newLogPowers[i] = newLogPowers.at(i).add(ONE);
	} else if (newLogPowers.at(i).lt(NEGONE)) {
	    newLogPowers = [];
	}
	return new SimpleGrowthOrder(newLogPowers);
    }

    delta() {
	// Cannot apply difference operator to a constant or sub-constant growth order
	if (this.leq(new SimpleGrowthOrder([]))) return undefined;

	let i = 0;
	while(this.logPowers.at(i).eq(ZERO)) { i++; }
	let newLogPowers = Array(i).fill(NEGONE).concat(this.logPowers.slice(i));
	newLogPowers[i] = newLogPowers.at(i).add(NEGONE);
	return new SimpleGrowthOrder(newLogPowers);
    }

    log() {
	let i = 0;
	while(this.logPowers.length > i && this.logPowers.at(i).eq(ZERO)) { i++; }
	if (i == this.logPowers.length) return new SimpleGrowthOrder([]);
	else return new SimpleGrowthOrder(Array(i+1).fill(ZERO).concat([this.logPowers.at(i).sgn()]));
    }
}

class ExpGrowthOrder extends GenericGrowthOrder {
    static height = 0;
    static extStack = [];

    static canExponentiate(grOrd) {
	if (grOrd.geq(new SimpleGrowthOrder([ONE]))) return false;
	if (grOrd.leq(new SimpleGrowthOrder([]))) return false;
	if (grOrd.rank == 0) {
	    let logPows = grOrd.logPowers;
	    let notOnePows = logPows.filter((x) => !x.eq(ONE));
	    if (notOnePows.length == logPows.length-1 && notOnePows.filter((x) => x.eq(ZERO)).length == notOnePows.length) return false;
	}
	let i;
	for (i = 0; i < ExpGrowthOrder.height; i++) {
	    if (grOrd.eq(ExpGrowthOrder.extStack.at(i))) return false;
	}
	return true;
    }

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
	    this.expPowers = Array(this.rank).fill(ZERO);
	    this.expPowers[this.rank-1] = ONE;
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
	    if (pow.eq(ONE))
		factors.push(`\\exp\\Big(${ExpGrowthOrder.extStack.at(i).display()}\\Big)`);
	    else if (!pow.eq(ZERO))
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
	return new ExpGrowthOrder(this.simpleTerm.reciprocal().logPowers, this.expPowers.map((x) => x.neg()));
    }

    times(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.times(this);
	let grOrdCast = this.upcast(grOrd);
	let simpleTerm = grOrdCast.simpleTerm.times(this.simpleTerm);
	let expPowers = grOrdCast.expPowers.map((e, i) => e.add(this.expPowers.at(i)));
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

	if (finalPower.eq(ZERO))
	    return lowerFactor.sums();
	if (absOtherFactor.eq(new SimpleGrowthOrder([])))
	    return new ExpGrowthOrder([], Array(this.rank-1).fill(ZERO).concat([finalPower]));
	
	let sumRatio = absOtherFactor.delta().times(otherFactor.reciprocal());

	if (sumRatio.leq(sumFactor)) {
	    if (finalPower.gt(ZERO)) return this.times(sumFactor.reciprocal());
	    else return new SimpleGrowthOrder([]);
	} else if (otherFactor.geq(new SimpleGrowthOrder([]))) {
	    return lowerFactor.sums().times(new ExpGrowthOrder([], Array(this.rank-1).fill(ZERO).concat([finalPower])));
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
	if (this.expPowers.at(-1).eq(ZERO)) suffixLog = new SimpleGrowthOrder([]);
	else if (this.expPowers.at(-1).gt(ZERO)) suffixLog = ExpGrowthOrder.extStack.at(this.rank-1);
	else suffixLog = ExpGrowthOrder.extStack.at(this.rank-1).reciprocal();
	
	if (prefixLog.abs().leq(suffixLog.abs())) return suffixLog;
	else return prefixLog;
    }

    upcast(grOrd) {
	if (grOrd instanceof SimpleGrowthOrder) return new ExpGrowthOrder(grOrd.logPowers, Array(this.rank).fill(ZERO));
	else return new ExpGrowthOrder(grOrd.simpleTerm.logPowers, grOrd.expPowers.concat(Array(this.rank-grOrd.rank).fill(ZERO)));
    }
}
