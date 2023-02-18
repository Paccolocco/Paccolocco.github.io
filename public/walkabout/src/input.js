const keyState = {};

//declaring key event listeners
function onKeyDown( event ) {
	event = event || window.event;
	keyState[event.keyCode || event.which] = true;
}

function onKeyUp( event ) {
	event = event || window.event;
	keyState[event.keyCode || event.which] = false;
}

//declaring resize event listeners
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

const addEvents = function()
{
	//adding event listeners
	window.addEventListener('keydown', onKeyDown, false );
	window.addEventListener('keyup', onKeyUp, false );
	window.addEventListener('resize', onWindowResize, false );	
}


export {keyState, addEvents}
