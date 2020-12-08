//matrix rain visualization
class Matrix_Rain{
	constructor(p_fpv, num, len){
		this.p_fpv = p_fpv;
		this.num = num;
		this.len = len;
		this.warp = 0;

		let s = .025;
		this.symbols = [[-.5*s,s,0, .5*s,s,0,
						 -.5*s,s,0, 0,-s,0,
						 .5*s,s,0, 0,-s,0],
						[-.5*s,s,0, .5*s,s,0,
						 -.5*s,-s,0, .5*s,-s,0,
						 0,s,0, 0,-s,0]];
		this.sym_len = this.symbols[0].length;
		this.offsets = [];
		for(let i = 0; i < len; i++){
			this.offsets.push(exp_map(i, [0, len], [.1, .03], .2));
		}

		let vertex_length = num*len*this.sym_len;
		this.pos_buffer = new Float32Array(vertex_length*this.p_fpv);
		this.off_buffer = new Float32Array(vertex_length);
		this.opc_buffer = new Float32Array(vertex_length);
		this.cos_buffer = new Float32Array(vertex_length);
		this.sin_buffer = new Float32Array(vertex_length);
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.strands = [];
		this.curr_sym = [];
		this.st_b = [25, 100];

		let r_b = [1.5, 10];
		let a_b = [0, Math.PI*2];
		let h_b = [7, -7];
		let pos_ind = 0;
		let buf_ind = 0;
		for(let n = 0; n < num; n++){
			this.strands.push([Math.floor(Math.random()*len), map(Math.random(), [0, 1], this.st_b), Math.random()*this.st_b[0]]);
			let r = map(Math.random(), [0, 1], r_b);
			let a = map(Math.random(), [0, 1], a_b);
			let pos = [Math.cos(a)*r, 0, Math.sin(a)*r];
			for(let l = 0; l < len; l++){
				let center_pos = add(pos, [0, map(l, [0, len], h_b), 0]);
				let angle = map(l, [0, len], [0, Math.PI*8]);
				for(let p = 0; p < 2; p++){
					let symbol = Math.random() < .5 ? 0 : 1;
					this.curr_sym.push(symbol);
					for(let i = 0; i < this.symbols[symbol].length; i++, pos_ind += 3, buf_ind++){
						let vertex_pos = add(this.symbols[symbol].slice(i*3, i*3+3), center_pos);
						this.pos_buffer[pos_ind + 0] = vertex_pos[0];
						this.pos_buffer[pos_ind + 1] = vertex_pos[1];
						this.pos_buffer[pos_ind + 2] = vertex_pos[2];

						this.off_buffer[buf_ind] = p == 0 ? -.03 : .03;
						this.opc_buffer[buf_ind] = 0;
						this.cos_buffer[buf_ind] = Math.cos(angle);
						this.sin_buffer[buf_ind] = Math.sin(angle);
					}
				}
			}
		}

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);
		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.gl_off_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_off_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.off_buffer, gl.DYNAMIC_DRAW);
		this.a_Offset = gl.getAttribLocation(gl.program, 'a_Offset');
		gl.vertexAttribPointer(this.a_Offset, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Offset);

		this.gl_opc_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_opc_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.opc_buffer, gl.DYNAMIC_DRAW);
		this.a_Opacity = gl.getAttribLocation(gl.program, 'a_Opacity');
		gl.vertexAttribPointer(this.a_Opacity, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Opacity);

		this.gl_cos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_cos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.cos_buffer, gl.STATIC_DRAW);
		this.a_Acos = gl.getAttribLocation(gl.program, 'a_Acos');
		gl.vertexAttribPointer(this.a_Acos, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Acos);

		this.gl_sin_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_sin_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.sin_buffer, gl.STATIC_DRAW);
		this.a_Asin = gl.getAttribLocation(gl.program, 'a_Asin');
		gl.vertexAttribPointer(this.a_Asin, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Asin);

		this.u_Warp = gl.getUniformLocation(gl.program, 'u_Warp');
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_cos_buf);
		gl.vertexAttribPointer(this.a_Acos, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_sin_buf);
		gl.vertexAttribPointer(this.a_Asin, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_off_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.off_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Offset, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_opc_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.opc_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Opacity, 1, gl.FLOAT, false, this.fsize, 0);

		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);
	}

	update(elapsed, fft){
		this.warp = this.warp*.7 + exp_map(fft.sub_pro(0, .125), [0, 255], [0, 1], 2)*.3;
		gl.uniform1f(this.u_Warp, this.warp);

		let vpl = 2*this.sym_len/this.p_fpv;
		for(let i = 0; i < this.num; i++){
			this.strands[i][2] += elapsed;
			if(this.strands[i][2] > this.strands[i][1]){
				this.strands[i][2] = 0;
				this.strands[i][0] = (this.strands[i][0] + 1) % this.len;
				for(let j = 0; j < this.len; j++){
					let d = this.strands[i][0] - j > 0 ? this.strands[i][0] - j : this.strands[i][0] + this.len - j;
					let opacity = exp_map(d, [0, this.len/2], [.75, 0], .4);
					let vertex_start = (i*this.len + j)*vpl;
					for(let k = 0; k < vpl; k++){
						this.opc_buffer[vertex_start + k] = opacity;
						this.off_buffer[vertex_start + k] = (k < vpl/2 ? -1 : 1) * this.offsets[d];
					}
				}
			}
		}
	}
}

