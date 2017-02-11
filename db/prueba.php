<?php
// Esto le dice a PHP que usaremos cadenas UTF-8 hasta el final
mb_internal_encoding('UTF-8');
 
// Esto le dice a PHP que generaremos cadenas UTF-8
mb_http_output('UTF-8');
 

$data = json_decode(file_get_contents("php://input"));
switch ($data->file){
	case 'users.json':
		switch($data->action){
			case 'newUser':
				newUser($data);
			break;
			case 'newFavoriteMovie':
				newFavoriteMovie ($data);
			break;

			case 'deleteFavoriteMovie':
				deleteFavoriteMovie ($data);
			break;
			case 'newBookmark':
				newBookmark ($data);
			break;
			case 'deleteBookmark':
				deleteBookmark ($data);
			break;
			case 'newFavorite':
				newFavorite ($data);
			break;
			case 'deleteFavorite':
				deleteFavorite($data);
			break;
		}
	break;
	case 'cartelera.json':
		switch($data->action){
			case 'newComment':
				newComment($data);
			break;
			case 'newRating':
				newRating($data);
			break; 
			case 'updateRating':
				updateRating($data);
			break;	
		}
	break;
	case 'events.json':
		switch($data->action){
			case 'createEvent':
				createEvent($data);
			break;
			case 'goToEvent':
				goToEvent($data);
			break;
			case 'leaveEvent':
				leaveEvent($data);
			break;
		}
	break;
}

function newUser($data){
	$newData = [];
	$newData["user"] = $data->user;;
	$newData["password"] = $data->password;
	$newData["firstname"] = $data->firstname;
	$newData["lastname"] = $data->lastname;
	$newData["mail"] = $data->email;
	$newData["groups"] = [];
	$newData["favorite"] = [];
	$newData["viewed"] = [];
	$newData["bookmark"] = [];
	$file = $data->file;
	echo $file;
	//decodifica el json y lo pasamos a un array php
	$tempArray = json_decode(file_get_contents($file));
	 //añadimos los nuevos datos al array
	array_push($tempArray, $newData);
	//convierte el array php con los nuevos datos a json
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	//reemplaza los datos anteriores del archivo json con los nuevos datos
	file_put_contents($file, $jsonData);
}
function newFavoriteMovie ($data){

	$buttonPressed = $data->buttonPressed;
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	
	//New object movie
	$newMovie = [];
	$newMovie["title"] = $data->newViewedMovie;
	$newMovie["duration"] = $data->duration;
	$newMovie["genders"] = $data->genders;
		
	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$userPosition]->viewed,$newMovie);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}
function newBookmark ($data){

	$buttonPressed = $data->buttonPressed;
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	
	//New object movie
	$newMovie = [];
	$newMovie["title"] = $data->newViewedMovie;
	$newMovie["duration"] = $data->duration;
	$newMovie["genders"] = $data->genders;
		
	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$userPosition]->bookmark,$newMovie);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}
function newFavorite ($data){

	$buttonPressed = $data->buttonPressed;
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	
	//New object movie
	$newMovie = [];
	$newMovie["title"] = $data->newViewedMovie;
	$newMovie["duration"] = $data->duration;
	$newMovie["genders"] = $data->genders;
		
	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$userPosition]->favorite,$newMovie);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}

function deleteFavoriteMovie ($data){
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	$moviePosition = (int)$data->moviePosition;
	
	
	$tempArray = json_decode(file_get_contents($file));

	//unset($tempArray[$userPosition]->viewed[$moviePosition]);
	array_splice($tempArray[$userPosition]->viewed,$moviePosition,1);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}
function deleteBookmark ($data){
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	$moviePosition = (int)$data->moviePosition;
	
	
	$tempArray = json_decode(file_get_contents($file));

	//unset($tempArray[$userPosition]->viewed[$moviePosition]);
	array_splice($tempArray[$userPosition]->bookmark,$moviePosition,1);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}
function deleteFavorite ($data){
	$file = $data->file; //File to read/write

	$userPosition = (int)$data->userPosition; //Position user
	$moviePosition = (int)$data->moviePosition;
	
	
	$tempArray = json_decode(file_get_contents($file));

	//unset($tempArray[$userPosition]->viewed[$moviePosition]);
	array_splice($tempArray[$userPosition]->favorite,$moviePosition,1);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
	
}

function newComment ($data){
	$file = $data->file;

	$comment['user'] = $data->user;
	$comment['comment'] = $data->comment;

	$positionMovie = (int) $data->positionMovie;

	echo $positionMovie;


	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$positionMovie]->comments, $comment);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}

function newRating ($data){
	$file = $data->file;

	$rating['user'] = $data->user;
	$rating['rating'] = $data->rating;
	$positionMovie = (int) $data->positionMovie;

	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$positionMovie]->rating, $rating);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}
function updateRating ($data){
	$file = $data->file;
	$positionUser = (int)$data->positionUser;

	$rating['user'] = $data->user;
	$rating['rating'] = $data->rating;
	$positionMovie = (int) $data->positionMovie;

	$tempArray = json_decode(file_get_contents($file));
	array_splice($tempArray[$positionMovie]->rating,$positionUser,1);
	array_push($tempArray[$positionMovie]->rating, $rating);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}

function createEvent($data){
	$file = $data->file;
	$newEvent['id'] = $data->id;
	$newEvent['movie'] = $data->movie;
	$newEvent['cine'] = $data->cine;
	$newEvent['date'] = $data->date;
	$newEvent['hour'] = $data->hour;
	$newEvent['assistants'] = [];
	array_push($newEvent['assistants'],$data->user);
	

	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray, $newEvent);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}

function goToEvent($data){
	$file = $data->file;

	$id = (int) $data->idEvent;
	$user = $data->user;

	$tempArray = json_decode(file_get_contents($file));
	array_push($tempArray[$id]->assistants, $user);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}

function leaveEvent($data){
	$file = $data->file;

	$idEvent = (int) $data->idEvent;
	$positionUser = (int) $data->positionUser;

	$tempArray = json_decode(file_get_contents($file));
	array_splice($tempArray[$idEvent]->assistants,$positionUser,1);
	$jsonData = json_encode($tempArray,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
	file_put_contents($file, $jsonData);
}
?>