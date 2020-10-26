var programs = [];
var p_fpv = 3;

//load a shader from string
function load_shader(type, source){
	let s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	return s;
}

//create a gl program from strings
function create_program(vs, fs){
	let p = gl.createProgram();
	let v = load_shader(gl.VERTEX_SHADER, vs);
	let f = load_shader(gl.FRAGMENT_SHADER, fs);
	gl.attachShader(p, v);
	gl.attachShader(p, f);
	gl.linkProgram(p);
	return p;
}

//switch to another shader program
function switch_shader(i){
	gl.useProgram(programs[i]);
	gl.program = programs[i];
}

//initialize gl context
function setup_gl(){
	gl = document.getElementById('c').getContext('webgl');
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0, 0, 0, 0);

	programs.push(create_program(document.getElementById('v_iso').text, document.getElementById('f_iso').text));
}
