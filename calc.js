console.log("hello world!")

// Lexicographic comparison of arrays by their elements.
Array.prototype.lexLeq = function(arr) {
    let arr1 = this.slice();
    let arr2 = arr.slice();
    while (True) {
	if (arr1.length == 0 && arr2.length == 0) return True;
	if (arr1.length == 0) arr1 = [0];
	if (arr2.length == 0) arr2 = [0];
	if (arr1[0] < arr2[0]) return True;
	arr1.shift();
	arr2.shift();
    }
}

class GenericGrowthOrder {
    constructor() { };

    // For pretty printing.
    display() { console.log("Pretty printing not implemented for generic growth order") };
    displayToBox(id) {
	let texString = `\$\$${this.display()}\$\$`;
	document.getElementById(id).innerHTML = texString;
	MathJax.typeset();
    }

    // For inequality/comparison of growth orders.
    // Comparison should always be deferred to the growth order of higher rank.
    leq(grOrd) { console.log("Comparison not implemented for generic growth order") };
    geq(grOrd) { console.log("Comparison not implemented for generic growth order") };

    // Reciprocals of growth orders.
    reciprocal() { console.log("Reciprocals not implemented for generic growth order") };

    // Multiplication of growth orders.
    times(grOrd) { console.log("Multiplication not implemented for generic growth order") };
}

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
	if (this.logPowers[0] != 0) str = `n^{${String(this.logPowers[0])}}`
	for (let i = 1; i < this.logPowers.length; i++) {
	    if (this.logPowers.at(i) != 0) {
		let nextTerm = `(${cumlog})^{${this.logPowers.at(i)}}`;
		if (str.length == 0) str = nextTerm;
		else str = str.concat(String.raw` \cdot ${nextTerm}`);
	    }
	    cumlog = "\\log ".concat(cumlog)
	}
	return str;
    }

    leq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.geq(this);
	return lexLeq(this.logPowers, grOrd.logPowers);	
    }

    geq(grOrd) {
	if (grOrd.rank > this.rank) return grOrd.leq(this);
	return lexLeq(grOrd.logPowers, this.logPowers);
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
}
