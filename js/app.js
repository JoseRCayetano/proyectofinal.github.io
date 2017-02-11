
var app = angular.module('cine',['ui.bootstrap','ngRoute','ngCookies','uiGmapgoogle-maps','ngAnimate','ngMessages']);//en el array inyectamos dependencias

app.config(['$routeProvider','uiGmapGoogleMapApiProvider',function($routeProvider,GoogleMapApiProviders) {
	$routeProvider
	.when("/",{
		templateUrl: "views/landing_page.html",
	})
	.when("/login",{
		templateUrl: "views/login.html",
	}).when("/register",{
		templateUrl: "views/register.html"
	}).when("/main",{
		templateUrl: "views/main.html"
	}).when("/post",{
		templateUrl: "db/dbController.php"
	}).when("/movie/:title",{
		templateUrl: "views/movie.html"
	}).when("/cine/:title/:cine",{
		templateUrl: "views/cine.html"
	}).when("/event/:title/:cine",{
		templateUrl: "views/createEvent.html"
	}).when("/events",{
		templateUrl: "views/showEvents.html"
	}).when("/movie-rating",{
		templateUrl: "views/movie-rating.html"
	}).when("/personal-area",{
		templateUrl: "views/personal-area.html"
	})
	.otherwise({
		redirectTo: "/",
		
	})
	GoogleMapApiProviders.configure({
		china: true
	});

}]);
//Personal Area controller
app.controller("personalAreaController",["$scope","$localStorage",function ($scope,$localStorage){
	$scope.cartelera = $localStorage.cartelera;

	//Function check view / bookmark / favorite
	$scope.check = function (category,nameMovie){
		var positionUser = $localStorage.users.map(function (user){
			return user.user;
		}).indexOf($localStorage.user);

		console.log(positionUser)
		if (category === "view"){
			var index = $localStorage.users[positionUser].viewed.map(function (movie){
				return movie.title
			}).indexOf(nameMovie);
			return index === -1 ? false : true;
		}else if(category ==="bookmark"){
			var index = $localStorage.users[positionUser].bookmark.map(function (movie){
				return movie.title;
			}).indexOf(nameMovie);
			return index === -1 ? false :  true;
		}else{
			var index = $localStorage.users[positionUser].favorite.map(function (movie){
				return movie.title;
			}).indexOf(nameMovie);
			return index === -1 ?  false : true;
		}
	}
}])

// Movie Rating Controller
app.controller("movieRatingController",["$scope","$http","$localStorage",function ($scope,$http,$localStorage){
	
	$scope.cartelera =  sumarPuntuacion($localStorage.cartelera);
	// Add score
	function sumarPuntuacion (response){
		var array = [];
		response.forEach(function (movie){
			var mov ={}
			mov.title = movie.title;
			mov.img_url = movie.img_url;
			var nVotes = movie.rating.length;
			var sum=0;
			if (nVotes !== 0){
				movie.rating.forEach(function (user){
					sum += user.rating;
				})
				mov.totalRating = sum/nVotes;

			}else{
				mov.totalRating = 0;
			}
			
			array.push(mov);
		})
		array.sort(compare);
		var columns= columnize(array,2);
		$scope.col_left = columns[0];
		$scope.col_rigth = columns[1];
		
	}
	function compare(a,b) {
		if (a.totalRating < b.totalRating )
			return 1;
		if (a.totalRating  > b.totalRating )
			return -1;
		return 0;
	}
	function columnize(input, cols) {
		var arr = [];
		arr.push(input.slice(0,Math.ceil(input.length/2)))
		arr.push(input.slice(Math.ceil(input.length/2),input.length))
		console.log(arr)
		return arr;
	}

}])

//ShowEventsController
app.controller("showEventsController",["$scope","$http","$localStorage",function ($scope,$http,$localStorage){

	$scope.eventos = $localStorage.events; // list events
	$scope.events = []; //Dates
	loadEvents($localStorage.events);
	$scope.options = {
		customClass: getDayClass,
		minDate: new Date(),
		showWeeks: true
	};

$scope.loadNewEvents = function (){
	location.reload();
}
$scope.checkUserInEvent = function (idEvent){
	var index = $scope.eventos[idEvent].assistants.indexOf($localStorage.user)
	if ( index === -1){
		return false;
	}else{
		return true;
	}
}
//Function ng-click leaveEvent
$scope.leaveEvent = function (idEvent){
	//Search user in assistants field of events, and save his position
	var userIndex = $scope.eventos[idEvent].assistants.map (function (user){
		return user;
	}).indexOf($localStorage.user)

	//If exist
	if (userIndex !== -1){
		var FormData = {
			'file': 'events.json',
			'action': 'leaveEvent',
			'idEvent': idEvent,
			'positionUser': userIndex
		}
		var method = 'POST';
			var url = 'db/prueba.php';

			$http({
				method: method,
				url: url,
				data: FormData,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			}).
			success(function(response) {
				$scope.codeStatus = response.data;
				console.log(response)
				$scope.success = true;
				$scope.eventos[idEvent].assistants.splice(userIndex,1)
			}).
			error(function(response) {
				console.log("mal")
				$scope.codeStatus = response || "Request failed";
			});
	}
}

//function ng-click goToEvent
$scope.goToEvent = function (idEvent){
	var userIndex = $scope.eventos[idEvent].assistants.map (function (user){
		return user;
	}).indexOf($localStorage.user)

	if (userIndex === -1){
		var FormData = {
			'file': 'events.json',
			'action': 'goToEvent',
			'idEvent': idEvent,
			'user': $localStorage.user
		}
		var method = 'POST';
			var url = 'db/prueba.php';

			$http({
				method: method,
				url: url,
				data: FormData,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			}).
			success(function(response) {
				$scope.codeStatus = response.data;
				console.log(response)
				$scope.success = true;
				$scope.eventos[idEvent].assistants.push($localStorage.user)
			}).
			error(function(response) {
				console.log("mal")
				$scope.codeStatus = response || "Request failed";
			});
	}

}

//Show calendar
$scope.today = function() {
	$scope.dt = new Date();
};
$scope.today();


//Load events inside $scope.events
function loadEvents(response){
	
	var dates = response.map (function (event){
		return event.date;
	});
	dates.forEach(function (date){
		$scope.events.push({date: (new Date(date)),status: 'full'});
	})
	
}
	//get class from day
	function getDayClass(data) {
		var date = data.date,
		mode = data.mode;
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i = 0; i < $scope.events.length; i++) {
				var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return $scope.events[i].status;
				}
			}
		}

		return '';
	}

//Show vents
$scope.oneAtATime = true;
$scope.status = {
	isCustomHeaderOpen: false,
	isFirstOpen: true,
	isFirstDisabled: false
};
  //To show date in pretty format
  $scope.getDate = function  (string){
  	var date = new Date(string);
  	return date.getDate()+"-"+date.getMonth()+"-"+date.getFullYear();
  }

}])

//user event controller
app.controller("createEventController",["$scope","$http","$routeParams","$localStorage",function ($scope,$http,$routeParams,$localStorage){
	$scope.movie = $routeParams.title;
	$scope.cine = $routeParams.cine;
	$scope.user = $localStorage.user;

	$scope.createEvent = function (){
		//Get last id
		$http.get('db/events.json').success(function (response){
			var index = 0; 
			$scope.success = false;
			console.log(response.length)
			if (response.length !== 0){
				var lastEvent = response.pop();
			
				index =lastEvent.id + 1;
				
			}else{
				index = 0;
			}
			//Save new Event in local
			var newEvent = {
				'id':index,
				'movie':$scope.movie,
				'cine':$scope.cine,
				'date':$scope.date,
				'hour':$scope.time.getHours()+":"+$scope.time.getMinutes(),
				'assistants':[$scope.user]
			}
			$localStorage.events.push(newEvent)
			//Save new Event in json
			var FormData = {
				'file': 'events.json',
				'action': 'createEvent',
				'id': index,
				'movie': $scope.movie,
				'cine': $scope.cine,
				'date': $scope.date,
				'hour': $scope.time.getHours()+":"+$scope.time.getMinutes(),
				'user': $scope.user
			};
			var method = 'POST';
			var url = 'db/prueba.php';
			$http({
				method: method,
				url: url,
				data: FormData,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			}).
			success(function(response) {
				$scope.codeStatus = response.data;
				console.log(response)
				$scope.success = true;
			}).
			error(function(response) {
				console.log("mal")
				$scope.codeStatus = response || "Request failed";
			});	
		})
	}




	/* Time Picker */
	$scope.time = new Date();

	$scope.hstep = 1;
	$scope.mstep = 1;

	$scope.options = {
		hstep: [1, 2, 3],
		mstep: [1, 5, 10, 15, 25, 30]
	};
	$scope.max=59;

	$scope.ismeridian = false;

	/* Date picker */
	$scope.today = function() {
		$scope.date = new Date();
	};
	$scope.today();

	

	$scope.clear = function() {
		$scope.date = null;
	};

	$scope.inlineOptions = {
		customClass: getDayClass,
		minDate: new Date(),
		showWeeks: true
	};
	//Disable days before today
	var tod = new Date();
	$scope.dateOptions = {
	    formatYear: 'yy',
	    maxDate: new Date(2020, 5, 22),
	    minDate: tod,
	    startingDay: 1
	};

  $scope.open1 = function() {
  	$scope.popup1.opened = true;
  };

  $scope.open2 = function() {
  	$scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
  	$scope.date = new Date(year, month, day);

  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
  	opened: false
  };

  $scope.popup2 = {
  	opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
  {
  	date: tomorrow,
  	status: 'full'
  },
  {
  	date: afterTomorrow,
  	status: 'partially'
  }
  ];

  function getDayClass(data) {
  	var date = data.date,
  	mode = data.mode;
  	if (mode === 'day') {
  		var dayToCheck = new Date(date).setHours(0,0,0,0);

  		for (var i = 0; i < $scope.events.length; i++) {
  			var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

  			if (dayToCheck === currentDay) {
  				return $scope.events[i].status;
  			}
  		}
  	}

  	return '';
  }

}]);

//Cine view controller
app.controller("cinemaController",["$scope","$http","$routeParams",function ($scope,$http,$routeParams){
	//Get params from route
	$scope.title = $routeParams.title;
	$scope.cine = $routeParams.cine;
	$scope.dataLoaded = false;

	$http.get("db/cartelera.json").success (function (data){
        $scope.cartelera= data;
        $scope.dataLoaded = true;
    });
    //Google map Center, options and control
    $scope.map = { 
    	center: { 
    		latitude: 37.576399699999996, 
    		longitude: -6.1021386 
    	}, zoom: 13,
    	options : {
    		scrollwheel: true
    	},
    	control: {}
    };
    //Google maps markers
    $scope.marker = {
    	id: 0,
    	coords: {
    		latitude: 37.5555,
    		longitude: -6.1021386
    	},
    	options: {
    		draggable: false
    	}
    };

 	//Get movie position
    function getMoviePosition (data,movie){
    	return data.map(function(movie){
				return movie.title;
			}).indexOf(movie);
    }
    //Get cinema position
     function getCinePosition (data,moviePos,cine){
    	return data[moviePos].cines.map(function(cine){
    			console.log(cine.name)
				return cine.name;
			}).indexOf(cine);
    }


}]);

//Controller main page user
app.controller("mainController",["$scope","$http",'$localStorage',function($scope,$http,$localStorage){
	
	$scope.dataLoaded = true;
	$scope.cartelera = $localStorage.cartelera;

    //Function viewed film
    $scope.checkFilm = function (buttonPressed,movie,duration,genders){

    	var data = $localStorage.users;
    	//$http.get("db/users.json").success(function (data){

    		var userPosition = getUserPosition(data,$localStorage.user);
    		switch (buttonPressed){
    			case 'view':

    			var moviePosition = getViewedMoviePosition(data,userPosition,movie);
		    		//Si no está lo meto
		    		if (moviePosition === -1){
		    			
		    			var method = 'POST';
		    			var url = 'db/prueba.php';
		    			var FormData = {
		    				'file': 'users.json',
		    				'action': 'newFavoriteMovie',
		    				'userPosition': userPosition,
		    				'newViewedMovie': movie,
		    				'duration': duration,
		    				'genders': genders
		    			};
		    			var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

						//dataBase.send($http,method,url,FormData,headers);
						$localStorage.users[userPosition].viewed.push({"title": movie, "duration": duration, "genders":genders })
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {
							
						}).
						error(function(response) {
							
							$scope.codeStatus = response || "Request failed";
						});

			    	}else{// If exists delete
			
			    		var method = 'POST';
			    		var url = 'db/prueba.php';
			    		var FormData = {
			    			'file': 'users.json',
			    			'action': 'deleteFavoriteMovie',
			    			'userPosition': userPosition,
			    			'moviePosition': moviePosition,
			    		};
			    		var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

						$localStorage.users[userPosition].viewed.splice(moviePosition,1);
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {
							console.log("eliminacion viewed stisfactorio")
						}).
						error(function(response) {
							$scope.codeStatus = response || "Request failed";
						});
					}
					break;

					case 'bookmark':
					var moviePosition = getBookmarkMoviePosition(data,userPosition,movie);
					//Si not exists, add
					if (moviePosition === -1){						
						var method = 'POST';
						var url = 'db/prueba.php';
						var FormData = {
							'file': 'users.json',
							'action': 'newBookmark',
							'userPosition': userPosition,
							'newViewedMovie': movie,
							'duration': duration,
							'genders': genders
						};
						var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

						$localStorage.users[userPosition].bookmark.push({"title": movie, "duration": duration, "genders":genders })
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {

						}).
						error(function(response) {
							console.log("mal")
							$scope.codeStatus = response || "Request failed";
						});

			    	}else{// if exists delete
			    		var method = 'POST';
			    		var url = 'db/prueba.php';
			    		var FormData = {
			    			'file': 'users.json',
			    			'action': 'deleteBookmark',
			    			'userPosition': userPosition,
			    			'moviePosition': moviePosition,
			    		};
			    		var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

						$localStorage.users[userPosition].bookmark.splice(moviePosition,1);
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {

						}).
						error(function(response) {
							
							$scope.codeStatus = response || "Request failed";
						});
					}
					break;
					case 'favorite':
					var moviePosition = getFavoriteMoviePosition (data,userPosition,movie);
					//Si no está lo meto
					if (moviePosition === -1){
						console.log("no esta")
						var method = 'POST';
						var url = 'db/prueba.php';
						var FormData = {
							'file': 'users.json',
							'action': 'newFavorite',
							'userPosition': userPosition,
							'newViewedMovie': movie,
							'duration': duration,
							'genders': genders
						};
						var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

						//dataBase.send($http,method,url,FormData,headers);
						$localStorage.users[userPosition].favorite.push({"title": movie, "duration": duration, "genders":genders })
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {

						}).
						error(function(response) {
							$scope.codeStatus = response || "Request failed";
						});

			    	}else{// si está se elimina
			    		console.log("si esta");
			    		var method = 'POST';
			    		var url = 'db/prueba.php';
			    		var FormData = {
			    			'file': 'users.json',
			    			'action': 'deleteFavorite',
			    			'userPosition': userPosition,
			    			'moviePosition': moviePosition,
			    		};
			    		var headers= {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
						$localStorage.users[userPosition].favorite.splice(moviePosition,1);
						$http({
							method: method,
							url: url,
							data: FormData,
							headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
						}).
						success(function(response) {

						}).
						error(function(response) {
							console.log("mal")
							$scope.codeStatus = response || "Request failed";
						});
					}
					break;

				}
			

		}

    //Get user poition
    function getUserPosition(data,username){
    	return data.map (function (users){
    				return users.user;
    			}).indexOf(username)
    }
    //Get movie position
    function getViewedMoviePosition (data,userPosition,movie){
    	return data[userPosition].viewed.map(function(movieViewed){
				return movieViewed.title;
			}).indexOf(movie);
    }
    function getBookmarkMoviePosition (data,userPosition,movie){
    	return data[userPosition].bookmark.map(function(movieViewed){
				return movieViewed.title;
			}).indexOf(movie);
    }
     function getFavoriteMoviePosition (data,userPosition,movie){
    	return data[userPosition].favorite.map(function(movieViewed){
				return movieViewed.title;
			}).indexOf(movie);
    }
    

    $scope.checkViewMovie = function (title){
    	
    	var userPosition = getUserPosition($localStorage.users,$localStorage.user);
    	var index = $localStorage.users[userPosition].viewed.map(function (movie){
    		return movie.title;
    	}).indexOf(title);
    
    	if (index === -1) {
    		return false;
    		console.log("false")
    	}else{
    		console.log("true")
    		return true;
    	}
    }

    $scope.checkBookmarkMovie = function (title){
    	
    	var userPosition = getUserPosition($localStorage.users,$localStorage.user);
    	var index = $localStorage.users[userPosition].bookmark.map(function (movie){
    		return movie.title;
    	}).indexOf(title);
    
    	if (index === -1) {
    		return false;
    		console.log("false")
    	}else{
    		console.log("true")
    		return true;
    	}
    }
    $scope.checkFavoriteMovie = function (title){
    	
    	var userPosition = getUserPosition($localStorage.users,$localStorage.user);
    	var index = $localStorage.users[userPosition].favorite.map(function (movie){
    		return movie.title;
    	}).indexOf(title);
    
    	if (index === -1) {
    		return false;
    		console.log("false")
    	}else{
    		console.log("true")
    		return true;
    	}
    }
}])

//Movie file controller
app.controller("movieController",["$scope","$http","$routeParams",'$localStorage', function ($scope,$http,$routeParams,$localStorage){
	$scope.title = $routeParams.title;
	$localStorage.movie = $routeParams.title;
	$scope.comments="";

	//Load  from file 
	$http.get("db/cartelera.json").success (function (data){
        $scope.cartelera= data;
        $scope.dataLoaded = true;

        var positionMovie = data.map (function (movie){
				return movie.title;
			}).indexOf($routeParams.title);
      
		$scope.comments = data[positionMovie].comments;

    });
	
	
   //Send new comment
    $scope.sendComment = function (comment,movie){
    	//Save in $scope.comments
    	var user = $localStorage.user;
    	$scope.comments.push({ user , comment})

    	$http.get("db/cartelera.json").success(function (data){
			var positionMovie = data.map (function (movie){
				return movie.title;
			}).indexOf(movie);
			
			var FormData = {
				'file': 'cartelera.json',
				'action': 'newComment',
				'positionMovie': positionMovie,
				'user':$localStorage.user, 
				'comment': comment
			};
			var method = 'POST';
			var url = 'db/prueba.php';
			
			$http({
				method: method,
				url: url,
				data: FormData,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			}).
			success(function(response) {
				$scope.codeStatus = response.data;
				console.log(response)
			}).
			error(function(response) {
				console.log("mal")
				$scope.codeStatus = response || "Request failed";
			});
		});
    }

}])
//Active submenu
//Active menu
app.controller("userSubmenuController",["$scope","$location",'$localStorage',function($scope,$location,$localStorage){
	$scope.userlogged= $localStorage.user; //To show who is logged
	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();

    };
}]);

//Active menu
app.controller("menuController",["$scope","$location",'$localStorage',function($scope,$location,$localStorage){
	$scope.userlogged= $localStorage.user; //To show who is logged
	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();

    };
}]);

//formRegisterController
app.controller("formRegisterController" ,['$scope','$http','$location','$localStorage',function ($scope,$http,$location,$localStorage){

	$scope.error = false;
	$scope.success = false;
	var method = 'POST';
	var url = 'db/prueba.php';
	$scope.codeStatus = "";
	$scope.save = function(user) {

		if (!checkUserName(user)){
			$scope.success = true;
			$scope.error = false;
			console.log("User metido --> "+user)
			var FormData = {
				'file': 'users.json',
				'action': 'newUser',
				'user': $scope.user, 
				'password': $scope.password,
				'firstname': $scope.firstname,
				'lastname': $scope.lastname,
				'email': $scope.email
			};

			$http({
				method: method,
				url: url,
				data: FormData,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			}).
			success(function(response) {
				$scope.codeStatus = response.data;
				console.log(response)
				
			}).
			error(function(response) {
				console.log("mal")
				$scope.codeStatus = response || "Request failed";
			});
		}
		else{
			$scope.error =true;
			$scope.success = false;
		}
	
	};

	function checkUserName (username){

			var index = $localStorage.users.map (function (user){
				return user.user;
			}).indexOf(username)

			if (index === -1){
				console.log("no esta")
				return false;
			}else{
				console.log("esta")
				return true;
			}
	}

}]);

//Login controller
app.controller("formLoginController",['$scope','$http','$location','$localStorage',function ($scope,$http,$location,$localStorage){
	//Check if credential are in db
	$scope.error = false;
	$scope.checkUser = function(){
		var url="db/users.json";
		$http.get(url).success(function (dataDb){
			checkInDb(dataDb,$scope.user,$scope.password);

		});
	}

	function checkInDb(db,user,password){
		var index = db.map(function (element){
			return element.user;
		}).indexOf(user);
		if (index != -1){
			$localStorage.user = user;
			$location.path("/main");
		}else{
			$scope.error = true;
		}
	}

}]);

//Rating controller
app.controller('ratingController',["$scope","$http","$localStorage",function ($scope,$http,$localStorage) {
	$scope.rate = 0;
	$scope.max = 10;
	$scope.isReadonly = false;

	$http.get("db/cartelera.json").success(function (data){
			//Find if user has comment before
			var positionMovie = data.map(function (movie){
				return movie.title;
			}).indexOf($localStorage.movie);

			console.log("posMov " + positionMovie)
			
			var positionUser = data[positionMovie].rating.map(function (rating){
				return rating.user;
			}).indexOf($localStorage.user);

			console.log("posUser " + positionUser)
			//If user  not comment before
			if(positionUser === -1){
				$scope.rate = 0;
			}else{
				$scope.rate = $localStorage.cartelera[positionMovie].rating[positionUser].rating
				$scope.rate = data[positionMovie].rating[positionUser].rating;

			}
	})

	$scope.hoveringOver = function(value) {
		$scope.overStar = value;
		$scope.percent = 100 * (value / $scope.max);
	};

	$scope.saveValue = function (rate){
		//save rating , busco usuario, si esta sobreescribo, si no que meta uno nuevo
	  console.log(rate);
	  var url="db/cartelera.json";
		$http.get(url).success(function (data){
			//Find if user has comment before
			var positionMovie = data.map(function (movie){
				return movie.title;
			}).indexOf($localStorage.movie);

			console.log("posMov " + positionMovie)
			
			var positionUser = data[positionMovie].rating.map(function (rating){
				return rating.user;
			}).indexOf($localStorage.user);

			console.log("posUser " + positionUser)
			//If user  not comment before
			if(positionUser === -1){
			
				var FormData = {
					'file': 'cartelera.json',
					'action': 'newRating',
					'positionMovie': positionMovie,
					'user': $localStorage.user, 
					'rating': rate
					
				};
				console.log(FormData)
				$http({
					method:'POST',
					url: 'db/prueba.php',
					data: FormData,
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				}).
				success(function(response) {
					console.log("succ")
					$scope.codeStatus = response.data;
					console.log(response)
					$localStorage.cartelera[positionMovie].rating.push({user: $localStorage.user,rating: rate})
					
					console.log($localStorage.cartelera);
				}).
				error(function(response) {
					console.log("mal")
					$scope.codeStatus = response || "Request failed";
				});
			}else{ //Update rating
				var FormData = {
					'file': 'cartelera.json',
					'action': 'updateRating',
					'positionUser':positionUser,
					'positionMovie': positionMovie,
					'user': $localStorage.user, 
					'rating': rate
					
				};
				$http({
					method: 'POST',
					url: 'db/prueba.php',
					data: FormData,
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				}).
				success(function(response) {
					$scope.codeStatus = response.data;
					console.log(response)
					$localStorage.cartelera[positionMovie].rating[positionUser].user= $localStorage.user;
					$localStorage.cartelera[positionMovie].rating[positionUser].rating =  rate;
					
					console.log($localStorage.cartelera);
				
				}).
				error(function(response) {
					console.log("mal")
					$scope.codeStatus = response || "Request failed";
				});
			}
		});

	}

	$scope.ratingStates = [
	{stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
	{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
	{stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
	{stateOn: 'glyphicon-heart'},
	{stateOff: 'glyphicon-off'}
	];
}]);


//Controller carousel
app.controller("carouselController",["$scope","$http","$localStorage", function ($scope,$http,$localStorage) {

	//Load data to localStorage ----------------------------------------
	$http.get("db/cartelera.json").success(function (response){
		$localStorage.cartelera = response;
	})
	$http.get("db/users.json").success(function (response){
		$localStorage.users = response;
	})
	$http.get("db/events.json").success(function (response){
		$localStorage.events = response;
	})

	//Config carousel
	$scope.myInterval = 5000;
	$scope.noWrapSlides = false;
	$scope.active = 0;
	var slides = $scope.slides = [];
	var currIndex = 0;

	$scope.addSlide = function() {
		slides.push({
			image: 'img/landing_carousel/'+slides.length+".jpg",
			text: ['Vive la mejor experiencia del cine','Disfruta de las mejores películas','Y de los momentos más épicos','Junto a personas de tus mismos intereses'][slides.length % 4],
			id: currIndex++
		});
	};

	$scope.randomize = function() {
		var indexes = generateIndexesArray();
		assignNewIndexesToSlides(indexes);
	};

	for (var i = 0; i < 4; i++) {
		$scope.addSlide();
	}

  // Randomize logic below

  function assignNewIndexesToSlides(indexes) {
  	for (var i = 0, l = slides.length; i < l; i++) {
  		slides[i].id = indexes.pop();
  	}
  }

  function generateIndexesArray() {
  	var indexes = [];
  	for (var i = 0; i < currIndex; ++i) {
  		indexes[i] = i;
  	}
  	return shuffle(indexes);
  }

  // http://stackoverflow.com/questions/962802#962890
  function shuffle(array) {
  	var tmp, current, top = array.length;

  	if (top) {
  		while (--top) {
  			current = Math.floor(Math.random() * (top + 1));
  			tmp = array[current];
  			array[current] = array[top];
  			array[top] = tmp;
  		}
  	}
  	return array;
  }
}])

//CUstome directive to load menu
app.directive('nglandingmenu',function(){
	return{
		restrict: 'E', // PAra custom de html
		templateUrl: 'views/landing_menu.html'
	}
})

//CUstome directive to load user menu
app.directive('usermenu',function(){
	return{
		restrict: 'E', // PAra custom de html
		templateUrl: 'views/user_menu.html'
	}
})
//CUstome directive to load navigator user menu
app.directive('navigatorusermenu',function(){
	return{
		restrict: 'E', // PAra custom de html
		templateUrl: 'views/navigator-user-menu.html'
	}
})