//object for controlling menu
var Menu = function(){
	this.fft = null;
	this.s_l = document.getElementById('song_list');
	this.items = [];
	this.inds = [];
	this.selected_ind = -1;
	this.i_t = document.getElementById('item_template').cloneNode(true);
	this.i_t.classList.remove('hidden');
	this.i_t.childNodes[1].innerHTML = '';
	this.i_t.childNodes[3].classList.add('hidden');
	this.i_t.id = '';
	this.dragging = false;

	let menu = this;
	document.getElementById('file_input').onchange = function(){
		let files = this.files;
		menu.clear_items();
		let inds = [];
		for(let i = 0; i < files.length; i++)
			inds.push(i);
		for(let i = 0; i < files.length; i++){
			let ind = inds.splice(Math.floor(Math.random()*inds.length), 1)[0];
			menu.add_item(files[ind].name.substring(0, files[ind].name.lastIndexOf('.')), URL.createObjectURL(files[ind]));
		}
		menu.select_item(0);
	}
}

//select an item in the list
Menu.prototype.select_item = function(i){
	if(i != this.selected_ind){
		if(this.selected_ind >= 0) {
			this.items[this.selected_ind][2].classList.remove('selected');
			if(this.items[this.selected_ind][2].childNodes[3].childNodes[1].classList.contains('hidden')){
				this.items[this.selected_ind][2].childNodes[3].childNodes[1].classList.remove('hidden')
				this.items[this.selected_ind][2].childNodes[3].childNodes[3].classList.add('hidden')
			}
		}
		this.selected_ind = i;
		this.items[i][2].classList.add('selected');
		this.items[i][2].childNodes[3].classList.remove('hidden');
		if(this.fft != null && this.fft.change_file(this.items[i][1])){
			this.items[i][2].childNodes[3].childNodes[1].classList.add('hidden');
			this.items[i][2].childNodes[3].childNodes[3].classList.remove('hidden');
		}
	}
}

//add a song with given name
Menu.prototype.add_item = function(name, file){
	let menu = this;
	let item = this.i_t.cloneNode(true);
	item.childNodes[1].innerHTML = name;
	item.onmouseenter = function(){
		this.childNodes[3].classList.remove('hidden');
	}
	item.id = this.items.length.toString();
	item.onmouseleave = function(){
		if(menu.selected_ind != parseFloat(this.id))
			this.childNodes[3].classList.add('hidden');
	}
	item.childNodes[3].id = item.id;
	item.childNodes[3].onmousedown = function(){
		if(this.childNodes[1].classList.contains('hidden')){
			if(menu.fft != null){
				this.childNodes[1].classList.remove('hidden');
				this.childNodes[3].classList.add('hidden');
				menu.fft.pause_audio();
			}
		}
		else{
			menu.select_item(parseFloat(this.id));
			if(menu.fft != null){
				this.childNodes[1].classList.add('hidden');
				this.childNodes[3].classList.remove('hidden');
				menu.fft.play_audio();
			}
		}
	}

	item.childNodes[7].onmousedown = function(e){
		menu.dragging = true;
		this.style.cursor = 'grabbing';
		if(menu.fft != null){
			let rect = this.getBoundingClientRect();
			let per = 100*(e.clientX - rect.left)/rect.width;
			menu.fft.set_progress(per);
			this.childNodes[1].style.width = per.toFixed(2) + '%';
		}
	}
	item.childNodes[7].onmouseup = function(){
		menu.dragging = false;
		this.style.cursor = 'grab';
	}
	item.childNodes[7].onmouseleave = function(){
		menu.dragging = false;
		this.style.cursor = 'grab';
	}
	item.childNodes[7].onmousemove = function(e){
		if(menu.dragging && menu.fft != null){
			let rect = this.getBoundingClientRect();
			let per = 100*(e.clientX - rect.left)/rect.width;
			menu.fft.set_progress(per);
			this.childNodes[1].style.width = per.toFixed(2) + '%';
		}
	}

	this.s_l.appendChild(item);
	this.items.push([name, file, item]);
}

//remove song with the given name
Menu.prototype.clear_items = function(){
	this.selected_ind = -1;
	this.items = [];
	while(this.s_l.firstChild){
		this.s_l.removeChild(this.s_l.firstChild);
	}
}

//add reference to fft object to menu object
Menu.prototype.attach_fft = function(fft){
	this.fft = fft;
}

//update the progress bar
Menu.prototype.progress = function(){
	let per = this.fft.get_progress();
	this.items[this.selected_ind][2].childNodes[7].childNodes[1].style.width = per.toFixed(2) + '%';
	if(per >= 100 && this.selected_ind + 1 < this.items.length){
		this.select_item(this.selected_ind + 1);
		this.fft.play_audio();
	}

}
