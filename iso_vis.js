//isosphere based music visualization
class Iso{
	constructor(p_fpv){
		noise.seed(Math.random());
		this.p_fpv = p_fpv;
		this.iso = gen_iso(2);
		this.p = {
			scale: [.2, 1, 2, 3, 4, 5],
			weight: norm([1, 1, 1, 1, 1, 1]),
			pos: 0,
			speed: .2,
			apos: [0, 0, 0],
			aspeed: [.9, .8, .7]
		};
		this.rotation = {
			axis: [0, 0, 0],
			angle: 40
		};

		this.pos_buffer = new Float32Array(4*this.iso.length*this.p_fpv);
		this.scl_buffer = new Float32Array(4*this.iso.length);
		this.flr_buffer = new Float32Array(4*this.iso.length);

		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		let pos_ind = 0;
		for(let i = 0; i < this.iso.length; i++){
			for(let j = 0; j < this.iso[i].length; j++, pos_ind++)
				this.pos_buffer[pos_ind] = this.iso[i][j];
			this.scl_buffer[i] = 1.0;
			this.flr_buffer[i] = 0.0;
		}
		for(let i = 0; i < this.iso.length; i += 2){
			for(let j = 0; j < this.iso[i].length; j++, pos_ind++)
				this.pos_buffer[pos_ind] = this.iso[i+1][j];
			this.scl_buffer[pos_ind/3] = 1.0;
			this.flr_buffer[pos_ind/3] = 0.0;
			for(let k = 0; k < 3; k++){
				for(let j = 0; j < this.iso[i].length; j++, pos_ind++){
					this.pos_buffer[pos_ind] = this.iso[i][j];
				}
				this.scl_buffer[pos_ind/3] = 1.0;
				this.flr_buffer[pos_ind/3] = 0.05;
			}
			for(let k = 0; k < 2; k++){
				for(let j = 0; j < this.iso[i].length; j++, pos_ind++){
					this.pos_buffer[pos_ind] = this.iso[i+1][j];
				}
				this.scl_buffer[pos_ind/3] = 1.0;
				this.flr_buffer[pos_ind/3] = 0.0;
			}
		}

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.gl_scl_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_scl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.scl_buffer, gl.DYNAMIC_DRAW);

		this.a_Scale = gl.getAttribLocation(gl.program, 'a_Scale');
		gl.vertexAttribPointer(this.a_Scale, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Scale);

		this.gl_flr_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_flr_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.flr_buffer, gl.DYNAMIC_DRAW);

		this.a_Flare = gl.getAttribLocation(gl.program, 'a_Flare');
		gl.vertexAttribPointer(this.a_Flare, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Flare);

		this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_scl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.scl_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Scale, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_flr_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.flr_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Flare, 1, gl.FLOAT, false, this.fsize, 0);


		let rot = new Mat4();
		rot.rotate(this.rotation.angle, this.rotation.axis);
		gl.uniformMatrix4fv(this.u_ModelMatrix, false, rot.e);
		gl.drawArrays(gl.LINES, 0, this.iso.length);
		gl.drawArrays(gl.TRIANGLES, this.iso.length, this.iso.length*3);
	}

	update(elapsed){
		for(let i = 0; i < 3; i++)
			this.p.apos[i] += this.p.aspeed[i]*elapsed/1000;
		this.rotation.axis = [noise.perlin3(this.p.apos[0], this.p.apos[1], this.p.apos[2]), noise.perlin3(this.p.apos[1], this.p.apos[2], this.p.apos[0]), (noise.perlin3(this.p.apos[0], this.p.apos[2], this.p.apos[1]) + 1)/2];

		this.p.pos += this.p.speed*elapsed/1000;
		let scales = [];
		for(let i = 0; i < this.iso.length; i++){
			scales.push(0);
			for(let j = 0; j < this.p.scale.length; j++){
				scales[i] += noise.perlin3((this.iso[i][0] + this.p.pos)*this.p.scale[j], this.iso[i][1]*this.p.scale[j], this.iso[i][2]*this.p.scale[j])*this.p.weight[j];
			}
			scales[i] = scales[i]*.6 + 1.3;
		}
		let flare = .05;

		let buf_ind = 0;
		for(let i = 0; i < scales.length; i++, buf_ind++){
			this.scl_buffer[buf_ind] = scales[i];
			this.flr_buffer[buf_ind] = 0.0;
		}
		for(let i = 0; i < scales.length; i += 2, buf_ind += 6){
			this.scl_buffer[buf_ind+0] = scales[i+1];
			this.scl_buffer[buf_ind+1] = scales[i];
			this.scl_buffer[buf_ind+2] = scales[i];
			this.scl_buffer[buf_ind+3] = scales[i];
			this.scl_buffer[buf_ind+4] = scales[i+1];
			this.scl_buffer[buf_ind+5] = scales[i+1];
			this.flr_buffer[buf_ind+0] = 0.0;
			this.flr_buffer[buf_ind+1] = 0.0;
			this.flr_buffer[buf_ind+2] = flare;
			this.flr_buffer[buf_ind+3] = flare;
			this.flr_buffer[buf_ind+4] = flare;
			this.flr_buffer[buf_ind+5] = 0.0;
		}
	}
}
