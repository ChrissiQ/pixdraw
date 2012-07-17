share = {
	upload: function(image){
	
		$.post('http://api.imgur.com/2/upload.json', 
			{
				'image': image, 
				'api_key': '24d00bbfcd3d433095c97d48a4b10ebd'
			},
			function(data, textStatus, jqXHR){
			console.log(data, textStatus, jqXHR);
		});

	}
}
