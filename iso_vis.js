//isosphere based music visualization
class Iso{
	constructor(p_fpv){
		this.p_fpv = p_fpv;
		this.iso = gen_iso(2);
		this.pos_buffer = new Float32Array(this.iso.length*this.p_fpv);
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		let pos_ind = 0;
		for(let i = 0; i < this.iso.length; i++){
			for(let j = 0; j < this.iso[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = this.iso[i][j];
			}
		}

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);

		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);
	}
}