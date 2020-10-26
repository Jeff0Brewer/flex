//isosphere based music visualization
class Iso{
	constructor(p_fpv){
		noise.seed(Math.random());
		this.p_fpv = p_fpv;
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
		this.iso = gen_iso(2);
		this.v = [];
		for(let i = 0; i < this.iso.length; i++){
			let copy = false;
			for(let j = 0; j < this.v.length; j++){
				copy = copy || vec_equal(this.iso[i], this.v[j]);
			}
			if(!copy)
				this.v.push(this.iso[i]);
		}

		this.pos_buffer = new Float32Array((4*this.iso.length + 2*this.v.length)*this.p_fpv);
		this.scl_buffer = new Float32Array(4*this.iso.length + 2*this.v.length);
		this.flr_buffer = new Float32Array(4*this.iso.length + 2*this.v.length);

		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.v_inds = [];
		let pos_ind = 0;
		for(let i = 0; i < this.iso.length; i++){
			let vi = 0;
			while(!vec_equal(this.iso[i], this.v[vi]))
				vi++
			this.v_inds.push(vi);

			for(let j = 0; j < this.iso[i].length; j++, pos_ind++)
				this.pos_buffer[pos_ind] = this.iso[i][j];
			this.scl_buffer[i] = 1.0;
			this.flr_buffer[i] = 0.0;
		}
		for(let i = 0; i < this.iso.length; i += 2){
			let v0 = 0;
			while(!vec_equal(this.iso[i], this.v[v0]))
				v0++
			let v1 = 0;
			while(!vec_equal(this.iso[i+1], this.v[v1]))
				v1++
			this.v_inds.push(v1);
			this.v_inds.push(v0);
			this.v_inds.push(v0);
			this.v_inds.push(v0);
			this.v_inds.push(v1);
			this.v_inds.push(v1);

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
		for(let i = 0; i < this.v.length; i++){
			this.v_inds.push(i);
			this.v_inds.push(i);
			let v = mult_scalar(this.v[i], 1.25);
			for(let j = 0; j < v.length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = v[j];
			}
			this.scl_buffer[pos_ind/3] = 1.0;
			this.flr_buffer[pos_ind/3] = 0.0;
			for(let j = 0; j < v.length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = v[j];
			}
			this.scl_buffer[pos_ind/3] = 1.0;
			this.flr_buffer[pos_ind/3] = 0.1;
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
		this.u_Alpha = gl.getUniformLocation(gl.program, 'u_Alpha');
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_scl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.scl_buffer, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_flr_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.flr_buffer, gl.DYNAMIC_DRAW);

		let rot = new Mat4();
		rot.rotate(this.rotation.angle, this.rotation.axis);
		gl.uniformMatrix4fv(this.u_ModelMatrix, false, rot.e);
		gl.uniform1f(this.u_Alpha, 1.0);
		gl.drawArrays(gl.LINES, 0, this.iso.length);
		gl.drawArrays(gl.LINES, this.iso.length*4, this.scl_buffer.length - this.iso.length*4);
		gl.uniform1f(this.u_Alpha, .7);
		gl.drawArrays(gl.TRIANGLES, this.iso.length, this.iso.length*3);
	}

	update(elapsed){
		for(let i = 0; i < 3; i++)
			this.p.apos[i] += this.p.aspeed[i]*elapsed/1000;
		this.rotation.axis = [noise.perlin3(this.p.apos[0], this.p.apos[1], this.p.apos[2]), noise.perlin3(this.p.apos[1], this.p.apos[2], this.p.apos[0]), (noise.perlin3(this.p.apos[0], this.p.apos[2], this.p.apos[1]) + 1)/2];

		this.p.pos += this.p.speed*elapsed/1000;
		let scales = [];
		for(let i = 0; i < this.v.length; i++){
			scales.push(0);
			for(let j = 0; j < this.p.scale.length; j++){
				scales[i] += noise.perlin3((this.v[i][0] + this.p.pos)*this.p.scale[j], this.v[i][1]*this.p.scale[j], this.v[i][2]*this.p.scale[j])*this.p.weight[j];
			}
			scales[i] = scales[i]*.4 + 1;
		}
		for(let i = 0; i < this.scl_buffer.length; i++){
			this.scl_buffer[i] = scales[this.v_inds[i]];
		}

		let flare = .05;
		let old = this.flr_buffer.slice();
		for(let i = this.iso.length + 1; i < this.iso.length*4; i += 6){
			this.flr_buffer[i+1] = flare;
			this.flr_buffer[i+2] = flare;
			this.flr_buffer[i+3] = flare;
		}
		for(let i = this.iso.length*4; i < this.flr_buffer.length; i += 2){
			this.flr_buffer[i] = Math.pow(scales[this.v_inds[i]] - 1, .9);
		}
	}
}

