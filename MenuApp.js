var app = angular.module("MenuApp", []);

app.controller("MenuCtrl", function($scope) {
	
});


app.directive('menu', function($compile){
	var container = "<div slider class='slider' val=menuConfig.zoom></div>zoom";
	container = "<div slider class='slider' val=menuConfig.blur></div>Blur";
	container += "<div class='menu_background_container' style=':menuStyle1'><div class='menu_background' style=':menuStyle2'></div>:menuItems</div>";
	var menuHeader = "<div class='menu_header'>:header</div>";
	var menuItem = "<table class='menu_item'>" + 
	"<tr><td><div class='menu_item_name'>:itemName</div>" + 
	"<div style='position:relative'><div class='menu_item_description'>:itemDescription</div>" +
	"<div class='menu_item_price'>:itemPrice</div>" +
	"<div class='menu_dot'></div><div></td>" +
	"<td class='menu_item_icon'><div class='menu_item_image' style='background-image:url(:itemImage);'></div></td></tr></table>";
	var pageHeight = 842;
	var pageWidth = 595;

	var controllerFun = function($scope) {
		$scope.menuConfig = {};
		this.config = function (){ 
			return $scope.menuConfig;
		}
	}
	
	var linker = function(scope, element, attrs) {
		scope.menuConfig.zoom = 0.75;
		scope.menuConfig.zoom = 5;
		scope.options = {from : 0.5, to : 1.0};
		
		scope.$watch("menuData", function(newVal) {
			scope.render();
		}, true);

		scope.$watch("menuConfig", function(newVal) {
			scope.render();
		}, true);

		scope.getContent = function($fileContent){
			scope.menuData = JSON.parse($fileContent);
		};

		scope.render = function() {
			var menuStyle1 = "width: " + pageWidth + "px;";
			menuStyle1 += "height: " + pageHeight + "px;";
			menuStyle1 += "zoom: " + scope.menuConfig.zoom  + "; -moz-transform: scale(" + scope.menuConfig.zoom + ")";
			var menuStyle2 = "background-image: url(" + scope.menuData.backgroundImage + ");";
			menuStyle2 += "zoom: " + scope.menuConfig.zoom  + "; -moz-transform: scale(" + scope.menuConfig.zoom + ")";
			var menuContent = "";
			var itemContent = "";
			angular.forEach(scope.menuData.headers, function(header, i){
				menuContent += menuHeader;
				menuContent = menuContent.replace(":header", header.name);
				angular.forEach(header.items, function(item, j){
					itemContent = menuItem;
					itemContent = itemContent.replace(":itemName", item.name);
					itemContent = itemContent.replace(":itemDescription", item.description);
					itemContent = itemContent.replace(":itemPrice", item.price);
					itemContent = itemContent.replace(":itemImage", item.pic);
					menuContent += itemContent;
				});
			});
			var menuHtml = container;
			menuHtml = menuHtml.replace(":menuStyle1", menuStyle1);
			menuHtml = menuHtml.replace(":menuStyle2", menuStyle2);
			menuHtml = menuHtml.replace(":menuItems", menuContent);
			element.html(menuHtml);
			$compile(element.contents())(scope);
		}
		scope.menuData = {};
		scope.render();		
	}
	return {
		restrict: "E",
		link: linker,
		controller: controllerFun
	};
});

app.directive('slider', function () {
	return {
		restrict: "A",
		scope: {
			val : "="
		},
		require: "^menu",
		link: function (scope, element, attrs) {
			$(element).slider({
				orientation: "horizontal",
				step: 0.01,
				min: 0.5,
				max: 1,
				value: scope.val,
				slide: function( event, ui ) {
					scope.$parent.menuConfig.zoom = ui.value;
					scope.$parent.render();
				}
			});
		}
	};
});

app.directive('onReadFile', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
			var fn = $parse(attrs.onReadFile);

			element.on('change', function(onChangeEvent) {
				var reader = new FileReader();

				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, {$fileContent:onLoadEvent.target.result});
					});
				};

				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
});