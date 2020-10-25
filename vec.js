//multiply vector by scalar
function mult_scalar(vec, s){ 
	let o = vec.slice();
	for(let i = 0; i < o.length; i++)
		o[i] = o[i]*s;
	return o;
}

//find magnitude of vector
function mag(vec){ 
	let s = 0;
	for(let i = 0; i < vec.length; i++)
		s += Math.pow(vec[i], 2);
	return Math.sqrt(s);
}

//find normal of vector
function norm(vec){ 
	return mult_scalar(vec, 1/mag(vec));
}

//set vector magnitude
function resize(vec, l){
	return mult_scalar(vec, l/mag(vec));
}

//find midpoint of two vectors
function midpoint(a, b){ 
	let o = [];
	for(let i = 0; i < a.length; i++)
		o.push((a[i] + b[i])/2);
	return o;
}





