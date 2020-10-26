//initialize transform matrices
var model_matrix = new Mat4();
var view_matrix = new Mat4();
var proj_matrix = new Mat4();

//get canvas object
var canvas = document.getElementById('c');
canvas.width = window.innerWidth*window.devicePixelRatio;
canvas.height = window.innerHeight*window.devicePixelRatio;

//initialize audio analyser variable
var fft = null;

function main(){
	//setup gl and uniforms
	setup_gl();
	switch_shader(0);
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

	fovy = 50;
	view_matrix.set_camera([0, 0, 7], [0, 0, 0], [0, 1, 0]);
	proj_matrix.set_perspective(fovy, canvas.width/canvas.height, .01, 500);
	gl.uniformMatrix4fv(u_ModelMatrix, false, model_matrix.e);
	gl.uniformMatrix4fv(u_ViewMatrix, false, view_matrix.e);
	gl.uniformMatrix4fv(u_ProjMatrix, false, proj_matrix.e);

	//initialize visualizations
	iso = new Iso(p_fpv);

	//start drawing loop
	let last_t = Date.now();
	var tick = function(){
		//find elapsed time
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		//update and draw visualizations
		if(elapsed < 500 && fft != null){
			fft.get_data();
			iso.update(elapsed, fft);
			iso.draw();
		}

		requestAnimationFrame(tick, canvas);
	}
	tick();
}

//initialize audio analyser
document.body.onmousedown = function(){
	if(fft == null){
		fft = new FFT(4096, .5, 'Underground - NITRXMANE.mp3');
		fft.play_audio();
	}
}

//handle window resizing
document.body.onresize = function(){
	canvas.width = window.innerWidth*window.devicePixelRatio;
	canvas.height = window.innerHeight*window.devicePixelRatio;
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
		proj_matrix.set_perspective(fovy, canvas.width/canvas.height, .01, 500);
		switch_shader(0);
		gl.uniformMatrix4fv(u_ProjMatrix, false, proj_matrix.e);
	}
}
