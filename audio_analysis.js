//audio analyser object
var FFT = function(size, smooth, file){
	this.actx = new AudioContext();
	this.audio = new Audio(file);
	this.audio_src = this.actx.createMediaElementSource(this.audio);
	this.analyser = this.actx.createAnalyser();
	this.analyser.fftSize = size;
	this.analyser.smoothingTimeConstant = .5;
	this.audio_src.connect(this.analyser);
	this.audio_src.connect(this.actx.destination);
	this.raw_data = new Uint8Array(size);
	this.pro_data = new Array(Math.ceil(Math.sqrt(Math.floor(this.raw_data.length*0.7))));
}

//get data from attached audio object
FFT.prototype.get_data = function(){
	this.analyser.getByteFrequencyData(this.raw_data);
	let trim = this.raw_data.slice(0, Math.floor(this.raw_data.length*0.7));
	for(let i = 0; i < Math.sqrt(trim.length); i++)
		this.pro_data[i] = vec_avg(trim.slice(Math.pow(i, 2), Math.pow(i+1, 2)));
}

//get average of subset of processed data
FFT.prototype.sub_pro = function(s, e){
	s = Math.floor(s*this.pro_data.length);
	e = Math.floor(e*this.pro_data.length);
	let slice = this.pro_data.slice(s, e);
	let sum = 0;
	for(let i = 0; i < slice.length; i++)
		sum += slice[i];
	return sum/slice.length;
}

//play attached audio
FFT.prototype.play_audio = function(){
	this.audio.play();
}