document.addEventListener('DOMContentLoaded', function () {
	app.init();
});

var app = {  
	nameLocalStorage: '_comparePrices',

	headerAdd: document.getElementById('headerAdd'),
	headerMain: document.getElementById('headerMain'),
	headerProduct: document.getElementById('headerProduct'),

	footerDiv: document.getElementById('pie'),

	productList: document.getElementById('productList'),
	productInput: document.getElementById('productInput'),
	productItem: document.getElementById('productItem'),
	productItemName: document.getElementById('productItemName'),
	titleVistProduct: document.getElementById('titleVistProduct'),
	priceFormTitle: document.getElementById('priceFormTitle'),
	priceBox: document.getElementById('priceBox'),

	addButton: document.getElementById('addButton'),
	backToMainButton: document.getElementById('backToMain'),
	saveProductButton: document.getElementById('saveProduct'),
	deleteProductButton: document.getElementById('deleteProduct'),	
	backToMainProductButton: document.getElementById('backToMainProduct'),
	//backToMainProductButton: document.getElementById('backToMainProduct'),
	productEditButton: document.getElementById('productEdit'),
	addPriceButton: document.getElementById('addPrice'),
	clearPriceButton: document.getElementById('clearPrice'),	

	nameInput: document.getElementById('nameInput'),
	markInput: document.getElementById('markInput'),
	amountInput: document.getElementById('amountInput'),
	weightInput: document.getElementById('weightInput'),
	shopInput: document.getElementById('shopInput'),
	priceInput: document.getElementById('priceInput'),

	nameItem: document.getElementById('nameItem'),
	markItem: document.getElementById('markItem'),
	amountItem: document.getElementById('amountItem'),
	weightItem: document.getElementById('weightItem'),

	inputFile: document.getElementById('inputFile'),
	
	isEdit: false,
	isEditPrice: false,
	item: null,
	allProducts: [],
	itemPrice: undefined,


  csvJSON: function(csv){
    var lines=csv.split("\r\n");

    var result = [];

    var headersCSV = ["id","Name","Mark","Amount","Weight","ListPrices"];

    for(var i=0;i<lines.length;i++){
  	  
  	  var obj = {};

      var currentline=lines[i].split(",");

      if (currentline.length > 1) {
        for(var j=0;j<headersCSV.length;j++) {
        	if (j !== 5) {
          	obj[headersCSV[j]] = currentline[j];
        	} else {
        		obj[headersCSV[j]] = [];
        	}
        }

	    	var numberPrices = parseInt((currentline.length - 6) / 3);

        for(var j=0; j<numberPrices; j++) {
  	      var objPrice = {};

  	      objPrice['id'] = currentline[5+(j*3)];
  	      objPrice['Shop'] = currentline[5+(j*3)+1];
  	      objPrice['Price'] = currentline[5+(j*3)+2];

  	      obj['ListPrices'].push(objPrice);
        }

        result.push(obj);
      }
    }
    
    return JSON.stringify(result);
  },


  importFile: function(e) {  
		if (confirm("¿Importar lista de productos? \n Eliminara los ya existentes") == true) {
	    app.inputFile.click();
	    app.inputFile.addEventListener('change',function(e) {
	      var input = e.target;
	      var reader = new FileReader();
	      reader.onload = function(){
	        var text = reader.result;
	        localStorage.setItem(app.nameLocalStorage, app.csvJSON(reader.result));
      		app.allProducts = JSON.parse(localStorage.getItem(app.nameLocalStorage));
	        app.mostrar();
	      };
	      reader.readAsText(input.files[0]);
	      app.inputFile.removeEventListener('change', function(){});
	      app.inputFile.value = "";
	    });
		}
  },

	saveProduct: function() {
		let nameValue = app.nameInput.value;

		let markValue = app.markInput.value;
		if(markValue == ""){
			markValue = " ";
		}

		let amountValue = app.amountInput.value;
		if(amountValue == ""){
			amountValue = " ";
		}

		let weightValue = app.weightInput.value;
		if(weightValue == ""){
				weightValue = " ";
		}
		
		if (app.isEdit) {
			if(confirm('Está Seguro de sobrescribir el producto '+ app.item.Name + '?')) {
				let productEdit = {id: app.item.id,
					Name: nameValue, 
					Mark: markValue, 
					Amount: amountValue, 
					Weight: weightValue,
					ListPrices: app.item.ListPrices};
				app.item = productEdit;

				app.updateProduct();
				app.changeToProductItem(app.item.id);
			}
		} else if(nameValue !== "") {

		    for (var i in app.allProducts) {
		        if(app.allProducts[i].Name === nameValue && app.allProducts[i].Mark === markValue ) {
					alert(`Ya existe el producto ${nameValue} - ${markValue}`);
		            return;
		        }
		    }

		    let idValue = app.allProducts.length +1;

		    let productNew = {id: idValue,
		    	Name: nameValue, 
		    	Mark: markValue, 
		    	Amount: amountValue, 
		    	Weight: weightValue,
		    	ListPrices: []};
			console.log(productNew);

			app.allProducts.push(productNew);

			localStorage.setItem(app.nameLocalStorage, JSON.stringify(app.allProducts));		
			app.changeToMain();

		} else {
			alert("Introduce nombre");
		}
	},

	updateProduct: function() {
		app.allProducts = app.allProducts.filter(x => x.id !== app.item.id);
		app.allProducts.push(app.item);

		//TODO ordenar array
		app.allProducts.sort(function (a, b) {
		  if (a.id > b.id) {
		    return 1;
		  }
		  if (a.id < b.id) {
		    return -1;
		  }
		  // a must be equal to b
		  return 0;
		});

		localStorage.setItem(app.nameLocalStorage, JSON.stringify(app.allProducts));
	},

	deleteProduct: function() {
		if (confirm(`¿Borrar producto ${app.item.Name}?`)){
			app.allProducts = app.allProducts.filter(el => el.id !== app.item.id);
			app.resetIdArray(app.allProducts);
			app.productList.innerHTML = '<p class="empty">Pulsa + para agregar productos</p>';
			localStorage.setItem(app.nameLocalStorage, JSON.stringify(app.allProducts));
			app.changeToMain();
		}
	},

	deletePrice: function(e) {
		let idValue;	
  		if (isNaN(e)) {
			idValue = e.target.getAttribute('data-id');
  		}/* else {
			idValue = e;  			
  		}*/
  		
		if (idValue !== undefined) {
			let price = app.item.ListPrices.filter(el => el.id == idValue);

			if (confirm(`¿Borrar precio de la tienda ${price.Shop}?`)){

				app.item.ListPrices = app.item.ListPrices.filter(el => el.id != idValue);
				app.resetIdArray(app.item.ListPrices);
				app.updateProduct();

				//Mostrar precios
				app.mostrarPrecios(app.item.ListPrices);
			}
		}
	},

	editPrice: function(e) {
		let idValue;	
  		if (isNaN(e)) {
			idValue = e.target.getAttribute('data-id');
  		}
/*
    	if (!app.isEditPrice) {
    		app.priceFormTitle.innerHTML = "Añadir";
    	} else {
    		*/
    		//app.priceFormTitle.innerHTML = "Editar";
  //  	}

		if (idValue !== undefined) {
			app.itemPrice = app.item.ListPrices.filter(el => el.id == idValue);

			app.shopInput.value = app.itemPrice[0].Shop;
			app.priceInput.value = parseFloat(app.itemPrice[0].Price);

			//Remove class
			app.clearPriceButton.classList.remove('hide');
			app.priceFormTitle.innerHTML = "Editar";
			app.isEditPrice = true;

/*
			//TODO cambiar si se cancela la edicion
			*/
		}
	},

	cancelEditPrice: function() {
		app.itemPrice = undefined;
		app.shopInput.value = "";
		app.priceInput.value = "";
		app.clearPriceButton.classList.add('hide');
		app.priceFormTitle.innerHTML = "Añadir";
	},

	savePrice: function() {
		let shopValue = app.shopInput.value;

		let priceValue = app.priceInput.value;
		if(priceValue !== "") {
			priceValue = parseFloat(priceValue).toFixed(2);
		}

		if(shopValue !== "" && priceValue !== "") {
			
			//TODO comprobar si existe la tienda
			
			if (!app.isEditPrice) {
				app.item.ListPrices.push({id: app.item.ListPrices.length + 1 ,
					Shop: shopValue, Price: priceValue});
			} else {
				app.item.ListPrices = app.item.ListPrices.filter(x => x.id != app.itemPrice[0].id);
				
				app.item.ListPrices.push({id: app.itemPrice[0].id ,Shop: shopValue, Price: priceValue});

				app.item.ListPrices.sort(function (a, b) {
				  if (a.id > b.id) {
				    return 1;
				  }
				  if (a.id < b.id) {
				    return -1;
				  }
				  // a must be equal to b
				  return 0;
				});
			}

			app.isEditPrice = false;
			app.updateProduct();

			//Mostrar precios
			app.mostrarPrecios(app.item.ListPrices);

			//Borrar formulario
			app.shopInput.value = "";
			app.priceInput.value = "";
			app.clearPriceButton.classList.add('hide');
			app.priceFormTitle.innerHTML = "Añadir";

		} else {
			alert("Introduce tienda y precios");
		}
	},

	mostrarPrecios : function (prices) {	
		//ordenar precios por id

		app.priceBox.innerHTML = "";
		if (prices !== null && prices !== undefined && prices.length > 0) {
			for(var f=0; f < prices.length; f++) {
				app.priceBox.innerHTML += `
				<div class="price">
					<div class="shop">Tienda: ${prices[f].Shop}</div>
					<div>Precio: ${prices[f].Price}</div>
					<div class="image">
						<svg id="" class="icon iconItem icon-pencil editPrice" data-id="${prices[f].id}">
							<use xlink:href="#icon-pencil" data-id="${prices[f].id}"></use></svg>
						<svg id="" class="icon icon-bin2 deletePrice" data-id="${prices[f].id}">
							<use xlink:href="#icon-bin2" data-id="${prices[f].id}"></use></svg>
					</div>
				</div>`

			}

      		let allPriceDeleteLink = document.querySelectorAll('.deletePrice');
			allPriceDeleteLink.forEach(
  				function(itemLink) {
   					itemLink.addEventListener('click', app.deletePrice);
  				}
			);

      		let allPriceEditLink = document.querySelectorAll('.editPrice');
			allPriceEditLink.forEach(
  				function(itemLink) {
   					itemLink.addEventListener('click', app.editPrice);
  				}
			);
		}
	},

	mostrar: function() {		
		if (app.allProducts != null && app.allProducts.length > 0) {
			productList.innerHTML = "";

			var array =new Array();
			var contenido="";
			for(var f=0; f < app.allProducts.length; f++) {
				if (app.allProducts[f].Mark === undefined || app.allProducts[f].Mark === null || 
					app.allProducts[f].Mark === "" || app.allProducts[f].Mark === " " ){
					app.productList.innerHTML += `
						<span class="productItemClass" data-id="${app.allProducts[f].id}" >
						${app.allProducts[f].Name}</span>`;
				} else {
					app.productList.innerHTML += `
						<span class="productItemClass" data-id="${app.allProducts[f].id}" >
						${app.allProducts[f].Name} - ${app.allProducts[f].Mark}</span>`;
				}
			}

      		const allProductLink = document.querySelectorAll('.productItemClass');
			allProductLink.forEach(
  				function(itemLink) {
   					itemLink.addEventListener('click', app.changeToProductItem);
  				}
			);
		}
	},


  	changeToProductItem: function(e) {
		let idValue;	
		if (isNaN(e)) {
			idValue = e.target.getAttribute('data-id');
		} else {
			idValue = e;
		}

    	//TODO obterner el producto con id idValue de app.allProducts 
		for(var f=0; f < app.allProducts.length; f++) {
			if (app.allProducts[f].id == idValue) {
				app.item = app.allProducts[f];
				break;
			}
		}
    	
    productItemName.innerHTML = app.item.Name;

		nameItem.innerHTML = app.item.Name;
		markItem.innerHTML = app.item.Mark;
		amountItem.innerHTML = app.item.Amount;
		weightItem.innerHTML = app.item.Weight;

		app.productEditButton.setAttribute('data-id', app.item.id);
		app.productEditButton.getElementsByTagName('use')[0].setAttribute('data-id', app.item.id)

    	// enlace para editar llevar a la pantalla de edicion
    	//rellenar cajaprecios    	
		app.mostrarPrecios(app.item.ListPrices);


		app.headerMain.classList.add('hide');
		app.headerAdd.classList.add('hide');
		app.headerProduct.classList.remove('hide');

		app.footerDiv.classList.add('hide');	

		app.productList.classList.add('hide');
		app.productInput.classList.add('hide');
		app.productItem.classList.remove('hide');
  	},

	changeToAdd: function(e) {
		
		//TODO comprobar si es un producto nuevo o edita uno
		let idValue;
		if (e !== null && e !== undefined) {
  		idValue = e.target.getAttribute('data-id');
  		app.titleVistProduct.innerHTML = "Edite";
  	} else {
			app.titleVistProduct.innerHTML = "Añade";
  	}

  	if (idValue !== undefined) {
  		app.isEdit = true;
  		//Volver a la pantalla del producto y no al inicio
      app.backToMainButton.removeEventListener('click', function(){});
			app.backToMainButton.addEventListener('click', () => {app.changeToProductItem(idValue);});

    	app.nameInput.value = app.item.Name;
			app.markInput.value = app.item.Mark;
			app.amountInput.value = app.item.Amount;
			app.weightInput.value = app.item.Weight;
  	} else {
  		app.isEdit = false;
  		//Si es un producto nuevo vuelve al inicio
  		app.backToMainButton.removeEventListener('click', function(){});
			app.backToMainButton.addEventListener('click', (event) => {			
				app.changeToMain();
			});

    	app.nameInput.value = "";
			app.markInput.value = "";
			app.amountInput.value = "";
			app.weightInput.value = "";	
  	}

		//TODO implementar
		app.headerMain.classList.add('hide');
		app.headerAdd.classList.remove('hide');
		app.headerProduct.classList.add('hide');

		app.footerDiv.classList.add('hide');	

		app.productList.classList.add('hide');
		app.productInput.classList.remove('hide');
		app.productItem.classList.add('hide');
	},

	changeToMain: function() {
		app.mostrar();

		//TODO implementar
		app.headerMain.classList.remove('hide');
		app.headerAdd.classList.add('hide');	
		app.headerProduct.classList.add('hide');	

		app.footerDiv.classList.remove('hide');	

		app.productList.classList.remove('hide');
		app.productInput.classList.add('hide');
		app.productItem.classList.add('hide');
	},

	resetIdArray: function(list) {
		debugger;
		list.forEach(function (item, index) {
			console.log(index);
			console.log(item);
			item.id = index + 1;
		});
	},

	DownloadJSON2CSV: function(objArray) {
	  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

	  var str = '';

	  for (var i = 0; i < array.length; i++) {
	    var line = '';

	    for (var index in array[i]) {
	    	if (index == 'ListPrices') {
	    		for (var indexListPrices in array[i][index]) {
	      		line += array[i][index][indexListPrices]['id'] + ',';
	      		line += array[i][index][indexListPrices]['Shop'] + ',';
	      		line += array[i][index][indexListPrices]['Price'] + ',';
	    		}		
	    	} else {	    		
	      	line += array[i][index] + ',';
	    	}
	    }

	    line.slice(0, line.Length - 1);

	    str += line + '\r\n';
	  }
	  return str;
	},

	exportBookmark: function() {   
		var text = app.DownloadJSON2CSV(localStorage.getItem(app.nameLocalStorage)); 
		var jsonArray = app.csvJSON(text);
		var m = new Date();
		var dateString = m.getUTCFullYear() +"-"+ (m.getUTCMonth()+1) +"-"+ m.getUTCDate(); 
		var filename = "comparaPrecios_" + dateString + ".csv";

		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);

		if (document.createEvent) {
		    var event = document.createEvent('MouseEvents');
		    event.initEvent('click', true, true);
		    pom.dispatchEvent(event);
		}
		else {
		    pom.click();
		}
	},
	  
	init: function() { 

		if (localStorage.getItem(app.nameLocalStorage) !== null) {
  		app.allProducts = JSON.parse(localStorage.getItem(app.nameLocalStorage));
  	}

		app.addButton.addEventListener('click', (event) => {
			app.changeToAdd();
		});

		app.productEditButton.addEventListener('click', (event) => {
			app.changeToAdd(event);
		});

		app.backToMainProductButton.addEventListener('click', (event) => {
			app.changeToMain();
		});

		app.saveProductButton.addEventListener('click', (event) => {
			app.saveProduct();
		});

		app.deleteProductButton.addEventListener('click', (event) => {		
			app.deleteProduct();
		});

		app.addPriceButton.addEventListener('click', (event) => {
			app.savePrice();
		});

		app.clearPriceButton.addEventListener('click', (event) => {
			app.cancelEditPrice();
		});
		
		var imp=document.getElementById('imp');			
		imp.addEventListener('click', function(){app.importFile()}, false);

		var exp=document.getElementById('exp');
		exp.addEventListener('click', function(){app.exportBookmark()}, true);
		

		app.mostrar();

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
			.register('service-worker.js')
			.then(function() {
				//console.log('Service Worker Registered');
			});
		}

  }
};

