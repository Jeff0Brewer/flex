//particle visualization
class Particles{
	constructor(p_fpv, x_num, y_num, z_num, shader_ind){
		this.p_fpv = p_fpv;
		this.sh = shader_ind;
		this.warp = 0;

		this.pos_buffer = new Float32Array(x_num*y_num*z_num*p_fpv);
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		let x_b = [-8, 8];
		let y_b = [-7, 7];
		let z_b = [-8, 8];
		let pos_ind = 0;
		for(let x = x_b[0]; x < x_b[1]; x += (x_b[1] - x_b[0])/x_num){
			for(let y = y_b[0]; y < y_b[1]; y += (y_b[1] - y_b[0])/y_num){
				for(let z = z_b[0]; z < z_b[1]; z += (z_b[1] - z_b[0])/z_num){
					if(!(Math.abs(x) < .05 && Math.abs(y) < .05 && z > 0)){
						this.pos_buffer[pos_ind + 0] = x;
						this.pos_buffer[pos_ind + 1] = y;
						this.pos_buffer[pos_ind + 2] = z;
						pos_ind += 3;
					}
				}
			}
		}

		switch_shader(this.sh);
		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);
		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.u_Warp = gl.getUniformLocation(gl.program, 'u_Warp');
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_WarpCurve'), .2, 1.0, .6);
	}

	draw(){
		switch_shader(this.sh);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);

		gl.uniform1f(this.u_Warp, this.warp);
		gl.drawArrays(gl.POINTS, 0, this.pos_buffer.length / this.p_fpv);
	}

	update(elapsed, fft){
		this.warp = this.warp*.85 + exp_map(fft.sub_pro(0, .1), [0, 255], [0, 1], 3)*.15;

	}
}

